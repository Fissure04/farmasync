package com.farmacia.pedidos.mapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.farmacia.pedidos.dto.DetallePedidoDTO;
import com.farmacia.pedidos.dto.HistorialEstadoDTO;
import com.farmacia.pedidos.dto.PedidoDTO;
import com.farmacia.pedidos.entity.DetallePedidoEntity;
import com.farmacia.pedidos.entity.EstadoPedido;
import com.farmacia.pedidos.entity.HistorialEstadoPedidoEntity;
import com.farmacia.pedidos.entity.PedidoEntity;

@Component
public class PedidoMapper {

	public PedidoDTO toDTO(PedidoEntity entity) {
		if (entity == null)
			return null;

		List<DetallePedidoDTO> detallesDTO = entity.getDetalles().stream().map(this::detalleToDTO)
				.collect(Collectors.toList());

		return new PedidoDTO(entity.getIdPedido(), entity.getIdProveedor(), entity.getIdUsuarioCreador(),
				entity.getEstado(), entity.getObservaciones(), entity.getFechaPedido(), entity.getFechaEntrega(),
				entity.getTotal(), detallesDTO);
	}

	public PedidoEntity toEntity(PedidoDTO dto) {
		if (dto == null)
			return null;

		PedidoEntity entity = new PedidoEntity();
		entity.setIdProveedor(dto.getIdProveedor());
		entity.setIdUsuarioCreador(dto.getIdUsuarioCreador());
		entity.setEstado(dto.getEstado() != null ? dto.getEstado() : EstadoPedido.PENDIENTE);
		entity.setObservaciones(dto.getObservaciones());
		entity.setFechaPedido(LocalDateTime.now());
		entity.setFechaEntrega(dto.getFechaEntrega());
		entity.setTotal(dto.getTotal());

		if (dto.getDetalles() != null) {
			List<DetallePedidoEntity> detalles = dto.getDetalles().stream()
					.map(detalleDTO -> detalleToEntity(detalleDTO, entity)).collect(Collectors.toList());
			entity.setDetalles(detalles);
		}

		return entity;
	}

	public DetallePedidoDTO detalleToDTO(DetallePedidoEntity entity) {
		if (entity == null)
			return null;

		return new DetallePedidoDTO(entity.getIdDetalle(), entity.getIdProductoPedido(), entity.getCantidad());
	}

	public DetallePedidoEntity detalleToEntity(DetallePedidoDTO dto, PedidoEntity pedido) {
		if (dto == null)
			return null;

		DetallePedidoEntity entity = new DetallePedidoEntity();
		entity.setPedido(pedido);
		entity.setIdProductoPedido(dto.getIdProductoPedido());
		entity.setCantidad(dto.getCantidad());

		return entity;
	}

	public HistorialEstadoDTO historialToDTO(HistorialEstadoPedidoEntity entity) {
		if (entity == null)
			return null;

		return new HistorialEstadoDTO(entity.getIdHistorial(), entity.getEstado(), entity.getIdUsuario(),
				entity.getObservaciones(), entity.getFecha());
	}

	public List<PedidoDTO> toDTOList(List<PedidoEntity> entities) {
		return entities.stream().map(this::toDTO).collect(Collectors.toList());
	}
}
