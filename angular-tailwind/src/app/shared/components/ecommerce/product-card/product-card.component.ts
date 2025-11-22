import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  provedor_id: string;
  imagen_url?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product;
  
  addToCart(product: Product) {
    try {
      const cartRaw = localStorage.getItem('cart');
      const cart: any[] = cartRaw ? JSON.parse(cartRaw) : [];

      const idx = cart.findIndex(p => (p.id && product.id) ? p.id === product.id : p.nombre === product.nombre);
      const currentQty = idx >= 0 ? (cart[idx].quantity || 1) : 0;
      if (product.stock !== undefined && (currentQty + 1) > product.stock) {
        alert('No hay suficiente stock para agregar más unidades de este producto');
        return;
      }

      if (idx >= 0) {
        cart[idx].quantity = currentQty + 1;
      } else {
        cart.push({
          id: product.id,
          nombre: product.nombre,
          descripcion: product.descripcion,
          precio: product.precio,
          imagen_url: product.imagen_url,
          provedor_id: product.provedor_id,
          stock: product.stock,
          quantity: 1
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      // Notify other components that cart changed
      try {
        const totalCount = cart.reduce((s, it) => s + (it.quantity || 0), 0);
        window.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: totalCount } }));
      } catch (e) {
        // ignore dispatch failures in older browsers
      }
      alert('Producto agregado al carrito');
    } catch (e) {
      console.error('Error adding to cart', e);
      alert('No se pudo agregar el producto al carrito');
    }
  }
}
