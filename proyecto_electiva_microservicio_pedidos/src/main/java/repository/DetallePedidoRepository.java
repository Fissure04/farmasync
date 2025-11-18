package repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import entity.DetallePedidoEntity;

public interface DetallePedidoRepository extends JpaRepository<DetallePedidoEntity, Long> {

	List<DetallePedidoEntity> findByPedido_IdPedido(Long idPedido);

	@Query("SELECT d FROM DetallePedidoEntity d WHERE d.idProductoPedido = :idProducto")
	List<DetallePedidoEntity> findByProducto(@Param("idProducto") Long idProducto);
}
