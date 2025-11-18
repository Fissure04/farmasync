package repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import entity.EstadoPedido;
import entity.PedidoEntity;

public interface NewPedidoRepository extends JpaRepository<PedidoEntity, Long> {

	List<PedidoEntity> findByIdProveedor(Long idProveedor);

	List<PedidoEntity> findByEstado(EstadoPedido estado);

	List<PedidoEntity> findByIdUsuarioCreador(Long idUsuario);

	@Query("SELECT p FROM PedidoEntity p WHERE p.fechaPedido BETWEEN :fechaInicio AND :fechaFin")
	List<PedidoEntity> findByFechaPedidoBetween(@Param("fechaInicio") LocalDateTime fechaInicio,
			@Param("fechaFin") LocalDateTime fechaFin);

	@Query("SELECT p FROM PedidoEntity p WHERE p.estado IN ('PENDIENTE', 'EN_PROCESO', 'ENVIADO') ORDER BY p.fechaPedido DESC")
	List<PedidoEntity> findPedidosPendientes();
}
