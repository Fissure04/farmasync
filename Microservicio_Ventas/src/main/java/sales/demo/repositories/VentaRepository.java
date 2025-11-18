package sales.demo.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sales.demo.entity.VentaEntity;

public interface VentaRepository extends JpaRepository<VentaEntity, Long> {

    List<VentaEntity> findByIdCliente(Long idCliente);

    List<VentaEntity> findByIdVendedor(Long idVendedor);

    @Query("SELECT v FROM VentaEntity v WHERE v.fechaVenta BETWEEN :fechaInicio AND :fechaFin")
    List<VentaEntity> findByFechaVentaBetween(@Param("fechaInicio") LocalDate fechaInicio, 
        @Param("fechaFin") LocalDate fechaFin);

}