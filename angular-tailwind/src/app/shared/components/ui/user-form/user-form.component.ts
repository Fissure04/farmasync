import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { LabelComponent } from '../../form/label/label.component';

export interface UserFormDTO {
  nombre: string | number;
  apellido: string | number;
  email: string | number;
  direccion?: string | number;
  telefono?: string | number;
  password?: string | number;
  idRol?: number;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputFieldComponent, LabelComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ title }}</h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-6">
          <form (ngSubmit)="onSave()" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <app-label>Nombre <span class="text-error-500">*</span></app-label>
                <app-input-field [value]="model.nombre" (valueChange)="model.nombre = $event" required />
              </div>
              <div>
                <app-label>Apellido <span class="text-error-500">*</span></app-label>
                <app-input-field [value]="model.apellido" (valueChange)="model.apellido = $event" required />
              </div>
            </div>

            <div>
              <app-label>Email <span class="text-error-500">*</span></app-label>
              <app-input-field type="email" [value]="model.email" (valueChange)="model.email = $event" required />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <app-label>Teléfono</app-label>
                <app-input-field [value]="model.telefono ?? ''" (valueChange)="model.telefono = $event" />
              </div>
              <div>
                <app-label>Dirección</app-label>
                <app-input-field [value]="model.direccion ?? ''" (valueChange)="model.direccion = $event" />
              </div>
            </div>

            <div>
              <app-label>Contraseña <span class="text-gray-500 text-xs" *ngIf="mode === 'edit'">(dejar en blanco si no se modifica)</span></app-label>
              <app-input-field type="password" [value]="model.password ?? ''" (valueChange)="model.password = $event" [required]="mode === 'create'" />
            </div>

            <!-- Role selection removed: role is automatically Cliente on create and preserved on edit -->

            <div class="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" (click)="close()" class="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white">Cancelar</button>
              <button type="submit" class="px-6 py-3 rounded-lg bg-brand-600 text-white">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UserFormComponent {
  @Input() isOpen = false;
  @Input() title = 'Usuario';
  @Input() initial: UserFormDTO | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() close$ = new EventEmitter<void>();
  @Output() save$ = new EventEmitter<{ id?: number; dto: UserFormDTO }>();

  model: UserFormDTO = { nombre: '', apellido: '', email: '', direccion: '', telefono: '', password: '', idRol: 2 };
  editingId?: number;

  ngOnChanges(): void {
    if (this.initial) {
      this.model = { ...this.initial } as UserFormDTO;
    } else {
      this.model = { nombre: '', apellido: '', email: '', direccion: '', telefono: '', password: '', idRol: 2 };
    }
  }

  close() {
    this.close$.emit();
  }

  onSave() {
    // in create mode we force Cliente (idRol = 2) and require a password
    if (this.mode === 'create') {
      if (!this.model.password || String(this.model.password).trim() === '') {
        alert('La contraseña es requerida para crear un usuario.');
        return;
      }
      const dto: UserFormDTO = { ...this.model, idRol: 2 };
      this.save$.emit({ dto });
      this.close();
      return;
    }

    // edit mode: preserve existing idRol if present, otherwise default to cliente
    const idRol = this.model.idRol ?? 2;
    const dto: UserFormDTO = { ...this.model, idRol };
    this.save$.emit({ id: this.editingId, dto });
    this.close();
  }
}
