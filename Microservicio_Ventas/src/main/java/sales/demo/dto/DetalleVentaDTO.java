package sales.demo.dto;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Información del detalle de una venta")
public class DetalleVentaDTO {

    @Schema(description = "ID del detalle de la venta", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "ID del producto", example = "5", nullable = false)
    private Long idProducto;

    @Schema(description = "Cantidad del producto", example = "10", nullable = false, minimum = "1")
    private Integer cantidad;

    @Schema(description = "Precio unitario del producto", example = "150.50", nullable = false, minimum = "0.0", accessMode = Schema.AccessMode.READ_ONLY)
    private BigDecimal precioUnitario;

    @Schema(description = "Subtotal del detalle", example = "1505.00", nullable = false, minimum = "0.0", accessMode = Schema.AccessMode.READ_ONLY)
    private BigDecimal subtotal;

    public DetalleVentaDTO() {
    }

    public DetalleVentaDTO(Long id, Long idProducto, Integer cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {
        this.id = id;
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Long idProducto) {
        this.idProducto = idProducto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
}
