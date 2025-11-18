package entity;

public enum EstadoPedido {
	PENDIENTE,
    EN_PROCESO,
    ENVIADO,
    ENTREGADO,
    CANCELADO;
	
	public static EstadoPedido fromString(String value) {
        if (value == null) return null;
        try {
            return EstadoPedido.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
