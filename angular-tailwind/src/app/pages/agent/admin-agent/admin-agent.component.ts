import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../../shared/components/ecommerce/product-card/product-card.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './admin-agent.component.html',
  styleUrls: ['./admin-agent.component.css']
})
export class AdminAgentComponent implements OnInit {
  adminQuery = '';
  ventas: any[] = [];
  messages: { type: 'user' | 'agent'; text: string }[] = [];
  loading = false;
  error = '';
  private apiUrl = 'http://localhost:5000/query';
  // session id for interactive user-creation
  private currentSessionId: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.messages.push({
      type: 'agent',
      text: '¡Hola! Soy el Agente Admin de FarmAsync. Puedo ayudarte con consultas relacionadas con la farmacia: ventas, inventario, productos, etc. ¿En qué puedo ayudarte?'
    });
  }

  sendMessage() {
    console.log('[AdminAgentComponent] sendMessage - query:', this.adminQuery);
    if (!this.adminQuery.trim()) return;

    // push user message into chat
    this.messages.push({ type: 'user', text: this.adminQuery });
    const userInput = this.adminQuery;
    this.adminQuery = '';

    this.loading = true;
    this.error = '';
    this.ventas = [];

    console.log('[AdminAgentComponent] Enviando consulta al agente...');
    // If we have an active session, send the answer structured so backend continues the flow
    const payload = this.currentSessionId
      ? { consulta: { user_session_continue: true, sessionId: this.currentSessionId, answer: userInput } }
      : { consulta: userInput };

    this.http.post<any>(this.apiUrl, payload).subscribe({
      next: (response) => {
        console.log('[AdminAgentComponent] Respuesta recibida:', response);

          let registros: any[] = [];
          let agentMessage = '';

          // Si la respuesta es un string simple (mensaje del LLM)
          if (typeof response === 'string') {
            console.log('Respuesta es un string:', response);
            agentMessage = response;
          }
          // Si la respuesta es un objeto con data
          else if (response?.data) {
            const data = response.data;
            console.log('Data extraída:', data);

            // Si data es un string (mensaje del LLM)
            if (typeof data === 'string') {
              agentMessage = data;
            }
            // Si data es un array (ventas)
            else if (Array.isArray(data)) {
              registros = data;
              agentMessage = 'Aquí tienes los registros encontrados:';
            }
            // Si data es un objeto
            else if (typeof data === 'object') {
              // If backend returned a sessionId/question pair for interactive flows
              if (data.sessionId && data.question) {
                this.currentSessionId = data.sessionId;
                agentMessage = data.question;
              }
              // If backend returned an interactive continuation response
              else if (data.ok && data.question) {
                // keep sessionId until creation or cancel
                agentMessage = data.question;
              }
              // If backend returned a creation result, clear session
              else if (data.created && data.usuario) {
                agentMessage = 'Usuario creado: ' + (data.usuario.email || data.usuario.id || JSON.stringify(data.usuario));
                this.currentSessionId = null;
              }
              // Otherwise try to interpret as search/records
              else {
                // Buscar ventas en diferentes estructuras
                if (data.result && Array.isArray(data.result)) {
                  registros = data.result;
                  agentMessage = 'Aquí tienes los registros encontrados:';
                } else if (data.message) {
                  agentMessage = data.message;
                } else if (data.respuesta) {
                  agentMessage = data.respuesta;
                } else {
                  agentMessage = 'Respuesta recibida del servidor';
                }
              }
            }
          }
          // Fallback a búsqueda de arrays en la raíz
          else {
        if (response?.data?.result && Array.isArray(response.data.result)) {
          registros = response.data.result;
        } else if (response?.result && Array.isArray(response.result)) {
          registros = response.result;
        } else if (Array.isArray(response)) {
          registros = response;
        } else if (response?.resultado && Array.isArray(response.resultado)) {
          registros = response.resultado;
        }
          }

        this.ventas = registros;
        console.log('[AdminAgentComponent] Registros encontrados:', this.ventas);

          // Si no hay mensaje aún, generar uno por defecto
          if (!agentMessage) {
            if (registros.length > 0) {
              agentMessage = `Se encontraron ${registros.length} registros.`;
            } else {
              agentMessage = 'No se encontraron registros para esa consulta.';
            }
          }

        this.messages.push({ type: 'agent', text: agentMessage });
        this.loading = false;
      },
      error: (err: any) => {
        console.error('[AdminAgentComponent] Error:', err);
        this.error = 'Error consultando agente';
        this.messages.push({ type: 'agent', text: 'Disculpa, hubo un error. Intenta de nuevo.' });
        this.loading = false;
      }
    });
  }

  getTableColumns(): string[] {
    if (!this.ventas || this.ventas.length === 0) {
      return [];
    }
    return Object.keys(this.ventas[0]).slice(0, 6);
  }

  // Helper to detect if the current `ventas` array contains products
  isProductList(): boolean {
    if (!this.ventas || this.ventas.length === 0) return false;
    const first = this.ventas[0];
    return !!(first && (first.nombre !== undefined) && (first.precio !== undefined));
  }

  humanizeColumnName(col: string): string {
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .substring(0, 15);
  }

  formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    // Format dates
    if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
      const fecha = new Date(value);
      if (!isNaN(fecha.getTime())) {
        return fecha.toLocaleString('es-CO');
      }
    }

    // Format numbers (currency for totals)
    if (typeof value === 'number') {
      if (value > 1000) { // Assume it's currency
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
      }
      return value.toString();
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (typeof value === 'string' && value.length > 20) {
      return value.substring(0, 20) + '...';
    }

    return value.toString();
  }
}
