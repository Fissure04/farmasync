package entity;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "DETALLE_PEDIDO")
public class DetallePedidoEntity {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    @JsonIgnore
    private PedidoEntity pedido;

    @Column(name = "id_producto_pedido", nullable = false)
    private String idProductoPedido;

    @Column(name = "cantidad", nullable = false)
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DetallePedidoEntity)) return false;
        DetallePedidoEntity that = (DetallePedidoEntity) o;
        return Objects.equals(idDetalle, that.idDetalle);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idDetalle);
    }

	public Long getIdDetalle() {
		return idDetalle;
	}

	public void setIdDetalle(Long idDetalle) {
		this.idDetalle = idDetalle;
	}

	public PedidoEntity getPedido() {
		return pedido;
	}

	public void setPedido(PedidoEntity pedido) {
		this.pedido = pedido;
	}

	public String getIdProductoPedido() {
		return idProductoPedido;
	}

	public void setIdProductoPedido(String idProductoPedido) {
		this.idProductoPedido = idProductoPedido;
	}

	public Integer getCantidad() {
		return cantidad;
	}

	public void setCantidad(Integer cantidad) {
		this.cantidad = cantidad;
	}
    
    

}
