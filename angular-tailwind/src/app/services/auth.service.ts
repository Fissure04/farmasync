import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock users for simulation
  private mockUsers: User[] = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@farmasync.com',
      role: 'admin',
      avatar: '/images/user/admin.jpg'
    },
    {
      id: 2,
      name: 'Client User',
      email: 'client@farmasync.com',
      role: 'client',
      avatar: '/images/user/client.jpg'
    }
  ];

  constructor() {
    // Auto-login as admin for testing
    this.loginAsAdmin();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  loginAsAdmin(): void {
    this.currentUserSubject.next(this.mockUsers[0]);
  }

  loginAsClient(): void {
    this.currentUserSubject.next(this.mockUsers[1]);
  }

  logout(): void {
    this.currentUserSubject.next(null);
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
}
