package sales.demo.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import sales.demo.dto.DetalleVentaDTO;
import sales.demo.dto.HistorialVentaDTO;
import sales.demo.dto.VentaDTO;
import sales.demo.entity.DetalleVentaEntity;
import sales.demo.entity.HistorialVentaEntity;
import sales.demo.entity.VentaEntity;
import sales.demo.mapper.VentaMapper;
import sales.demo.repositories.DetalleVentaRepository;
import sales.demo.repositories.HistorialVentaRepository;
import sales.demo.repositories.VentaRepository;

@Service
@Transactional
public class VentaService {

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final HistorialVentaRepository historialVentaRepository;
    private final VentaMapper ventaMapper;
    private final RestTemplate restTemplate;

    // URL del microservicio de inventario
    private static final String INVENTARIO_SERVICE_URL = "http://localhost:8016/farmasync/inventario";

    public VentaService(VentaRepository ventaRepository, DetalleVentaRepository detalleVentaRepository,
            HistorialVentaRepository historialVentaRepository, VentaMapper ventaMapper, RestTemplate restTemplate) {
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.historialVentaRepository = historialVentaRepository;
        this.ventaMapper = ventaMapper;
        this.restTemplate = restTemplate;
    }

    public VentaDTO crearVenta(VentaDTO ventaDTO) {
        validarVenta(ventaDTO);

        // Verificar stock y obtener precios para cada producto
        for (DetalleVentaDTO detalle : ventaDTO.getDetallesVenta()) {
            String urlProducto = INVENTARIO_SERVICE_URL + "/" + detalle.getIdProducto();
            @SuppressWarnings("unchecked") //para evitar advertencias de conversión en la siguiente linea
            Map<String, Object> producto = null;
            try {
                producto = restTemplate.getForObject(urlProducto, Map.class);
            } catch (Exception e) {
                // intento fallback: buscar por nombre/sku
                try {
                    String buscarUrl = INVENTARIO_SERVICE_URL + "/buscar?nombre=" + java.net.URLEncoder.encode(detalle.getIdProducto(), java.nio.charset.StandardCharsets.UTF_8);
                    @SuppressWarnings("unchecked")
                    java.util.List<Map<String, Object>> resultados = restTemplate.getForObject(buscarUrl, java.util.List.class);
                    if (resultados != null && !resultados.isEmpty()) {
                        producto = resultados.get(0);
                    }
                } catch (Exception ex) {
                    // leave producto null
                }
            }
            if (producto == null) {
                throw new RuntimeException("Producto no encontrado en inventario con ID o SKU: " + detalle.getIdProducto());
            }

            int stockDisponible = (Integer) producto.get("stock");
            if (stockDisponible < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto ID: " + detalle.getIdProducto() + ". Disponible: " + stockDisponible + ", Solicitado: " + detalle.getCantidad());
            }

            // Obtener precio del producto y setearlo en el detalle
            BigDecimal precioUnitario = new BigDecimal(producto.get("precio").toString());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(precioUnitario.multiply(BigDecimal.valueOf(detalle.getCantidad())));
            // Guardar metadata del producto en el detalle para persistirla junto a la venta
            Object nombreObj = producto.get("nombre");
            Object imagenObj = producto.get("imagen_url");
            if (nombreObj != null) detalle.setProductoNombre(nombreObj.toString());
            if (imagenObj != null) detalle.setProductoImagenUrl(imagenObj.toString());
        }

        VentaEntity ventaEntity = ventaMapper.toEntity(ventaDTO);

        ventaEntity.setFechaVenta(LocalDate.now());

        if (ventaEntity.getTotal() == null || ventaEntity.getTotal().compareTo(BigDecimal.ZERO) == 0) {
            ventaEntity.setTotal(calcularTotalVenta(ventaDTO));
        }

        ventaEntity.getDetalles().forEach(detalle -> detalle.setVenta(ventaEntity));

        VentaEntity ventaGuardada = ventaRepository.save(ventaEntity);

        // Descontar stock en inventario para cada producto
        for (DetalleVentaDTO detalle : ventaDTO.getDetallesVenta()) {
            String urlSalida = INVENTARIO_SERVICE_URL + "/" + detalle.getIdProducto() + "/salida";
            Map<String, Integer> movimiento = Map.of("cantidad", detalle.getCantidad());
            restTemplate.postForObject(urlSalida, movimiento, Void.class);
        }

        crearHistorialVenta(ventaEntity, "Registro", "Nueva venta registrada");
        return ventaMapper.toDTO(ventaGuardada);
    }

