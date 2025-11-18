package sales.demo.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import sales.demo.dto.HistorialVentaDTO;
import sales.demo.dto.VentaDTO;
import sales.demo.services.VentaService;

@RestController
@RequestMapping("/farmasync/ventas")
@Tag(name = "Microservicio de Ventas", description = "API para gestionar las ventas")
@Validated
public class VentaController {

	private final VentaService ventaService;

	@Autowired
	public VentaController(VentaService ventaService) {
		this.ventaService = ventaService;
	}

	@PostMapping
	@Operation(summary = "Registrar una nueva venta", description = "Crea una nueva venta en el sistema.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Venta creada exitosamente"),
			@ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<VentaDTO> crearVenta(@Valid @RequestBody VentaDTO ventaDTO) {
		VentaDTO venta = ventaService.crearVenta(ventaDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(venta);
	}
	
	@GetMapping
	@Operation(summary = "Listar todas las ventas", description = "Devuelve una lista de todas las ventas registradas.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lista de ventas obtenida exitosamente"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<List<VentaDTO>> listarVentas() {
		List<VentaDTO> ventas = ventaService.obtenerTodasLasVentas();
		return ResponseEntity.ok(ventas);
	}
	
	@GetMapping("/{id}")
	@Operation(summary = "Buscar una venta por ID", description = "Devuelve los detalles de una venta específica mediante su ID.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Venta obtenida exitosamente"),
			@ApiResponse(responseCode = "404", description = "Venta no encontrada"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<VentaDTO> obtenerVentaPorId(@Parameter(description = "ID de la venta a buscar", required = true) @PathVariable Long id) {
		VentaDTO venta = ventaService.obtenerVentaPorId(id);
		return ResponseEntity.ok(venta);
	} 

	@PutMapping("/{id}")
	@Operation(summary = "Actualizar venta", description = "Actualiza los detalles de una venta existente.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Venta actualizada exitosamente"),
			@ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
			@ApiResponse(responseCode = "404", description = "Venta no encontrada"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<VentaDTO> actualizarVenta(
			@Parameter(description = "ID de la venta a actualizar", required = true) @PathVariable Long id,
			@Valid @RequestBody VentaDTO ventaDTO) {
		VentaDTO ventaActualizada = ventaService.actualizarVenta(id, ventaDTO);
		return ResponseEntity.ok(ventaActualizada);
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Elimina una venta", description = "Elimina una venta existente mediante su ID.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Venta eliminada exitosamente"),
			@ApiResponse(responseCode = "404", description = "Venta no encontrada"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<Void> eliminarVenta(@Parameter(description = "ID de la venta a eliminar", required = true) @PathVariable Long id) {
		ventaService.eliminarVenta(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{id}/historial")
	@Operation(summary = "Obtener historial de una venta", description = "Devuelve el historial de eventos asociados a una venta específica.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Historial obtenido exitosamente"),
			@ApiResponse(responseCode = "404", description = "Venta no encontrada"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<List<HistorialVentaDTO>> obtenerHistorialPorVentaId(
			@Parameter(description = "ID de la venta cuyo historial se desea obtener", required = true) @PathVariable Long id) {
		List<HistorialVentaDTO> historial = ventaService.obtenerHistorialPorVentaId(id);
		return ResponseEntity.ok(historial);
	}

	@GetMapping("/cliente/{idCliente}")
	@Operation(summary = "Obtener ventas por ID de cliente", description = "Devuelve una lista de ventas asociadas a un cliente específico.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lista de ventas obtenida exitosamente"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<List<VentaDTO>> obtenerVentasPorClienteId(
			@Parameter(description = "ID del cliente cuyas ventas se desean obtener", required = true) @PathVariable Long idCliente) {
		List<VentaDTO> ventas = ventaService.obtenerVentasPorClienteId(idCliente);
		return ResponseEntity.ok(ventas);
	}

	@GetMapping("/vendedor/{idVendedor}")
	@Operation(summary = "Obtener ventas por ID de vendedor", description = "Devuelve una lista de ventas asociadas a un vendedor específico.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lista de ventas obtenida exitosamente"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<List<VentaDTO>> obtenerVentasPorVendedorId(
			@Parameter(description = "ID del vendedor cuyas ventas se desean obtener", required = true) @PathVariable Long idVendedor) {
		List<VentaDTO> ventas = ventaService.obtenerVentasPorVendedorId(idVendedor);
		return ResponseEntity.ok(ventas);
	}

	@GetMapping("/fecha")
	@Operation(summary = "Obtener ventas por rango de fechas", description = "Devuelve una lista de ventas realizadas dentro de un rango de fechas específico.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lista de ventas obtenida exitosamente"),
			@ApiResponse(responseCode = "400", description = "Parámetros de fecha inválidos"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<List<VentaDTO>> obtenerVentasPorRangoFechas(
			@Parameter(description = "Fecha de inicio del rango (YYYY-MM-DD)", required = true) @RequestParam String fechaInicio,
			@Parameter(description = "Fecha de fin del rango (YYYY-MM-DD)", required = true) @RequestParam String fechaFin) {
		List<VentaDTO> ventas = ventaService.obtenerVentasPorRangoFechas(
				java.time.LocalDate.parse(fechaInicio),
				java.time.LocalDate.parse(fechaFin));
		return ResponseEntity.ok(ventas);
	}

	@GetMapping("/detalles/{id}")
	@Operation(summary = "Obtener detalles de una venta", description = "Devuelve los detalles de los productos asociados a una venta específica.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Detalles de la venta obtenidos exitosamente"),
			@ApiResponse(responseCode = "404", description = "Venta no encontrada"),
			@ApiResponse(responseCode = "500", description = "Error Interno del Servidor")
	})
	public ResponseEntity<List<sales.demo.dto.DetalleVentaDTO>> obtenerDetallesPorVentaId(
			@Parameter(description = "ID de la venta cuyos detalles se desean obtener", required = true) @PathVariable Long id) {
		List<sales.demo.dto.DetalleVentaDTO> detalles = ventaService.obtenerDetallesPorVentaId(id);
		return ResponseEntity.ok(detalles);
	}

}
