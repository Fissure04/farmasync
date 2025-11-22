package com.farmacia.pedidos.dto;

import java.time.LocalDateTime;

import com.farmacia.pedidos.entity.EstadoPedido;

public class HistorialEstadoDTO {

	private Long idHistorial;
	private EstadoPedido estado;
	private Long idUsuario;
	private String observaciones;
	private LocalDateTime fecha;

	public HistorialEstadoDTO() {
	}

	public HistorialEstadoDTO(Long idHistorial, EstadoPedido estado, Long idUsuario, String observaciones,
			LocalDateTime fecha) {
		this.idHistorial = idHistorial;
		this.estado = estado;
		this.idUsuario = idUsuario;
		this.observaciones = observaciones;
		this.fecha = fecha;
	}

	public Long getIdHistorial() {
		return idHistorial;
	}

	public void setIdHistorial(Long idHistorial) {
		this.idHistorial = idHistorial;
	}

	public EstadoPedido getEstado() {
		return estado;
	}

	public void setEstado(EstadoPedido estado) {
		this.estado = estado;
	}

	public Long getIdUsuario() {
		return idUsuario;
	}

	public void setIdUsuario(Long idUsuario) {
		this.idUsuario = idUsuario;
	}

	public String getObservaciones() {
		return observaciones;
	}

	public void setObservaciones(String observaciones) {
		this.observaciones = observaciones;
	}

	public LocalDateTime getFecha() {
		return fecha;
	}

	public void setFecha(LocalDateTime fecha) {
		this.fecha = fecha;
	}

}