    @Transactional(readOnly = true)
    public VentaDTO obtenerVentaPorId(Long id) {
        VentaEntity venta = ventaRepository.findById(id).orElseThrow(() -> new RuntimeException("Venta no encontrada con el ID: " + id));

        VentaDTO dto = ventaMapper.toDTO(venta);
        enrichVentaWithProductInfo(dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<VentaDTO> obtenerTodasLasVentas() {
        List<VentaEntity> ventas = ventaRepository.findAll();
        List<VentaDTO> dtos = ventaMapper.toDTOList(ventas);
        dtos.forEach(this::enrichVentaWithProductInfo);
        return dtos;
    }

    public VentaDTO actualizarVenta(Long id, VentaDTO ventaDTO) {
        VentaEntity ventaExistente = ventaRepository.findById(id).orElseThrow(() -> new RuntimeException("Venta no encontrada con el ID: " + id));

        ventaExistente.setIdCliente(ventaDTO.getIdCliente());
        ventaExistente.setTotal(ventaDTO.getTotal());

        if (ventaDTO.getDetallesVenta() != null && !ventaDTO.getDetallesVenta().isEmpty()) {
            ventaExistente.getDetalles().clear();
            
            ventaDTO.getDetallesVenta().forEach(detalleDTO -> {
                DetalleVentaEntity detalle = ventaMapper.detalleToEntity(detalleDTO, ventaExistente);
                detalle.setVenta(ventaExistente);
                ventaExistente.getDetalles().add(detalle);
            });
        }

        VentaEntity ventaActualizada = ventaRepository.save(ventaExistente);

        crearHistorialVenta(ventaExistente, "Actualización", "Venta actualizada");

        return ventaMapper.toDTO(ventaActualizada);
    }

    public void eliminarVenta(Long id) {
        VentaEntity venta = ventaRepository.findById(id).orElseThrow(() -> new RuntimeException("Venta no encontrada con el ID: " + id));

        ventaRepository.delete(venta);
    }

    @Transactional(readOnly = true)
    public List<HistorialVentaDTO> obtenerHistorialPorVentaId(Long idVenta) {
        if (!ventaRepository.existsById(idVenta)) {
            throw new RuntimeException("Venta no encontrada con el ID: " + idVenta);
        }
        
        List<HistorialVentaEntity> historial = historialVentaRepository.findByVentaIdOrderByFechaEventoDesc(idVenta);
        return historial.stream().map(ventaMapper::toHistorialVentaDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DetalleVentaDTO> obtenerDetallesPorVentaId(Long idVenta) {
        if (!ventaRepository.existsById(idVenta)) {
            throw new RuntimeException("Venta no encontrada con el ID: " + idVenta);
        }

        List<DetalleVentaEntity> detalles = detalleVentaRepository.findByVentaId(idVenta);
        return detalles.stream().map(ventaMapper::toDetalleDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VentaDTO> obtenerVentasPorClienteId(Long idCliente) {
        List<VentaEntity> ventas = ventaRepository.findByIdCliente(idCliente);
        List<VentaDTO> dtos = ventaMapper.toDTOList(ventas);
        dtos.forEach(this::enrichVentaWithProductInfo);
        return dtos;
    }

    /**
     * Enrich each detalle in the VentaDTO with product metadata (nombre, imagen) fetched from the inventory service.
     */
    private void enrichVentaWithProductInfo(VentaDTO venta) {
        if (venta == null || venta.getDetallesVenta() == null) return;

        for (DetalleVentaDTO det : venta.getDetallesVenta()) {
            try {
                String urlProducto = INVENTARIO_SERVICE_URL + "/" + det.getIdProducto();
                @SuppressWarnings("unchecked")
                Map<String, Object> producto = restTemplate.getForObject(urlProducto, Map.class);
                if (producto != null) {
                    Object nombre = producto.get("nombre");
                    Object imagen = producto.get("imagen_url");
                    if (nombre != null) det.setProductoNombre(nombre.toString());
                    if (imagen != null) det.setProductoImagenUrl(imagen.toString());
                    continue;
                }
            } catch (Exception e) {
                // try fallback below
            }

            // Fallback: try searching inventory by name using the buscar endpoint,
            // treating the idProducto value as a possible name/sku when direct id lookup fails.
            try {
                String buscarUrl = INVENTARIO_SERVICE_URL + "/buscar?nombre=" + java.net.URLEncoder.encode(det.getIdProducto(), java.nio.charset.StandardCharsets.UTF_8);
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> resultados = restTemplate.getForObject(buscarUrl, java.util.List.class);
                if (resultados != null && !resultados.isEmpty()) {
                    Map<String, Object> prod = resultados.get(0);
                    Object nombre = prod.get("nombre");
                    Object imagen = prod.get("imagen_url");
                    if (nombre != null) det.setProductoNombre(nombre.toString());
                    if (imagen != null) det.setProductoImagenUrl(imagen.toString());
                }
            } catch (Exception e) {
                // ignore fallback failures
            }
        }
    }

    @Transactional(readOnly = true)
    public List<VentaDTO> obtenerVentasPorRangoFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        List<VentaEntity> ventas = ventaRepository.findByFechaVentaBetween(fechaInicio, fechaFin);
        return ventaMapper.toDTOList(ventas);
    }

    private void validarVenta(VentaDTO ventaDTO) {
        if (ventaDTO.getDetallesVenta() == null || ventaDTO.getDetallesVenta().isEmpty()) {
            throw new IllegalArgumentException("La venta debe tener al menos un producto.");
        }

        boolean cantidadesInvalidas = ventaDTO.getDetallesVenta().stream()
            .anyMatch(detalle -> detalle.getCantidad() == null || detalle.getCantidad() <= 0);

        if (cantidadesInvalidas) {
            throw new IllegalArgumentException("Todas las cantidades de los productos deben ser mayores a cero.");
        }

        long productosDuplicados = ventaDTO.getDetallesVenta().stream()
            .map(DetalleVentaDTO::getIdProducto).distinct().count();

        if (productosDuplicados != ventaDTO.getDetallesVenta().size()) {
            throw new IllegalArgumentException("No se permiten productos duplicados en la venta.");
        }
    }

    private void crearHistorialVenta(VentaEntity venta, String tipoEvento, String observacion) {
        HistorialVentaEntity historial = new HistorialVentaEntity();
        historial.setVenta(venta);
        historial.setFechaEvento(LocalDate.now());
        historial.setTipoEvento(tipoEvento);
        historial.setObservacion(observacion);

        historialVentaRepository.save(historial);
    } 

    private BigDecimal calcularTotalVenta(VentaDTO ventaDTO) {
        return ventaDTO.getDetallesVenta().stream()
            .map(detalle -> detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}
