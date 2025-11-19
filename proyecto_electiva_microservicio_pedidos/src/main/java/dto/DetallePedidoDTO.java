package dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class DetallePedidoDTO {

	private Long idDetalle;

	@NotNull(message = "El ID del producto es obligatorio")
	private String idProductoPedido;

	@NotNull(message = "La cantidad es obligatoria")
	@Min(value = 1, message = "La cantidad debe ser al menos 1")
	private Integer cantidad;

	public DetallePedidoDTO() {
	}

	public DetallePedidoDTO(Long idDetalle, String idProductoPedido, Integer cantidad) {
		this.idDetalle = idDetalle;
		this.idProductoPedido = idProductoPedido;
		this.cantidad = cantidad;
	}

	public Long getIdDetalle() {
		return idDetalle;
	}

	public void setIdDetalle(Long idDetalle) {
		this.idDetalle = idDetalle;
	}

	public String getIdProductoPedido() {
		return idProductoPedido;
	}

	public void setIdProductoPedido(String idProductoPedido) {
		this.idProductoPedido = idProductoPedido;
	}

	public Integer getCantidad() {
		return cantidad;
	}

	public void setCantidad(Integer cantidad) {
		this.cantidad = cantidad;
	}

}
