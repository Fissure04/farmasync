package com.farmacia.pedidos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.farmacia.pedidos.entity.HistorialEstadoPedidoEntity;

public interface HistorialPedidoRepository extends JpaRepository<HistorialEstadoPedidoEntity, Long> {

	List<HistorialEstadoPedidoEntity> findByPedido_IdPedidoOrderByFechaDesc(Long idPedido);

	@Query("SELECT h FROM HistorialEstadoPedidoEntity h WHERE h.pedido.idPedido = :idPedido ORDER BY h.fecha DESC")
	List<HistorialEstadoPedidoEntity> obtenerHistorialPedido(@Param("idPedido") Long idPedido);
}
