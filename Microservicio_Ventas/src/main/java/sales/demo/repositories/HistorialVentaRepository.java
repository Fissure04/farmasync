package sales.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sales.demo.entity.HistorialVentaEntity;

public interface HistorialVentaRepository extends JpaRepository<HistorialVentaEntity, Long> {
    
    List<HistorialVentaEntity> findByVentaId(Long idVenta);

    @Query("SELECT h FROM HistorialVentaEntity h WHERE h.venta.id = :idVenta ORDER BY h.fechaEvento DESC")
    List<HistorialVentaEntity> findByVentaIdOrderByFechaEventoDesc(@Param("idVenta") Long idVenta);
    
}
