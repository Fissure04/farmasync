package com.farmacia.pedidos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.pedidos.dto.HistorialEstadoDTO;
import com.farmacia.pedidos.dto.PedidoDTO;
import com.farmacia.pedidos.entity.EstadoPedido;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import com.farmacia.pedidos.service.PedidoService;

@RestController
@RequestMapping("/farmasync/pedidos")
@Tag(name = "Microservicio de Pedidos", description = "Gestión de pedidos a proveedores")
@Validated
public class PedidoController {

	private final PedidoService pedidoService;

	@Autowired
	public PedidoController(PedidoService pedidoService) {
		this.pedidoService = pedidoService;
	}

	@PostMapping
	@Operation(summary = "Crear pedido", description = "Registrar un nuevo pedido")
	@ApiResponses(value = { @ApiResponse(responseCode = "201", description = "Pedido creado exitosamente"),
			@ApiResponse(responseCode = "400", description = "Datos inválidos en la solicitud") })
	public ResponseEntity<PedidoDTO> crearPedido(@Valid @RequestBody PedidoDTO pedidoDTO) {
		PedidoDTO nuevoPedido = pedidoService.crearPedido(pedidoDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
	}

	@GetMapping
	@Operation(summary = "Listar pedidos", description = "Obtener todos los pedidos registrados")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lista de pedidos obtenida exitosamente") })
	public ResponseEntity<List<PedidoDTO>> listarPedidos() {
		List<PedidoDTO> pedidos = pedidoService.listarTodosPedidos();
		return ResponseEntity.ok(pedidos);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Buscar pedido por ID", description = "Obtener un pedido específico por su ID")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Pedido encontrado"),
			@ApiResponse(responseCode = "404", description = "Pedido no encontrado") })
	public ResponseEntity<PedidoDTO> obtenerPedido(
			@Parameter(description = "ID del pedido", required = true) @PathVariable Long id) {
		PedidoDTO pedido = pedidoService.obtenerPedidoPorId(id);
		return ResponseEntity.ok(pedido);
	}

	@PutMapping("/{id}")
	@Operation(summary = "Actualizar pedido", description = "Modificar los datos de un pedido existente")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Pedido actualizado exitosamente"),
			@ApiResponse(responseCode = "400", description = "Datos inválidos"),
			@ApiResponse(responseCode = "404", description = "Pedido no encontrado") })
	public ResponseEntity<PedidoDTO> actualizarPedido(
			@Parameter(description = "ID del pedido a actualizar", required = true) @PathVariable Long id,
			@Valid @RequestBody PedidoDTO pedidoDTO) {
		PedidoDTO pedidoActualizado = pedidoService.actualizarPedido(id, pedidoDTO);
		return ResponseEntity.ok(pedidoActualizado);
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Eliminar pedido", description = "Eliminar un pedido por su identificador")
	@ApiResponses(value = { @ApiResponse(responseCode = "204", description = "Pedido eliminado exitosamente"),
			@ApiResponse(responseCode = "404", description = "Pedido no encontrado"),
			@ApiResponse(responseCode = "400", description = "No se puede eliminar el pedido") })
	public ResponseEntity<Void> eliminarPedido(
			@Parameter(description = "ID del pedido a eliminar", required = true) @PathVariable Long id) {
		pedidoService.eliminarPedido(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/estado")
	@Operation(summary = "Cambiar estado del pedido", description = "Actualizar el estado de un pedido (PENDIENTE, EN_PROCESO, ENVIADO, ENTREGADO, CANCELADO)")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
			@ApiResponse(responseCode = "400", description = "Transición de estado inválida"),
			@ApiResponse(responseCode = "404", description = "Pedido no encontrado") })
	public ResponseEntity<PedidoDTO> cambiarEstadoPedido(
			@Parameter(description = "ID del pedido", required = true) @PathVariable Long id,
			@Parameter(description = "Nuevo estado del pedido", required = true) @RequestParam EstadoPedido estado,
			@Parameter(description = "ID del usuario que realiza el cambio", required = true) @RequestParam Long idUsuario,
			@Parameter(description = "Observaciones sobre el cambio de estado") @RequestParam(required = false) String observaciones) {

		PedidoDTO pedidoActualizado = pedidoService.cambiarEstadoPedido(id, estado, idUsuario, observaciones);
		return ResponseEntity.ok(pedidoActualizado);
	}

	@GetMapping("/{id}/historial")
	@Operation(summary = "Obtener historial del pedido", description = "Consultar el historial completo de cambios de estado de un pedido")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Historial obtenido exitosamente"),
			@ApiResponse(responseCode = "404", description = "Pedido no encontrado") })
	public ResponseEntity<List<HistorialEstadoDTO>> obtenerHistorialPedido(
			@Parameter(description = "ID del pedido", required = true) @PathVariable Long id) {
		List<HistorialEstadoDTO> historial = pedidoService.obtenerHistorialPedido(id);
		return ResponseEntity.ok(historial);
	}

	@GetMapping("/proveedor/{idProveedor}")
	@Operation(summary = "Buscar pedidos por proveedor", description = "Obtener todos los pedidos realizados a un proveedor específico")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Pedidos obtenidos exitosamente") })
	public ResponseEntity<List<PedidoDTO>> buscarPedidosPorProveedor(
			@Parameter(description = "ID del proveedor", required = true) @PathVariable Long idProveedor) {
		List<PedidoDTO> pedidos = pedidoService.buscarPedidosPorProveedor(idProveedor);
		return ResponseEntity.ok(pedidos);
	}

	@GetMapping("/estado/{estado}")
	@Operation(summary = "Buscar pedidos por estado", description = "Obtener todos los pedidos con un estado específico")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Pedidos obtenidos exitosamente") })
	public ResponseEntity<List<PedidoDTO>> buscarPedidosPorEstado(
			@Parameter(description = "Estado del pedido", required = true) @PathVariable EstadoPedido estado) {
		List<PedidoDTO> pedidos = pedidoService.buscarPedidosPorEstado(estado);
		return ResponseEntity.ok(pedidos);
	}

	@GetMapping("/pendientes")
	@Operation(summary = "Listar pedidos pendientes", description = "Obtener todos los pedidos que no han sido entregados ni cancelados")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Pedidos pendientes obtenidos exitosamente") })
	public ResponseEntity<List<PedidoDTO>> listarPedidosPendientes() {
		List<PedidoDTO> pedidos = pedidoService.buscarPedidosPendientes();
		return ResponseEntity.ok(pedidos);
	}
}