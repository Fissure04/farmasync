package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import dto.DetallePedidoDTO;
import dto.HistorialEstadoDTO;
import dto.PedidoDTO;
import entity.DetallePedidoEntity;
import entity.EstadoPedido;
import entity.HistorialEstadoPedidoEntity;
import entity.PedidoEntity;
import exceptions.PedidoBusinessException;
import exceptions.PedidoNotFoundException;
import mapper.PedidoMapper;
import repository.DetallePedidoRepository;
import repository.HistorialPedidoRepository;
import repository.NewPedidoRepository;

// Java Standard Library
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class PedidoService {

	private final NewPedidoRepository pedidoRepository;
	// private final DetallePedidoRepository detallePedidoRepository;
	private final HistorialPedidoRepository historialRepository;
	private final PedidoMapper pedidoMapper;
	private final RestTemplate restTemplate;

	private static final String INVENTARIO_SERVICE_URL = "http://localhost:8016/farmasync/inventario";

	public PedidoService(NewPedidoRepository pedidoRepository, DetallePedidoRepository detallePedidoRepository,
			HistorialPedidoRepository historialRepository, PedidoMapper pedidoMapper, RestTemplate restTemplate) {
		this.pedidoRepository = pedidoRepository;
		this.historialRepository = historialRepository;
		this.pedidoMapper = pedidoMapper;
		this.restTemplate = restTemplate;
	}

	public PedidoDTO crearPedido(PedidoDTO pedidoDTO) {
		validarPedido(pedidoDTO);

		for (DetallePedidoDTO detalle : pedidoDTO.getDetalles()) {
			String urlProducto = INVENTARIO_SERVICE_URL + "/" + detalle.getIdProductoPedido();
			try {
				@SuppressWarnings("unchecked")
				Map<String, Object> producto = restTemplate.getForObject(urlProducto, Map.class);
				if (producto == null) {
					throw new PedidoBusinessException(
							"Producto no encontrado en inventario con ID: " + detalle.getIdProductoPedido());
				}

			} catch (HttpClientErrorException.NotFound nf) {
				throw new PedidoBusinessException(
						"Producto no encontrado en inventario con ID: " + detalle.getIdProductoPedido());
			} catch (Exception ex) {
				throw new PedidoBusinessException("Error al consultar inventario para producto ID: "
						+ detalle.getIdProductoPedido() + " -> " + ex.getMessage());
			}
		}

		PedidoEntity pedidoEntity = pedidoMapper.toEntity(pedidoDTO);

		pedidoEntity.setFechaPedido(LocalDateTime.now());

		if (pedidoEntity.getEstado() == null) {
			pedidoEntity.setEstado(EstadoPedido.PENDIENTE);
		}
		if (pedidoEntity.getTotal() == null || pedidoEntity.getTotal().compareTo(BigDecimal.ZERO) == 0) {
			pedidoEntity.setTotal(calcularTotalPedido(pedidoDTO));
		}

		pedidoEntity.getDetalles().forEach(detalle -> detalle.setPedido(pedidoEntity));

		PedidoEntity pedidoGuardado = pedidoRepository.save(pedidoEntity);

		for (DetallePedidoDTO detalle : pedidoDTO.getDetalles()) {
			String urlEntrada = INVENTARIO_SERVICE_URL + "/" + detalle.getIdProductoPedido() + "/entrada";
			Map<String, Integer> movimiento = Map.of("cantidad", detalle.getCantidad());
			try {
				restTemplate.postForObject(urlEntrada, movimiento, Void.class);
			} catch (Exception ex) {
				
				throw new PedidoBusinessException(
						"No fue posible registrar la entrada en inventario para el producto ID: "
								+ detalle.getIdProductoPedido() + ". Error: " + ex.getMessage());
			}
		}

		crearRegistroHistorial(pedidoGuardado, pedidoGuardado.getEstado(), pedidoGuardado.getIdUsuarioCreador(),
				"Pedido creado");

		return pedidoMapper.toDTO(pedidoGuardado);
	}

	@Transactional(readOnly = true)
	public PedidoDTO obtenerPedidoPorId(Long id) {
		PedidoEntity pedido = pedidoRepository.findById(id).orElseThrow(() -> new PedidoNotFoundException(id));

		return pedidoMapper.toDTO(pedido);
	}

	@Transactional(readOnly = true)
	public List<PedidoDTO> listarTodosPedidos() {
		List<PedidoEntity> pedidos = pedidoRepository.findAll();
		return pedidoMapper.toDTOList(pedidos);
	}

	public PedidoDTO actualizarPedido(Long id, PedidoDTO pedidoDTO) {
		PedidoEntity pedidoExistente = pedidoRepository.findById(id).orElseThrow(() -> new PedidoNotFoundException(id));

		if (pedidoExistente.getEstado() == EstadoPedido.ENTREGADO
				|| pedidoExistente.getEstado() == EstadoPedido.CANCELADO) {
			throw new PedidoBusinessException(
					"No se puede actualizar un pedido con estado: " + pedidoExistente.getEstado());
		}

		pedidoExistente.setIdProveedor(pedidoDTO.getIdProveedor());
		pedidoExistente.setObservaciones(pedidoDTO.getObservaciones());
		pedidoExistente.setFechaEntrega(pedidoDTO.getFechaEntrega());
		pedidoExistente.setTotal(pedidoDTO.getTotal());

		if (pedidoDTO.getDetalles() != null && !pedidoDTO.getDetalles().isEmpty()) {
			pedidoExistente.getDetalles().clear();

			pedidoDTO.getDetalles().forEach(detalleDTO -> {
				DetallePedidoEntity detalle = pedidoMapper.detalleToEntity(detalleDTO, pedidoExistente);
				pedidoExistente.getDetalles().add(detalle);
			});
		}

		PedidoEntity pedidoActualizado = pedidoRepository.save(pedidoExistente);

		crearRegistroHistorial(pedidoActualizado, pedidoActualizado.getEstado(), pedidoDTO.getIdUsuarioCreador(),
				"Pedido actualizado");

		return pedidoMapper.toDTO(pedidoActualizado);
	}

	public void eliminarPedido(Long id) {
		PedidoEntity pedido = pedidoRepository.findById(id).orElseThrow(() -> new PedidoNotFoundException(id));

		if (pedido.getEstado() == EstadoPedido.EN_PROCESO || pedido.getEstado() == EstadoPedido.ENVIADO) {
			throw new PedidoBusinessException("No se puede eliminar un pedido en estado: " + pedido.getEstado());
		}

		pedidoRepository.delete(pedido);
	}

	public PedidoDTO cambiarEstadoPedido(Long id, EstadoPedido nuevoEstado, Long idUsuario, String observaciones) {
		PedidoEntity pedido = pedidoRepository.findById(id).orElseThrow(() -> new PedidoNotFoundException(id));

		validarTransicionEstado(pedido.getEstado(), nuevoEstado);

		EstadoPedido estadoAnterior = pedido.getEstado();
		pedido.setEstado(nuevoEstado);

		if (nuevoEstado == EstadoPedido.ENTREGADO) {
			pedido.setFechaEntrega(LocalDate.now());
		}

		PedidoEntity pedidoActualizado = pedidoRepository.save(pedido);

		crearRegistroHistorial(pedidoActualizado, nuevoEstado, idUsuario,
				observaciones != null ? observaciones : "Cambio de estado: " + estadoAnterior + " → " + nuevoEstado);

		return pedidoMapper.toDTO(pedidoActualizado);
	}

	@Transactional(readOnly = true)
	public List<HistorialEstadoDTO> obtenerHistorialPedido(Long idPedido) {
		// Verificar que el pedido existe
		if (!pedidoRepository.existsById(idPedido)) {
			throw new PedidoNotFoundException(idPedido);
		}

		List<HistorialEstadoPedidoEntity> historial = historialRepository
				.findByPedido_IdPedidoOrderByFechaDesc(idPedido);

		return historial.stream().map(pedidoMapper::historialToDTO).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<PedidoDTO> buscarPedidosPorProveedor(Long idProveedor) {
		List<PedidoEntity> pedidos = pedidoRepository.findByIdProveedor(idProveedor);
		return pedidoMapper.toDTOList(pedidos);
	}

	@Transactional(readOnly = true)
	public List<PedidoDTO> buscarPedidosPorEstado(EstadoPedido estado) {
		List<PedidoEntity> pedidos = pedidoRepository.findByEstado(estado);
		return pedidoMapper.toDTOList(pedidos);
	}

	@Transactional(readOnly = true)
	public List<PedidoDTO> buscarPedidosPendientes() {
		List<PedidoEntity> pedidos = pedidoRepository.findPedidosPendientes();
		return pedidoMapper.toDTOList(pedidos);
	}

	private void validarPedido(PedidoDTO pedidoDTO) {
		if (pedidoDTO.getDetalles() == null || pedidoDTO.getDetalles().isEmpty()) {
			throw new PedidoBusinessException("El pedido debe contener al menos un producto");
		}

		boolean cantidadesInvalidas = pedidoDTO.getDetalles().stream()
				.anyMatch(detalle -> detalle.getCantidad() == null || detalle.getCantidad() <= 0);

		if (cantidadesInvalidas) {
			throw new PedidoBusinessException("Las cantidades de los productos deben ser mayores a cero");
		}

		long productosUnicos = pedidoDTO.getDetalles().stream().map(DetallePedidoDTO::getIdProductoPedido).distinct()
				.count();

		if (productosUnicos != pedidoDTO.getDetalles().size()) {
			throw new PedidoBusinessException("El pedido contiene productos duplicados");
		}
	}

	private void validarTransicionEstado(EstadoPedido estadoActual, EstadoPedido nuevoEstado) {

		Map<EstadoPedido, List<EstadoPedido>> transicionesValidas = new HashMap<>();
		transicionesValidas.put(EstadoPedido.PENDIENTE, Arrays.asList(EstadoPedido.EN_PROCESO, EstadoPedido.CANCELADO));
		transicionesValidas.put(EstadoPedido.EN_PROCESO, Arrays.asList(EstadoPedido.ENVIADO, EstadoPedido.CANCELADO));
		transicionesValidas.put(EstadoPedido.ENVIADO, Arrays.asList(EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO));
		transicionesValidas.put(EstadoPedido.ENTREGADO, Collections.emptyList());
		transicionesValidas.put(EstadoPedido.CANCELADO, Collections.emptyList());

		List<EstadoPedido> estadosPermitidos = transicionesValidas.get(estadoActual);

		if (estadosPermitidos == null || !estadosPermitidos.contains(nuevoEstado)) {
			throw new PedidoBusinessException(
					String.format("No se puede cambiar de estado %s a %s", estadoActual, nuevoEstado));
		}
	}

	private void crearRegistroHistorial(PedidoEntity pedido, EstadoPedido estado, Long idUsuario,
			String observaciones) {
		HistorialEstadoPedidoEntity historial = new HistorialEstadoPedidoEntity();
		historial.setPedido(pedido);
		historial.setEstado(estado);
		historial.setIdUsuario(idUsuario);
		historial.setObservaciones(observaciones);
		historial.setFecha(LocalDateTime.now());

		historialRepository.save(historial);
	}

	private BigDecimal calcularTotalPedido(PedidoDTO pedidoDTO) {

		if (pedidoDTO.getTotal() != null && pedidoDTO.getTotal().compareTo(BigDecimal.ZERO) > 0) {
			return pedidoDTO.getTotal();
		}
		return BigDecimal.ZERO;
	}

}
