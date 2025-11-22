import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { SalesService } from '../../../services/sales.service';
import { AuthService } from '../../../services/auth.service';
import { UserService, UsuarioDTO } from '../../../services/user.service';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Resumen del Carrito</h2>
      <div *ngIf="cart.length > 0; else emptyCart">
        <table class="w-full mb-6">
          <thead>
            <tr>
              <th class="text-left">Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of cart">
              <td>{{ item.title || item.nombre }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ getUnitPrice(item) | currency:'USD' }}</td>
              <td>{{ getItemTotal(item) | currency:'USD' }}</td>
            </tr>
          </tbody>
        </table>
        <div class="text-right text-xl font-bold mb-4">Total: {{ getCartTotal() | currency:'USD' }}</div>
        <button class="px-6 py-3 rounded-lg bg-success-600 text-white font-medium" (click)="finalizePurchase()">Finalizar compra</button>
      </div>
      <ng-template #emptyCart>
        <div class="text-center text-gray-500">El carrito está vacío.</div>
      </ng-template>
      <div *ngIf="successMessage" class="mt-6 text-success-600 text-center font-bold">{{ successMessage }}</div>
    </div>
  `,
  styles: []
})
export class CartSummaryComponent {
  cart: any[] = [];
  successMessage = '';

  constructor(
    private productService: ProductService,
    private salesService: SalesService,
    private auth: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const cartRaw = localStorage.getItem('cart');
    this.cart = cartRaw ? JSON.parse(cartRaw) : [];
  }

  getUnitPrice(item: any) {
    const raw = item.price ?? item.precio ?? 0;
    if (typeof raw === 'number') return raw;
    const parsed = parseFloat(String(raw).replace(/[^\d.]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  getItemTotal(item: any) {
    return this.getUnitPrice(item) * (item.quantity || 1);
  }

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  async finalizePurchase() {
    if (!this.cart || this.cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    try {
      // Construir detalles de venta, asegurando tener idProducto
      const detalles: any[] = [];

      const insuficientes: string[] = [];
      for (const item of this.cart) {
        let idProducto: string | undefined = item.id ?? item.idProducto ?? item.nombreId ?? undefined;
        let productoInfo: any = null;
        const cantidad = item.quantity || 1;

        // Si tiene id, obtener info directa
        if (idProducto) {
          try {
            productoInfo = await firstValueFrom(this.productService.getProductById(idProducto));
          } catch (e) {
            // intentar búsqueda por nombre como fallback
            productoInfo = null;
          }
        }

        // Si no tiene info (no hay id o getById falló), buscar por nombre
        if (!productoInfo) {
          const name = item.title ?? item.nombre ?? item.description ?? '';
          if (!name) {
            throw new Error('No se encontró identificador ni nombre para uno de los productos');
          }
          const results = await firstValueFrom(this.productService.searchProductsByName(name));
          if (!results || results.length === 0) {
            throw new Error(`No se encontró el producto en inventario para: ${name}`);
          }
          productoInfo = results[0];
          idProducto = idProducto ?? productoInfo.id;
        }

        // Validar stock
        const stockDisponible = productoInfo?.stock ?? productoInfo?.cantidad ?? null;
        if (stockDisponible !== null && typeof stockDisponible === 'number' && stockDisponible < cantidad) {
          insuficientes.push(`${productoInfo.nombre ?? productoInfo.title ?? productoInfo.id} (disponible: ${stockDisponible}, pedido: ${cantidad})`);
          continue; // no agregar a detalles
        }

        const precioUnit = productoInfo?.precio ?? productoInfo?.price ?? this.getUnitPrice(item);

        detalles.push({
          idProducto: idProducto,
          cantidad: cantidad,
          precioUnitario: precioUnit
        });
      }

      if (insuficientes.length > 0) {
        alert('No hay suficiente stock para los siguientes productos:\n' + insuficientes.join('\n'));
        return;
      }

      const ventaPayload: any = {
        idCliente: null,
        detallesVenta: detalles
      };

      // Si hay usuario logueado y se puede obtener un id numérico, incluirlo
      const current = this.auth.currentUser;
      if (current && (current as any).id) {
        const rawId = (current as any).id;
        const asNumber = typeof rawId === 'number' ? rawId : (typeof rawId === 'string' && /^\d+$/.test(rawId) ? Number(rawId) : null);
        if (asNumber !== null) {
          ventaPayload.idCliente = asNumber;
        } else {
          // no tenemos un id numérico; intentar resolver por email si está disponible
          const email = (current as any).email ?? String(rawId);
          try {
            // Use the protected /me endpoint to obtain the current user's ID.
            // This endpoint should accept the Authorization header set by the interceptor.
            const me = await firstValueFrom(this.userService.getCurrentUser());
            if (me && me.id) {
              ventaPayload.idCliente = me.id as number;
            } else {
              ventaPayload.idCliente = null;
            }
          } catch (e: any) {
            console.warn('No se pudo resolver idCliente via /me, enviando null para idCliente', e);
            ventaPayload.idCliente = null;
          }
        }
      }

      // Llamada al microservicio de ventas
      const created = await firstValueFrom(this.salesService.createSale(ventaPayload));

      // Guardar en historial local como respaldo/registro de UI
      const historyRaw = localStorage.getItem('salesHistory');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      const saleRecord = {
        date: new Date().toLocaleString(),
        items: [...this.cart],
        total: this.getCartTotal(),
        remoteId: created?.id ?? null,
        idCliente: ventaPayload.idCliente ?? created?.idCliente ?? null
      };
      history.unshift(saleRecord);
      localStorage.setItem('salesHistory', JSON.stringify(history));

      // Limpiar carrito
      localStorage.removeItem('cart');
      this.cart = [];
      this.successMessage = '¡Compra realizada con éxito! (guardada en servidor)';
      try { window.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: 0 } })); } catch(e) {}

    } catch (err: any) {
      console.error('Error finalizando compra:', err);
      const status = err?.status;
      const serverError = err?.error;
      const serverMsg = status ? `Status ${status}: ${serverError?.message ?? JSON.stringify(serverError)}` : (err?.message || String(err));
      alert('Ocurrió un error al intentar guardar la venta en el servidor: ' + serverMsg);
      // Como fallback, guardar borrador localmente para no perder datos (no se mostrará en Historial público)
      const draftsRaw = localStorage.getItem('salesDrafts');
      const drafts = draftsRaw ? JSON.parse(draftsRaw) : [];
      const draft = {
        date: new Date().toLocaleString(),
        items: [...this.cart],
        total: this.getCartTotal(),
        idCliente: this.auth.currentUser?.id ?? null,
        draft: true
      };
      drafts.unshift(draft);
      localStorage.setItem('salesDrafts', JSON.stringify(drafts));
      localStorage.removeItem('cart');
      this.cart = [];
      this.successMessage = '¡Compra registrada localmente (sin conexión al servidor)!';
      try { window.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: 0 } })); } catch(e) {}
    }
  }
}
