import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VentaDTO {
  id?: number;
  idCliente?: number;
  fechaVenta?: string; // ISO date
  total?: number;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private baseUrl = 'http://localhost:8015/farmasync/ventas';

  constructor(private http: HttpClient) {}

  // Crear una venta
  createSale(venta: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, venta);
  }

  // Obtener todas las ventas
  getAllSales(): Observable<VentaDTO[]> {
    return this.http.get<VentaDTO[]>(this.baseUrl);
  }

  // Alias por compatibilidad
  listSales(): Observable<VentaDTO[]> {
    return this.getAllSales();
  }

  // Obtener ventas por cliente
  getSalesByClient(idCliente: string | number): Observable<VentaDTO[]> {
    return this.http.get<VentaDTO[]>(`${this.baseUrl}/cliente/${idCliente}`);
  }

  // Obtener ventas por rango de fechas (YYYY-MM-DD)
  getSalesByDate(fechaInicio: string, fechaFin: string): Observable<VentaDTO[]> {
    const params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    return this.http.get<VentaDTO[]>(`${this.baseUrl}/fecha`, { params });
  }
}
