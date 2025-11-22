package com.farmacia.pedidos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.farmacia.pedidos.entity.EstadoPedido;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class PedidoDTO {

	private Long idPedido;

	@NotNull(message = "El ID del proveedor es obligatorio")
	private Long idProveedor;

	@NotNull(message = "El ID del usuario creador es obligatorio")
	private Long idUsuarioCreador;

	@NotNull(message = "El estado es obligatorio")
	private EstadoPedido estado;

	private String observaciones;

	private LocalDateTime fechaPedido;

	@Future(message = "La fecha de entrega debe ser futura")
	private LocalDate fechaEntrega;

	@NotNull(message = "El total es obligatorio")
	@DecimalMin(value = "0.0", inclusive = false, message = "El total debe ser mayor a cero")
	private BigDecimal total;

	@NotEmpty(message = "Debe incluir al menos un detalle de pedido")
	private List<DetallePedidoDTO> detalles;

	public PedidoDTO() {
	}

	public PedidoDTO(Long idPedido, Long idProveedor, Long idUsuarioCreador, EstadoPedido estado, String observaciones,
			LocalDateTime fechaPedido, LocalDate fechaEntrega, BigDecimal total, List<DetallePedidoDTO> detalles) {
		this.idPedido = idPedido;
		this.idProveedor = idProveedor;
		this.idUsuarioCreador = idUsuarioCreador;
		this.estado = estado;
		this.observaciones = observaciones;
		this.fechaPedido = fechaPedido;
		this.fechaEntrega = fechaEntrega;
		this.total = total;
		this.detalles = detalles != null ? detalles : new ArrayList<>();
	}

	public Long getIdPedido() {
		return idPedido;
	}

	public void setIdPedido(Long idPedido) {
		this.idPedido = idPedido;
	}

	public Long getIdProveedor() {
		return idProveedor;
	}

	public void setIdProveedor(Long idProveedor) {
		this.idProveedor = idProveedor;
	}

	public Long getIdUsuarioCreador() {
		return idUsuarioCreador;
	}

	public void setIdUsuarioCreador(Long idUsuarioCreador) {
		this.idUsuarioCreador = idUsuarioCreador;
	}

	public EstadoPedido getEstado() {
		return estado;
	}

	public void setEstado(EstadoPedido estado) {
		this.estado = estado;
	}

	public String getObservaciones() {
		return observaciones;
	}

	public void setObservaciones(String observaciones) {
		this.observaciones = observaciones;
	}

	public LocalDateTime getFechaPedido() {
		return fechaPedido;
	}

	public void setFechaPedido(LocalDateTime fechaPedido) {
		this.fechaPedido = fechaPedido;
	}

	public LocalDate getFechaEntrega() {
		return fechaEntrega;
	}

	public void setFechaEntrega(LocalDate fechaEntrega) {
		this.fechaEntrega = fechaEntrega;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public List<DetallePedidoDTO> getDetalles() {
		return detalles;
	}

	public void setDetalles(List<DetallePedidoDTO> detalles) {
		this.detalles = detalles;
	}
	
	
}
