package inventoryclient;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class InventoryClient {

    @Value("${inventory.service.url}")
    private String INVENTARIO_SERVICE_URL;

    private final RestTemplate restTemplate;

    @Autowired
    public InventoryClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void aumentarStock(String productId, int cantidad) {
        String url = INVENTARIO_SERVICE_URL + "/" + productId + "/entrada";
        Map<String, Integer> movimiento = Map.of("cantidad", cantidad);
        
        restTemplate.postForObject(url, movimiento, Void.class);
    }
}
