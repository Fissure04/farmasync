import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Product {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  image: string;
}

@Component({
  selector: 'app-purchase-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ product?.name }}</h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Image -->
            <div>
              <img [src]="product?.image" [alt]="product?.name" class="w-full h-80 object-cover rounded-lg" />
            </div>

            <!-- Details -->
            <div>
              <div class="mb-4">
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">Categoría</p>
                <p class="text-gray-800 dark:text-white font-medium">{{ product?.category }}</p>
              </div>

              <div class="mb-4">
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">Descripción</p>
                <p class="text-gray-800 dark:text-white">{{ product?.variants }}</p>
              </div>

              <div class="mb-6">
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">Precio unitario</p>
                <p class="text-3xl font-bold text-brand-600">{{ product?.price }}</p>
              </div>

              <!-- Quantity Selector -->
              <div class="mb-6">
                <label class="block text-gray-600 dark:text-gray-400 text-sm mb-2">Cantidad</label>
                <div class="flex items-center gap-3">
                  <button (click)="decrementQuantity()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium">−</button>
                  <input [(ngModel)]="quantity" type="number" min="1" class="w-16 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white" />
                  <button (click)="incrementQuantity()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with Total -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-1">Total a pagar</p>
              <p class="text-4xl font-bold text-brand-600">{{ totalPrice }}</p>
            </div>
            <div class="text-right text-sm text-gray-500 dark:text-gray-400">
              <p>{{ quantity }} × {{ product?.price }}</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button (click)="close()" class="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
              Cancelar
            </button>
            <button (click)="checkout()" class="flex-1 px-6 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700">
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PurchaseModalComponent {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Output() close$ = new EventEmitter<void>();
  @Output() checkout$ = new EventEmitter<{ product: Product; quantity: number }>();

  quantity = 1;

  close() {
    this.quantity = 1;
    this.close$.emit();
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  checkout() {
    if (this.product) {
      this.checkout$.emit({ product: this.product, quantity: this.quantity });
      this.close();
    }
  }

  get totalPrice(): string {
    if (!this.product) return '$0.00';
    const price = parseFloat(this.product.price.replace('$', ''));
    const total = price * this.quantity;
    return `$${total.toFixed(2)}`;
  }
}
