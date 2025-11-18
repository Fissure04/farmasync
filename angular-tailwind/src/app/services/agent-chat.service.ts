import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgentChatService {
  private apiUrl = 'http://localhost:5000/query'; // API Flask del agente

  constructor(private http: HttpClient) {}

  sendQuery(query: string, role: 'admin' | 'client'): Observable<any> {
    console.log('[AgentChatService] Enviando consulta:', query, 'Role:', role);
    return this.http.post<any>(this.apiUrl, { consulta: query, role }).pipe(
      tap(response => console.log('[AgentChatService] Respuesta bruta:', response)),
      map(response => this.processResponse(response, role)),
      tap(processed => console.log('[AgentChatService] Respuesta procesada:', processed)),
      catchError(error => {
        console.error('[AgentChatService] Error:', error);
        return of({ error: 'Error al conectar con el agente', products: [], ventas: [] });
      })
    );
  }

  private processResponse(response: any, role: 'admin' | 'client'): any {
    console.log('[processResponse] Response recibida:', response, 'Role:', role);
    
    // Extraer data del response
    let data = response?.data || response;
    let message = response?.message || response?.respuesta || response?.response || '';
    
    console.log('[processResponse] Data extraída:', data, 'Tipo:', typeof data);

    if (role === 'client') {
      // Para cliente: buscar productos
      if (Array.isArray(data)) {
        console.log('[processResponse] Data es array, retornando como products');
        return { products: data, message: message };
      } else if (data && typeof data === 'object') {
        if (data.products && Array.isArray(data.products)) {
          console.log('[processResponse] Encontrado data.products');
          return { products: data.products, message: message };
        } else if (data.items && Array.isArray(data.items)) {
          console.log('[processResponse] Encontrado data.items');
          return { products: data.items, message: message };
        } else if (data.result && Array.isArray(data.result)) {
          console.log('[processResponse] Encontrado data.result');
          return { products: data.result, message: message };
        } else if (data.resultado && Array.isArray(data.resultado)) {
          console.log('[processResponse] Encontrado data.resultado');
          return { products: data.resultado, message: message };
        }
      }
      console.log('[processResponse] No se encontraron productos, retornando vacío');
      return { products: [], message: message };
    } else {
      // Para admin: buscar ventas
      if (Array.isArray(data)) {
        console.log('[processResponse] Data es array, retornando como ventas');
        return { ventas: data, message: message };
      } else if (data && typeof data === 'object') {
        if (data.ventas && Array.isArray(data.ventas)) {
          console.log('[processResponse] Encontrado data.ventas');
          return { ventas: data.ventas, message: message };
        } else if (data.items && Array.isArray(data.items)) {
          console.log('[processResponse] Encontrado data.items');
          return { ventas: data.items, message: message };
        } else if (data.result && Array.isArray(data.result)) {
          console.log('[processResponse] Encontrado data.result');
          return { ventas: data.result, message: message };
        } else if (data.resultado && Array.isArray(data.resultado)) {
          console.log('[processResponse] Encontrado data.resultado');
          return { ventas: data.resultado, message: message };
        }
      }
      console.log('[processResponse] No se encontraron ventas, retornando vacío');
      return { ventas: [], message: message };
    }
  }
}
