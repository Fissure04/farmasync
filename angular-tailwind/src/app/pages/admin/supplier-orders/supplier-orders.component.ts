import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  totalItems: number;
  totalAmount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery: string;
}

@Component({
  selector: 'app-supplier-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-orders.component.html',
})
export class SupplierOrdersComponent {
  orders: Order[] = [
    { id: 1, orderNumber: 'ORD-001', customer: 'Juan Pérez', totalItems: 3, totalAmount: 150.00, status: 'delivered', orderDate: '2024-01-10', estimatedDelivery: '2024-01-15' },
    { id: 2, orderNumber: 'ORD-002', customer: 'María García', totalItems: 2, totalAmount: 89.99, status: 'shipped', orderDate: '2024-01-12', estimatedDelivery: '2024-01-18' },
    { id: 3, orderNumber: 'ORD-003', customer: 'Carlos López', totalItems: 5, totalAmount: 245.50, status: 'pending', orderDate: '2024-01-14', estimatedDelivery: '2024-01-20' },
    { id: 4, orderNumber: 'ORD-004', customer: 'Ana Martínez', totalItems: 1, totalAmount: 25.00, status: 'delivered', orderDate: '2024-01-15', estimatedDelivery: '2024-01-17' },
    { id: 5, orderNumber: 'ORD-005', customer: 'Pedro Rodríguez', totalItems: 4, totalAmount: 320.75, status: 'pending', orderDate: '2024-01-16', estimatedDelivery: '2024-01-22' },
  ];

  searchTerm = '';
  filterStatus = '';

  getTotalOrders(): number {
    return this.orders.length;
  }

  getPendingCount(): number {
    return this.orders.filter(o => o.status === 'pending').length;
  }

  getShippedCount(): number {
    return this.orders.filter(o => o.status === 'shipped').length;
  }

  getTotalAmount(): string {
    const total = this.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return total.toFixed(2);
  }

  getFilteredOrders(): Order[] {
    return this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.filterStatus || order.status === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-400';
      case 'shipped': return 'bg-blue-light-100 text-blue-light-700 dark:bg-blue-light-900 dark:text-blue-light-400';
      case 'delivered': return 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-400';
      case 'cancelled': return 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  viewOrder(order: Order) {
    alert('Viendo detalles del pedido: ' + order.orderNumber);
  }

  cancelOrder(id: number) {
    const order = this.orders.find(o => o.id === id);
    if (order && confirm('¿Está seguro de que desea cancelar este pedido?')) {
      order.status = 'cancelled';
    }
  }
}
