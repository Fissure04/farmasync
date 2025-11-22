import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="p-6 min-h-screen flex items-center justify-center">
      <div class="w-full max-w-4xl">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">Panel de Administración</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
          <!-- Gestión de Inventario -->
          <div class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Inventario</h3>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">Gestiona productos, stock y categorías</p>
            <app-button routerLink="/admin/inventory" variant="outline" size="sm" className="w-full">Gestionar Inventario</app-button>
          </div>

          <!-- Gestión de Usuarios -->
          <div class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Usuarios</h3>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">Administra clientes y permisos</p>
            <app-button routerLink="/admin/users" variant="outline" size="sm" className="w-full">Gestionar Usuarios</app-button>
          </div>

          <!-- Gestión de Pedidos -->
          <div class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Pedidos</h3>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">Gestiona pedidos de clientes</p>
            <app-button routerLink="/admin/orders" variant="outline" size="sm" className="w-full">Gestionar Pedidos</app-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {}
