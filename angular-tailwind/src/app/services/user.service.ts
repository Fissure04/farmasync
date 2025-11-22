import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioCreateDTO {
  nombre: string;
  apellido: string;
  email: string;
  direccion?: string;
  telefono?: string;
  password?: string;
  idRol?: number;
}

export interface UsuarioDTO {
  // The backend DTO does not always include `id` in the class,
  // but if the API returns it we will preserve it here.
  id?: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  direccion?: string;
  nombreRol?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8013/farmasync/usuarios';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.baseUrl);
  }

  getUserById(id: number) {
    return this.http.get<UsuarioDTO>(`${this.baseUrl}/${id}`);
  }

  createUser(dto: UsuarioCreateDTO) {
    // Creating a CLIENT user can be done via the public register endpoint
    // which doesn't require ADMIN role. Use /register so admins can create
    // CLIENT users from the UI even when no admin token exists.
    const payload = { ...dto, idRol: 2 } as UsuarioCreateDTO;
    return this.http.post<UsuarioDTO>(`${this.baseUrl}/register`, payload);
  }

  updateUser(id: number, dto: UsuarioCreateDTO) {
    return this.http.put<UsuarioDTO>(`${this.baseUrl}/${id}`, dto);
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Returns the current logged user based on the Authorization token.
   * Backend should expose a `/me` endpoint that returns the user's DTO.
   */
  getCurrentUser() {
    return this.http.get<UsuarioDTO>(`${this.baseUrl}/me`);
  }

}
