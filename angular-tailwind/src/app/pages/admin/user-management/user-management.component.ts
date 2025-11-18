import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Usuarios</h1>
        <button (click)="openAddUserModal()" class="px-6 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700">
          + Agregar Usuario
        </button>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ users.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-light-100 dark:bg-blue-light-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-light-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Usuarios Activos</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ getActiveCount() }}</p>
            </div>
            <div class="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Usuarios Inactivos</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ getInactiveCount() }}</p>
            </div>
            <div class="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Usuarios Suspendidos</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ getSuspendedCount() }}</p>
            </div>
            <div class="w-12 h-12 bg-error-100 dark:bg-error-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex gap-4">
        <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por nombre o email..." class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white" />
        <select [(ngModel)]="filterRole" class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white">
          <option value="">Todos los roles</option>
          <option value="Admin">Admin</option>
          <option value="Cliente">Cliente</option>
          <option value="Agente">Agente</option>
        </select>
      </div>

      <!-- Users Table -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <table class="w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-4 font-semibold text-gray-800 dark:text-white">Nombre</th>
              <th class="px-6 py-4 font-semibold text-gray-800 dark:text-white">Email</th>
              <th class="px-6 py-4 font-semibold text-gray-800 dark:text-white">Rol</th>
              <th class="px-6 py-4 font-semibold text-gray-800 dark:text-white">Estado</th>
              <th class="px-6 py-4 font-semibold text-gray-800 dark:text-white">Último Acceso</th>
              <th class="px-6 py-4 font-semibold text-gray-800 dark:text-white">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (user of getFilteredUsers(); track user.id) {
            <tr class="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
              <td class="px-6 py-4 font-medium text-gray-800 dark:text-white">{{ user.name }}</td>
              <td class="px-6 py-4">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-light-100 dark:bg-blue-light-900 text-blue-light-700 dark:text-blue-light-400">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span [ngClass]="getStatusClass(user.status)" class="inline-block px-3 py-1 text-xs font-medium rounded-full">
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td class="px-6 py-4">{{ user.lastLogin }}</td>
              <td class="px-6 py-4 flex gap-2">
                <button (click)="editUser(user)" class="text-blue-light-600 hover:underline text-sm font-medium">Editar</button>
                <button (click)="deleteUser(user.id)" class="text-error-600 hover:underline text-sm font-medium">Eliminar</button>
              </td>
            </tr>
            } @empty {
            <tr>
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay usuarios que coincidan con los filtros</td>
            </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class UserManagementComponent {
  users: User[] = [
    { id: 1, name: 'María González', email: 'maria@example.com', role: 'Cliente', status: 'active', lastLogin: '2024-11-16' },
    { id: 2, name: 'Carlos Rodríguez', email: 'carlos@example.com', role: 'Cliente', status: 'active', lastLogin: '2024-11-15' },
    { id: 3, name: 'Ana López', email: 'ana@example.com', role: 'Cliente', status: 'inactive', lastLogin: '2024-11-10' },
    { id: 4, name: 'Pedro Martínez', email: 'pedro@example.com', role: 'Admin', status: 'active', lastLogin: '2024-11-16' },
    { id: 5, name: 'Laura Sánchez', email: 'laura@example.com', role: 'Agente', status: 'suspended', lastLogin: '2024-11-05' },
    { id: 6, name: 'Juan García', email: 'juan@example.com', role: 'Cliente', status: 'active', lastLogin: '2024-11-16' },
    { id: 7, name: 'Sofia Torres', email: 'sofia@example.com', role: 'Cliente', status: 'inactive', lastLogin: '2024-11-12' },
  ];

  searchTerm = '';
  filterRole = '';

  openAddUserModal() {
    alert('Función de agregar usuario (por implementar)');
  }

  editUser(user: User) {
    alert(`Editando usuario: ${user.name}`);
  }

  deleteUser(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.users = this.users.filter(u => u.id !== id);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-400';
      case 'inactive': return 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-400';
      case 'suspended': return 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return 'Suspendido';
      default: return status;
    }
  }

  getActiveCount(): number {
    return this.users.filter(u => u.status === 'active').length;
  }

  getInactiveCount(): number {
    return this.users.filter(u => u.status === 'inactive').length;
  }

  getSuspendedCount(): number {
    return this.users.filter(u => u.status === 'suspended').length;
  }

  getFilteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.filterRole || user.role === this.filterRole;
      
      return matchesSearch && matchesRole;
    });
  }
}

