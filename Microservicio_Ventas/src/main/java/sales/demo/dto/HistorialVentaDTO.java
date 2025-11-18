package sales.demo.dto;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Historial de ventas")
public class HistorialVentaDTO {

    @Schema(description = "ID del historial", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "ID de la venta", example = "10", nullable = false)
    private Long idVenta;

    @Schema(description = "Fecha del evento", example = "2024-06-15", nullable = false, accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDate fechaEvento;

    @Schema(description = "Tipo de evento", example = "CREACION", nullable = false)
    private String tipoEvento;

    @Schema(description = "ID del usuario que realizó el evento", example = "5", nullable = false)
    private Long idUsuario;

    @Schema(description = "Observación del evento", example = "Venta creada exitosamente", nullable = true)
    private String observacion;

    public HistorialVentaDTO() {
    }

    public HistorialVentaDTO(Long id, Long idVenta, LocalDate fechaEvento, String tipoEvento, Long idUsuario, String observacion) {
        this.id = id;
        this.idVenta = idVenta;
        this.fechaEvento = fechaEvento;
        this.tipoEvento = tipoEvento;
        this.idUsuario = idUsuario;
        this.observacion = observacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdVenta() {
        return idVenta;
    }

    public void setIdVenta(Long idVenta) {
        this.idVenta = idVenta;
    }

    public LocalDate getFechaEvento() {
        return fechaEvento;
    }

    public void setFechaEvento(LocalDate fechaEvento) {
        this.fechaEvento = fechaEvento;
    }

    public String getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(String tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }
    
}
