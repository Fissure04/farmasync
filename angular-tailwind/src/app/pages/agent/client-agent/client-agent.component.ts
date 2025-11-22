import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../../shared/components/ecommerce/product-card/product-card.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-client-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './client-agent.component.html',
  styleUrls: ['./client-agent.component.css']
})
export class ClientAgentComponent implements OnInit {
  userQuery = '';
  products: any[] = [];
  messages: { type: 'user' | 'agent'; text: string }[] = [];
  loading = false;
  error = '';
  private apiUrl = 'http://localhost:5000/query';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.messages.push({
      type: 'agent',
      text: '¡Hola! Puedo ayudarte a buscar productos. Prueba pidiendo "dame todos los productos" o busca uno específico por nombre.'
    });
  }

  sendMessage() {
    console.log('[ClientAgentComponent] sendMessage - query:', this.userQuery);
    if (!this.userQuery.trim()) return;
    
    // push user message
    this.messages.push({ type: 'user', text: this.userQuery });
    const userInput = this.userQuery;
    this.userQuery = '';

    this.loading = true;
    this.error = '';
    this.products = [];

    console.log('[ClientAgentComponent] Enviando consulta al agente...');
    this.http.post<any>(this.apiUrl, { consulta: userInput }).subscribe({
      next: (response) => {
        console.log('[ClientAgentComponent] Respuesta recibida:', response);
        
        let productos: any[] = [];
          let agentMessage = '';

          // Función auxiliar para verificar si un objeto es un producto
          const isProduct = (obj: any) => obj && typeof obj === 'object' && (obj.nombre || obj.name);

          // Función auxiliar para extraer productos de diferentes estructuras
          const extractProducts = (data: any): any[] => {
            if (Array.isArray(data)) {
              return data;
            } else if (isProduct(data)) {
              return [data];
            } else if (data?.result) {
              if (Array.isArray(data.result)) {
                return data.result;
              } else if (isProduct(data.result)) {
                return [data.result];
              }
            } else if (data?.productos && Array.isArray(data.productos)) {
              return data.productos;
            } else if (data?.resultado && Array.isArray(data.resultado)) {
              return data.resultado;
            }
            return [];
          };

          // Si la respuesta es un string simple (mensaje del LLM)
          if (typeof response === 'string') {
            console.log('Respuesta es un string:', response);
            agentMessage = response;
          }
          // Si la respuesta es un objeto
          else if (typeof response === 'object' && response !== null) {
            console.log('Respuesta es un objeto:', response);

            // Intentar extraer productos de la respuesta
            productos = extractProducts(response);

            // Si encontramos productos, generar mensaje apropiado
            if (productos.length > 0) {
              agentMessage = productos.length === 1 ?
                'Aquí tienes el producto encontrado:' :
                'Aquí tienes los productos encontrados:';
            }
            // Si no hay productos, buscar mensaje en la respuesta
            else if (response.message) {
              agentMessage = response.message;
            } else if (response.respuesta) {
              agentMessage = response.respuesta;
            } else if (response.data) {
              // Si hay data, procesar recursivamente
              if (typeof response.data === 'string') {
                agentMessage = response.data;
              } else {
                productos = extractProducts(response.data);
                if (productos.length > 0) {
                  agentMessage = productos.length === 1 ?
                    'Aquí tienes el producto encontrado:' :
                    'Aquí tienes los productos encontrados:';
                } else {
                  agentMessage = 'No se encontraron productos en la respuesta';
                }
              }
            } else {
              agentMessage = 'Respuesta del servidor procesada';
            }
          }
          // Si es un array directamente
          else if (Array.isArray(response)) {
            productos = response;
            agentMessage = 'Aquí tienes los productos encontrados:';
          }

          this.products = productos;
          console.log('[ClientAgentComponent] Productos encontrados:', this.products);
          console.log('[ClientAgentComponent] Mensaje del agente:', agentMessage);

          // Si no hay mensaje aún, generar uno por defecto
          if (!agentMessage) {
            if (productos.length > 0) {
              agentMessage = 'Aquí tienes los productos encontrados:';
            } else {
              agentMessage = 'No encontré productos con esa búsqueda. Intenta con otro término.';
            }
          }

        this.messages.push({ type: 'agent', text: agentMessage });
        this.loading = false;
      },
      error: (err) => {
        console.error('[ClientAgentComponent] Error:', err);
        this.error = 'Error consultando agente';
        this.messages.push({ type: 'agent', text: 'Disculpa, hubo un error. Intenta de nuevo.' });
        this.loading = false;
      }
    });
  }
}
