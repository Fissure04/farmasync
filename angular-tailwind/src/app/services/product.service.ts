import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  provedor_id: string;
  imagen_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8016/farmasync/inventario';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/`);
  }

  searchProductsByName(name: string): Observable<Product[]> {
    const params = new HttpParams().set('nombre', name);
    return this.http.get<Product[]>(`${this.baseUrl}/buscar`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/`, product);
  }

  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  updateProductPrice(id: string, price: number): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}/precio`, { precio: price });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  addStock(id: string, quantity: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/entrada`, { cantidad: quantity });
  }

  removeStock(id: string, quantity: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/salida`, { cantidad: quantity });
  }
}
