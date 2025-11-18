package sales.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import sales.demo.entity.DetalleVentaEntity;

public interface DetalleVentaRepository extends JpaRepository<DetalleVentaEntity, Long> {
    
    List<DetalleVentaEntity> findByVentaId(Long idVenta);
    
}
