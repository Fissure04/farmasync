package sales.demo.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import sales.demo.dto.DetalleVentaDTO;
import sales.demo.dto.HistorialVentaDTO;
import sales.demo.dto.VentaDTO;
import sales.demo.entity.DetalleVentaEntity;
import sales.demo.entity.HistorialVentaEntity;
import sales.demo.entity.VentaEntity;
import sales.demo.mapper.VentaMapper;
import sales.demo.repositories.DetalleVentaRepository;
import sales.demo.repositories.HistorialVentaRepository;
import sales.demo.repositories.VentaRepository;

@Service
@Transactional
public class VentaService {

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final HistorialVentaRepository historialVentaRepository;
    private final VentaMapper ventaMapper;
    private final RestTemplate restTemplate;

    // URL del microservicio de inventario
    private static final String INVENTARIO_SERVICE_URL = "http://localhost:8016/farmasync/inventario";

    public VentaService(VentaRepository ventaRepository, DetalleVentaRepository detalleVentaRepository,
            HistorialVentaRepository historialVentaRepository, VentaMapper ventaMapper, RestTemplate restTemplate) {
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.historialVentaRepository = historialVentaRepository;
        this.ventaMapper = ventaMapper;
        this.restTemplate = restTemplate;
    }

    public VentaDTO crearVenta(VentaDTO ventaDTO) {
        validarVenta(ventaDTO);

        // Verificar stock y obtener precios para cada producto
        for (DetalleVentaDTO detalle : ventaDTO.getDetallesVenta()) {
            String urlProducto = INVENTARIO_SERVICE_URL + "/" + detalle.getIdProducto();
            Map<String, Object> producto = restTemplate.getForObject(urlProducto, Map.class);
            if (producto == null) {
                throw new RuntimeException("Producto no encontrado en inventario con ID: " + detalle.getIdProducto());
            }

            int stockDisponible = (Integer) producto.get("stock");
            if (stockDisponible < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto ID: " + detalle.getIdProducto() + ". Disponible: " + stockDisponible + ", Solicitado: " + detalle.getCantidad());
            }

            // Obtener precio del producto y setearlo en el detalle
            BigDecimal precioUnitario = new BigDecimal(producto.get("precio").toString());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(precioUnitario.multiply(BigDecimal.valueOf(detalle.getCantidad())));
        }

        VentaEntity ventaEntity = ventaMapper.toEntity(ventaDTO);

        ventaEntity.setFechaVenta(LocalDate.now());

        if (ventaEntity.getTotal() == null || ventaEntity.getTotal().compareTo(BigDecimal.ZERO) == 0) {
            ventaEntity.setTotal(calcularTotalVenta(ventaDTO));
        }

        ventaEntity.getDetalles().forEach(detalle -> detalle.setVenta(ventaEntity));

        VentaEntity ventaGuardada = ventaRepository.save(ventaEntity);

        // Descontar stock en inventario para cada producto
        for (DetalleVentaDTO detalle : ventaDTO.getDetallesVenta()) {
            String urlSalida = INVENTARIO_SERVICE_URL + "/" + detalle.getIdProducto() + "/salida";
            Map<String, Integer> movimiento = Map.of("cantidad", detalle.getCantidad());
            restTemplate.postForObject(urlSalida, movimiento, Void.class);
        }

        crearHistorialVenta(ventaEntity, "Registro", ventaEntity.getIdVendedor(), "Nueva venta registrada");
        return ventaMapper.toDTO(ventaGuardada);
    }

    @Transactional(readOnly = true)
    public VentaDTO obtenerVentaPorId(Long id) {
        VentaEntity venta = ventaRepository.findById(id).orElseThrow(() -> new RuntimeException("Venta no encontrada con el ID: " + id));

        return ventaMapper.toDTO(venta);
    }

    @Transactional(readOnly = true)
    public List<VentaDTO> obtenerTodasLasVentas() {
        List<VentaEntity> ventas = ventaRepository.findAll();
        return ventaMapper.toDTOList(ventas);
    }

