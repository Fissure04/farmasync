package com.farmacia.pedidos.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "PEDIDOS")
public class PedidoEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_pedido")
	private Long idPedido;

	@Column(name = "observaciones", length = 500)
	private String observaciones;

	@Column(name = "id_proveedor", nullable = false)
	private Long idProveedor;

	@Column(name = "id_usuario_creador", nullable = false)
	private Long idUsuarioCreador;

	@Enumerated(EnumType.STRING)
	@Column(name = "estado", nullable = false)
	private EstadoPedido estado;

	@CreationTimestamp
	@Column(name = "fecha_pedido", nullable = false, updatable = false)
	private LocalDateTime fechaPedido;

	@Column(name = "fecha_entrega")
	private LocalDate fechaEntrega;

	@Column(name = "total", precision = 10, scale = 2, nullable = false)
	private BigDecimal total;

	@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<DetallePedidoEntity> detalles = new ArrayList<>();

	@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<HistorialEstadoPedidoEntity> historial = new ArrayList<>();

	public PedidoEntity() {
	}

	public void addDetalle(DetallePedidoEntity detalle) {
		detalles.add(detalle);
		detalle.setPedido(this);
	}

	public Long getIdPedido() {
		return idPedido;
	}

	public void setIdPedido(Long idPedido) {
		this.idPedido = idPedido;
	}

	public String getObservaciones() {
		return observaciones;
	}

	public void setObservaciones(String observaciones) {
		this.observaciones = observaciones;
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

	public List<DetallePedidoEntity> getDetalles() {
		return detalles;
	}

	public void setDetalles(List<DetallePedidoEntity> detalles) {
		this.detalles = detalles;
	}

	public List<HistorialEstadoPedidoEntity> getHistorial() {
		return historial;
	}

	public void setHistorial(List<HistorialEstadoPedidoEntity> historial) {
		this.historial = historial;
	}

	public void removeDetalle(DetallePedidoEntity detalle) {
		detalles.remove(detalle);
		detalle.setPedido(null);
	}

	@PrePersist 
	protected void onCreate() {
		if (fechaPedido == null) {
			fechaPedido = LocalDateTime.now();
		}
		if (estado == null) {
			estado = EstadoPedido.PENDIENTE;
		}
	}
}
