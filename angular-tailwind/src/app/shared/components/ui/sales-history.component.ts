import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SalesService } from '../../../services/sales.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  providers: [SalesService],
  template: `
    <div class="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Historial de Compras</h2>
      <div *ngIf="history.length > 0; else emptyHistory">
        <table class="w-full mb-6">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let sale of history">
              <td>{{ sale.date }}</td>
              <td>
                <ul>
                  <li *ngFor="let item of sale.items">{{ item.title || item.nombre }} (x{{ item.quantity }})</li>
                </ul>
              </td>
              <td>{{ sale.total | currency:'USD' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyHistory>
        <div class="text-center text-gray-500">No hay compras registradas.</div>
      </ng-template>
    </div>
  `,
  styles: []
})
export class SalesHistoryComponent {
  history: any[] = [];

  constructor(
    private salesService: SalesService,
    private auth: AuthService,
    private userService: UserService,
    private productService: ProductService
  ) {}

  async ngOnInit() {
    // Si hay usuario logueado con id, pedir ventas del servidor para ese cliente
    const user = this.auth.currentUser;
    if (user && user.id) {
      const rawId = user.id;
      const asNumber = typeof rawId === 'number' ? rawId : (typeof rawId === 'string' && /^\d+$/.test(rawId) ? Number(rawId) : null);
      if (asNumber !== null) {
        try {
          const ventas = await firstValueFrom(this.salesService.getSalesByClient(asNumber));
          // Map ventas.detallesVenta -> items with product names
          this.history = await Promise.all((ventas || []).map(async (v: any) => {
            const detalles = v.detallesVenta || [];
            const items = await Promise.all(detalles.map(async (d: any) => {
              // If the sales service provided productoNombre, use it directly to avoid extra inventory calls
              if (d.productoNombre) {
                return { title: d.productoNombre, quantity: d.cantidad ?? d.cantidad, precioUnitario: d.precioUnitario, imagen: d.productoImagenUrl };
              }
              try {
                const prod = await firstValueFrom(this.productService.getProductById(String(d.idProducto)));
                return { title: prod?.nombre ?? String(d.idProducto), quantity: d.cantidad ?? d.cantidad, precioUnitario: d.precioUnitario, imagen: prod?.imagen_url };
              } catch (e) {
                return { title: String(d.idProducto), quantity: d.cantidad ?? d.cantidad, precioUnitario: d.precioUnitario };
              }
            }));
            return { date: v.fechaVenta ?? v.fecha ?? new Date().toLocaleString(), items, total: v.total ?? detalles.reduce((s: any, x: any) => s + (Number(x.precioUnitario || 0) * Number(x.cantidad || 0)), 0) };
          }));
          return;
        } catch (e) {
          console.error('Error fetching sales for client:', e);
          // fallback a localStorage
        }
      } else {
        // user id is not numeric (likely an email); try to resolve numeric id via /me endpoint
        try {
          const me = await firstValueFrom(this.userService.getCurrentUser());
          if (me && (me as any).id) {
            const ventas = await firstValueFrom(this.salesService.getSalesByClient((me as any).id));
            // normalize ventas into the same internal format (date, items, total)
            this.history = await Promise.all((ventas || []).map(async (v: any) => this.mapVentaToEntry(v)));
            return;
          } else {
            console.warn('No se pudo resolver idCliente desde /me');
          }
        } catch (e) {
          console.error('Error resolving user id via /me:', e);
        }
      }
    }

    // fallback: leer historial local pero sólo ventas confirmadas (persistidas en servidor)
    const historyRaw = localStorage.getItem('salesHistory');
    const allLocal = historyRaw ? JSON.parse(historyRaw) : [];
    // mostrar sólo registros con remoteId (guardados en servidor) o marcados como confirmed
    this.history = (allLocal as any[]).filter(h => h.remoteId || h.confirmed).slice();
    // filtrar por idCliente si está presente
    if (user && user.id) {
      this.history = this.history.filter(h => h.idCliente == user.id || h.idCliente == String(user.id));
    }
  }

  private async mapVentaToEntry(v: any) {
    const detalles = v.detallesVenta || [];
    const items = await Promise.all(detalles.map(async (d: any) => {
      if (d.productoNombre) {
        return { title: d.productoNombre, quantity: d.cantidad ?? d.cantidad, precioUnitario: d.precioUnitario, imagen: d.productoImagenUrl };
      }
      try {
        const prod = await firstValueFrom(this.productService.getProductById(String(d.idProducto)));
        return { title: prod?.nombre ?? String(d.idProducto), quantity: d.cantidad ?? d.cantidad, precioUnitario: d.precioUnitario, imagen: prod?.imagen_url };
      } catch (e) {
        return { title: String(d.idProducto), quantity: d.cantidad ?? d.cantidad, precioUnitario: d.precioUnitario };
      }
    }));
    return { date: v.fechaVenta ?? v.fecha ?? new Date().toLocaleString(), items, total: v.total ?? detalles.reduce((s: any, x: any) => s + (Number(x.precioUnitario || 0) * Number(x.cantidad || 0)), 0), idCliente: v.idCliente, remoteId: v.id };
  }
}
