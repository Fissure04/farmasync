import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-theme-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="relative">
        <img [src]="image" alt="{{title}}" class="w-full h-40 object-cover" />
        <div class="absolute top-3 right-3 bg-white/80 dark:bg-gray-900/60 rounded-full px-2 py-1 text-xs font-semibold text-gray-800 dark:text-white">
          {{ badge }}
        </div>
      </div>
      <div class="p-4">
        <h4 class="text-sm font-semibold text-gray-800 dark:text-white mb-1">{{ title }}</h4>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">{{ description }}</p>
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium text-brand-600 dark:text-brand-400">{{ price }}</div>
          <button class="px-3 py-1 rounded-lg bg-brand-500 text-white text-xs hover:bg-brand-600 transition" (click)="addToCart()">Agregar al carrito</button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ProductCardComponent {
  @Input() id?: string;
  @Input() stock?: number;
  @Input() title = 'Producto';
  @Input() description = '';
  @Input() price = '$0.00';
  @Input() image = '/public/images/product/default.png';
  @Input() badge = '';

  addToCart() {
    try {
      const cartRaw = localStorage.getItem('cart');
      const cart: any[] = cartRaw ? JSON.parse(cartRaw) : [];
      const idx = cart.findIndex(p => (p.id && this.id) ? p.id === this.id : p.title === this.title);
      const currentQty = idx >= 0 ? (cart[idx].quantity || 1) : 0;

      if (this.stock !== undefined && (currentQty + 1) > this.stock) {
        alert('No hay suficiente stock para agregar más unidades de este producto');
        return;
      }

      if (idx >= 0) {
        cart[idx].quantity = currentQty + 1;
      } else {
        cart.push({
          id: this.id,
          title: this.title,
          description: this.description,
          price: this.price,
          image: this.image,
          badge: this.badge,
          stock: this.stock,
          quantity: 1,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      try { window.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: cart.reduce((s, it) => s + (it.quantity || 0), 0) } })); } catch(e) {}
      alert('Producto agregado al carrito');
    } catch (e) {
      console.error('Error adding to cart', e);
      alert('No se pudo agregar el producto al carrito');
    }
  }
}
