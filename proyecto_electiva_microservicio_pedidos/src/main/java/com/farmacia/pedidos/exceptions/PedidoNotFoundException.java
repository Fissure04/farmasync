package com.farmacia.pedidos.exceptions;

public class PedidoNotFoundException extends RuntimeException {

	public PedidoNotFoundException(Long id) {
		super("Pedido no encontrado con ID: " + id);
	}
}
