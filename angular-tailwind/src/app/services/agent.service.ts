import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

export interface AgentResponse {
  data: any;
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  // Ajusta esta URL si el backend del agente corre en otro host/puerto
  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  query(prompt: string): Observable<any> {
    console.log('[AgentService] query called with:', prompt);
    const url = `${this.baseUrl}/query`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(url, { consulta: prompt }, { headers }).pipe(
      // log raw response then normalize to `res.data ?? res`
      tap((res) => console.debug('[AgentService] raw response:', res)),
      map((res) => (res && typeof res === 'object' ? (res.data ?? res) : res)),
      tap((normalized) => console.debug('[AgentService] normalized response:', normalized)),
      catchError((err) => {
        console.error('[AgentService] error', err);
        return throwError(() => err);
      })
    );
  }

  // helper to test connectivity
  ping(): Observable<any> {
    const url = `${this.baseUrl}/query`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(url, { consulta: 'ping' }, { headers }).pipe(
      tap((res) => console.debug('[AgentService] raw ping response:', res)),
      map((res) => (res && typeof res === 'object' ? (res.data ?? res) : res)),
      tap((normalized) => console.debug('[AgentService] ping normalized:', normalized)),
      catchError((err) => {
        console.error('[AgentService] ping error', err);
        return throwError(() => err);
      })
    );
  }
}