    public VentaDTO actualizarVenta(Long id, VentaDTO ventaDTO) {
        VentaEntity ventaExistente = ventaRepository.findById(id).orElseThrow(() -> new RuntimeException("Venta no encontrada con el ID: " + id));

        ventaExistente.setIdVendedor(ventaDTO.getIdVendedor());
        ventaExistente.setIdCliente(ventaDTO.getIdCliente());
        ventaExistente.setTotal(ventaDTO.getTotal());

        if (ventaDTO.getDetallesVenta() != null && !ventaDTO.getDetallesVenta().isEmpty()) {
            ventaExistente.getDetalles().clear();
            
            ventaDTO.getDetallesVenta().forEach(detalleDTO -> {
                DetalleVentaEntity detalle = ventaMapper.detalleToEntity(detalleDTO, ventaExistente);
                detalle.setVenta(ventaExistente);
                ventaExistente.getDetalles().add(detalle);
            });
        }

        VentaEntity ventaActualizada = ventaRepository.save(ventaExistente);

        crearHistorialVenta(ventaExistente, "Actualización", id, "Venta actualizada");

        return ventaMapper.toDTO(ventaActualizada);
    }

    public void eliminarVenta(Long id) {
        VentaEntity venta = ventaRepository.findById(id).orElseThrow(() -> new RuntimeException("Venta no encontrada con el ID: " + id));

        ventaRepository.delete(venta);
    }

    @Transactional(readOnly = true)
    public List<HistorialVentaDTO> obtenerHistorialPorVentaId(Long idVenta) {
        if (!ventaRepository.existsById(idVenta)) {
            throw new RuntimeException("Venta no encontrada con el ID: " + idVenta);
        }
        
        List<HistorialVentaEntity> historial = historialVentaRepository.findByVentaIdOrderByFechaEventoDesc(idVenta);
        return historial.stream().map(ventaMapper::toHistorialVentaDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DetalleVentaDTO> obtenerDetallesPorVentaId(Long idVenta) {
        if (!ventaRepository.existsById(idVenta)) {
            throw new RuntimeException("Venta no encontrada con el ID: " + idVenta);
        }

        List<DetalleVentaEntity> detalles = detalleVentaRepository.findByVentaId(idVenta);
        return detalles.stream().map(ventaMapper::toDetalleDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VentaDTO> obtenerVentasPorClienteId(Long idCliente) {
        List<VentaEntity> ventas = ventaRepository.findByIdCliente(idCliente);
        return ventaMapper.toDTOList(ventas);
    }

    @Transactional(readOnly = true)
    public List<VentaDTO> obtenerVentasPorVendedorId(Long idVendedor) {
        List<VentaEntity> ventas = ventaRepository.findByIdVendedor(idVendedor);
        return ventaMapper.toDTOList(ventas);
    }

    @Transactional(readOnly = true)
    public List<VentaDTO> obtenerVentasPorRangoFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        List<VentaEntity> ventas = ventaRepository.findByFechaVentaBetween(fechaInicio, fechaFin);
        return ventaMapper.toDTOList(ventas);
    }

    private void validarVenta(VentaDTO ventaDTO) {
        if (ventaDTO.getDetallesVenta() == null || ventaDTO.getDetallesVenta().isEmpty()) {
            throw new IllegalArgumentException("La venta debe tener al menos un producto.");
        }

        boolean cantidadesInvalidas = ventaDTO.getDetallesVenta().stream()
            .anyMatch(detalle -> detalle.getCantidad() == null || detalle.getCantidad() <= 0);

        if (cantidadesInvalidas) {
            throw new IllegalArgumentException("Todas las cantidades de los productos deben ser mayores a cero.");
        }

        long productosDuplicados = ventaDTO.getDetallesVenta().stream()
            .map(DetalleVentaDTO::getIdProducto).distinct().count();

        if (productosDuplicados != ventaDTO.getDetallesVenta().size()) {
            throw new IllegalArgumentException("No se permiten productos duplicados en la venta.");
        }
    }

    private void crearHistorialVenta(VentaEntity venta, String tipoEvento, Long idUsuario, String observacion) {
        HistorialVentaEntity historial = new HistorialVentaEntity();
        historial.setVenta(venta);
        historial.setFechaEvento(LocalDate.now());
        historial.setTipoEvento(tipoEvento);
        historial.setIdUsuario(idUsuario);
        historial.setObservacion(observacion);

        historialVentaRepository.save(historial);
    } 

    private BigDecimal calcularTotalVenta(VentaDTO ventaDTO) {
        return ventaDTO.getDetallesVenta().stream()
            .map(detalle -> detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}
