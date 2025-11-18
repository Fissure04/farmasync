package repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import model.Pedido;

@Repository
public class PedidoRepository {

	private final List<Pedido> baseDeDatos = new ArrayList<>();

	public Pedido save(Pedido pedido) {
		baseDeDatos.add(pedido);
		return pedido;
	}

	public Pedido findById(String id) {
		if (baseDeDatos.size() == 0)
			return null;

		for (Pedido pedido : baseDeDatos) {
			if (pedido.getId().equals(id)) {
				return pedido;
			}
		}
		return null;
	}

	public List<Pedido> findAll() {
		return new ArrayList<>(baseDeDatos);
	}

	public Pedido update(Pedido pedido) {
		for (int i = 0; i < baseDeDatos.size(); i++) {
			if (baseDeDatos.get(i).getId().equals(pedido.getId())) {
				baseDeDatos.set(i, pedido);
				return pedido;
			}
		}
		return null;
	}

	public boolean delete(String id) {
		for (int i = 0; i < baseDeDatos.size(); i++) {
			if (baseDeDatos.get(i).getId().equals(id)) {
				baseDeDatos.remove(i);
				return true;
			}
		}
		return false;
	}
}
