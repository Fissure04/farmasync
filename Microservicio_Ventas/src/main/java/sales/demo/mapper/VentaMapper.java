package sales.demo.mapper;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import sales.demo.dto.DetalleVentaDTO;
import sales.demo.dto.HistorialVentaDTO;
import sales.demo.dto.VentaDTO;
import sales.demo.entity.DetalleVentaEntity;
import sales.demo.entity.HistorialVentaEntity;
import sales.demo.entity.VentaEntity;

@Component
public class VentaMapper {
    
    public VentaDTO toDTO(VentaEntity entity) {
        if (entity == null)
            return null;
        
        List<DetalleVentaDTO> detallesDTO = entity.getDetalles().stream().map(this::toDetalleDTO).collect(Collectors.toList());

        return new VentaDTO(entity.getId(), entity.getIdCliente(),
                entity.getFechaVenta(), entity.getTotal(), detallesDTO);
    }

    public VentaEntity toEntity(VentaDTO dto) {
        if (dto == null)
            return null;

        VentaEntity entity = new VentaEntity();
        entity.setId(dto.getId());
        entity.setIdCliente(dto.getIdCliente());
        entity.setFechaVenta(LocalDate.now());
        entity.setTotal(dto.getTotal());

        if (dto.getDetallesVenta() != null) {
            List<DetalleVentaEntity> detalles = dto.getDetallesVenta().stream()
            .map(detalleDTO -> detalleToEntity(detalleDTO, entity)).collect(Collectors.toList());
            entity.setDetalles(detalles);
        }
        return entity;
    }

    public DetalleVentaDTO toDetalleDTO(DetalleVentaEntity entity) {
        if (entity == null)
            return null;

        return new DetalleVentaDTO(entity.getId(), entity.getIdProducto(), entity.getCantidad(),
                entity.getPrecioUnitario(), entity.getSubtotal());
    }

    public DetalleVentaEntity detalleToEntity(DetalleVentaDTO dto, VentaEntity venta) {
        if (dto == null)
            return null;

        DetalleVentaEntity entity = new DetalleVentaEntity();
        entity.setId(dto.getId());
        entity.setIdProducto(dto.getIdProducto());
        entity.setCantidad(dto.getCantidad());
        entity.setPrecioUnitario(dto.getPrecioUnitario());
        entity.setSubtotal(dto.getSubtotal());
        entity.setVenta(venta);
        return entity;
    }

    public HistorialVentaDTO toHistorialVentaDTO(HistorialVentaEntity entity) {
        if (entity == null)
            return null;

        return new HistorialVentaDTO(entity.getId(), entity.getVenta().getId(), entity.getFechaEvento(),
                entity.getTipoEvento(), entity.getObservacion());
    }

    public List<VentaDTO> toDTOList(List<VentaEntity> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

}
