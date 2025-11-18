package model;

public class Pedido {

	private String nombreProducto;
	private String id;
	private String descripcion;
	private int cantidad;
	private double total;
	private String estado;
	private int tiempoEstimadoEntrega;

	public Pedido() {
	}

	public Pedido(String nombreProducto, String id, String descripcion, int cantidad, double total, String estado,
			int tiempoEstimadoEntrega) {
		
		this.nombreProducto = nombreProducto;
		this.id = id;
		this.descripcion = descripcion;
		this.cantidad = cantidad;
		this.total = total;
		this.estado = estado;
		this.tiempoEstimadoEntrega = tiempoEstimadoEntrega;
	}

	public String getNombreProducto() {
		return nombreProducto;
	}

	public void setNombreProducto(String nombre) {
		this.nombreProducto = nombre;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public int getCantidad() {
		return cantidad;
	}

	public void setCantidad(int cantidad) {
		this.cantidad = cantidad;
	}

	public double getTotal() {
		return total;
	}

	public void setTotal(double total) {
		this.total = total;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}

	public int getTiempoEstimadoEntrega() {
		return tiempoEstimadoEntrega;
	}

	public void setTiempoEstimadoEntrega(int tiempoEstimadoEntrega) {
		this.tiempoEstimadoEntrega = tiempoEstimadoEntrega;
	}

}
