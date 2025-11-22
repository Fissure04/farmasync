import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartSummaryComponent } from '../../shared/components/ui/cart-summary.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartSummaryComponent],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Carrito de Compras</h1>

      <app-cart-summary></app-cart-summary>
    </div>
  `
})
export class CartComponent {}
