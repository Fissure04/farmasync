import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface User {
  id?: string | number;
  email: string;
  name?: string;
  role: 'admin' | 'client' | string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Base URL of the users microservice (set to the provided backend URL)
  private baseUrl = 'http://localhost:8013/farmasync/usuarios';

  constructor(private http: HttpClient) {
    // If there is an auth token or admin token in localStorage, initialize state
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    if (token) {
      const info = this.decodeToken(token);
      if (info) {
        const role = (info['role'] || info['rol'] || info['roles'] || info['authority']) as string;
        const id = info['id'] ?? info['userId'] ?? info['sub'] ?? undefined;
        this.currentUserSubject.next({
          id: id,
          email: info['sub'] || info['email'] || '',
          name: info['name'] || info['nombre'] || undefined,
          role: role?.toLowerCase?.() === 'admin' || (role?.toUpperCase?.() === 'ADMIN') ? 'admin' : 'client'
        });
      }
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login with email & password. Stores token in `authToken` and updates user state.
   */
  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap(res => {
        if (res && res.token) {
          localStorage.setItem('authToken', res.token);
          const info = this.decodeToken(res.token);
          const id = info?.['id'] ?? info?.['userId'] ?? info?.['sub'] ?? undefined;
          this.currentUserSubject.next({
            id: id,
            email: info?.['sub'] || email,
            role: info && (info['role'] || '').toLowerCase() === 'admin' ? 'admin' : 'client'
          });
        }
      }));
  }

  /**
   * Register user using backend `register` endpoint. Returns created user DTO.
   * DTO fields must match backend: { nombre, apellido, email, direccion, telefono, password, idRol }
   */
  register(dto: { nombre: string; apellido: string; email: string; direccion?: string; telefono?: string; password: string; idRol?: number }) {
    return this.http.post(`${this.baseUrl}/register`, dto);
  }

  logout() {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    window.location.href = '/signin';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isClient(): boolean {
    return this.currentUser?.role === 'client';
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Allows manually setting an admin token (useful when token is rotated externally).
   * Saves token under `adminToken` and updates current user to ADMIN.
   */
  setAdminToken(token: string) {
    localStorage.setItem('adminToken', token);
    const info = this.decodeToken(token);
    const id = info?.['id'] ?? info?.['userId'] ?? info?.['sub'] ?? undefined;
    this.currentUserSubject.next({
      id: id,
      email: info?.['sub'] || 'admin@farmasync.com',
      role: 'admin'
    });
  }

  private decodeToken(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(decoded)));
    } catch (e) {
      return null;
    }
  }
}
