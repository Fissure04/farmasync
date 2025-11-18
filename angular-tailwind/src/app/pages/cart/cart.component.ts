import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Carrito de Compras</h1>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div class="text-center py-12">
          <div class="text-gray-400 dark:text-gray-500 text-lg mb-4">
            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z"></path>
            </svg>
            Tu carrito está vacío
          </div>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Agrega productos desde el dashboard para comenzar tu compra</p>
          <app-button routerLink="/dashboard" variant="primary">
            Ir al Dashboard
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class CartComponent {}
