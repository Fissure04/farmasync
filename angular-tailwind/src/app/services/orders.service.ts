import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PedidoDTO {
  id?: number;
  proveedorId?: number;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  // Pedidos microservice (port from proyecto_electiva_microservicio_pedidos)
  private baseUrl = 'http://localhost:8014/farmasync/pedidos';

  constructor(private http: HttpClient) {}

  // Lista pedidos pendientes
  getPendingOrders(): Observable<PedidoDTO[]> {
    return this.http.get<PedidoDTO[]>(`${this.baseUrl}/pendientes`);
  }

  // Lista todos los pedidos
  getAllOrders(): Observable<PedidoDTO[]> {
    return this.http.get<PedidoDTO[]>(this.baseUrl);
  }
}
