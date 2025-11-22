import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-button',
  standalone: true,
  template: `
    <button class="fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full bg-brand-600 text-white shadow-lg flex items-center gap-2" (click)="goToCart()">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7a1 1 0 00.9 1.3h12.2a1 1 0 00.9-1.3L17 13M7 13V6h13" />
      </svg>
      Carrito
    </button>
  `,
  styles: []
})
export class CartButtonComponent {
  constructor(private router: Router) {}
  goToCart() {
    this.router.navigate(['/cart']);
  }
}
