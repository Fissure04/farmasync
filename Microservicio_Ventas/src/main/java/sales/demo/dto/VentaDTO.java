package sales.demo.dto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Schema(description = "Información de una venta")
public class VentaDTO {

    @Schema(description = "ID de la venta", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "ID del vendedor", example = "2", nullable = false)
    private Long idVendedor;

    @Schema(description = "ID del cliente", example = "3", nullable = false)
    private Long idCliente;

    @Schema(description = "Fecha de la venta", example = "2024-06-15", nullable = false, accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDate fechaVenta;

    @Schema(description = "Total de la venta", example = "1500.75", nullable = false, minimum = "0.0", accessMode = Schema.AccessMode.READ_ONLY)
    private BigDecimal total;

    @Schema(description = "Detalles de la venta", nullable = false)
    @NotEmpty(message = "La venta debe tener al menos un detalle")
    private List<DetalleVentaDTO> detallesVenta;

    public VentaDTO() {
    }

    public VentaDTO(Long id, Long idVendedor, Long idCliente, LocalDate fechaVenta, BigDecimal total, List<DetalleVentaDTO> detallesVenta) {
        this.id = id;
        this.idVendedor = idVendedor;
        this.idCliente = idCliente;
        this.fechaVenta = fechaVenta;
        this.total = total;
        this.detallesVenta = detallesVenta != null ? detallesVenta : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdVendedor() {
        return idVendedor;
    }

    public void setIdVendedor(Long idVendedor) {
        this.idVendedor = idVendedor;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public LocalDate getFechaVenta() {
        return fechaVenta;
    }

    public void setFechaVenta(LocalDate fechaVenta) {
        this.fechaVenta = fechaVenta;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public List<DetalleVentaDTO> getDetallesVenta() {
        return detallesVenta;
    }

    public void setDetallesVenta(List<DetalleVentaDTO> detallesVenta) {
        this.detallesVenta = detallesVenta;
    }
    
}
