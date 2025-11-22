import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-client-info-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <h4 class="text-lg font-semibold mb-2">Información del Cliente</h4>
      <ng-container *ngIf="user; else loading">
        <div class="text-sm text-gray-700 dark:text-gray-200">Nombre: <strong>{{ user.nombre }} {{ user.apellido }}</strong></div>
        <div class="text-sm text-gray-700 dark:text-gray-200">Email: <strong>{{ user.email }}</strong></div>
        <div *ngIf="user.telefono" class="text-sm text-gray-700 dark:text-gray-200">Teléfono: <strong>{{ user.telefono }}</strong></div>
        <div *ngIf="user.direccion" class="text-sm text-gray-700 dark:text-gray-200">Dirección: <strong>{{ user.direccion }}</strong></div>
      </ng-container>
      <ng-template #loading>
        <div class="text-sm text-gray-500">Cargando información del cliente...</div>
      </ng-template>
    </div>
  `,
  styles: []
})
export class ClientInfoCardComponent {
  user: any = null;

  constructor(private userService: UserService) {}

  async ngOnInit() {
    try {
      this.user = await firstValueFrom(this.userService.getCurrentUser());
    } catch (e) {
      console.warn('No se pudo obtener información del usuario vía /me', e);
      this.user = null;
    }
  }
}
