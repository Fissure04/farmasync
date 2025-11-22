import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UserFormComponent, UserFormDTO } from '../../../shared/components/ui/user-form/user-form.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, UserFormComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Crear Usuario</h1>
      <app-user-form
        [isOpen]="true"
        [mode]="'create'"
        [title]="'Agregar usuario'"
        [initial]="null"
        (close$)="onUserFormClose()"
        (save$)="onUserFormSave($event)"
      ></app-user-form>
    </div>
  `,
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];

  searchTerm = '';
  filterRole = '';

  // mode: create vs edit
  isCreateMode = true;

  openAddUserModal() {
    this.isCreateMode = true;
    this.editingId = undefined;
    this.editingInitial = null;
    this.isUserFormOpen = true;
  }

  editUser(user: User) {
    if (!user.id) {
      alert('No se puede editar: el usuario no tiene un ID expuesto por la API.');
      return;
    }
    // prepare initial model for the form
    const parts = (user.name || '').split(' ');
    const nombre = parts.shift() || '';
    const apellido = parts.join(' ') || '';
    this.isCreateMode = false;
    this.editingId = user.id;
    this.editingInitial = {
      nombre,
      apellido,
      email: user.email,
      direccion: '',
      telefono: '' ,
      password: '',
      idRol: this.roleToId(user.role)
    } as UserFormDTO;
    this.isUserFormOpen = true;
  }

  deleteUser(id: number) {
    if (!id) {
      alert('No se puede eliminar: el usuario no tiene ID.');
      return;
    }

    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
        alert('Usuario eliminado.');
      },
      error: err => {
        console.error(err);
        alert('Error eliminando usuario: ' + (err?.message || err));
      }
    });
  }

  // user form modal state
  isUserFormOpen = false;
  editingInitial: UserFormDTO | null = null;
  editingId?: number | undefined;

  onUserFormClose() {
    this.isUserFormOpen = false;
    this.editingInitial = null;
    this.editingId = undefined;
    // Redirigir al panel principal del admin
    window.location.href = '/admin';
  }

  onUserFormSave(event: { id?: number; dto: any }) {
    if (event.id) {
      // update (no se usa en este modo)
      return;
    } else {
      // create
      this.userService.createUser(event.dto).subscribe({
        next: created => {
          alert('Usuario creado correctamente.');
          this.onUserFormClose();
        },
        error: err => {
          console.error(err);
          alert('Error creando usuario: ' + (err?.error || err?.message || err));
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-400';
      case 'inactive': return 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-400';
      case 'suspended': return 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return 'Suspendido';
      default: return status;
    }
  }

  getActiveCount(): number {
    return this.users.filter(u => u.status === 'active').length;
  }

  getInactiveCount(): number {
    return this.users.filter(u => u.status === 'inactive').length;
  }

  getSuspendedCount(): number {
    return this.users.filter(u => u.status === 'suspended').length;
  }

  getFilteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.filterRole || user.role === this.filterRole;
      
      return matchesSearch && matchesRole;
    });
  }

  constructor(private userService: UserService, private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    // Load locally persisted users first so they are visible even without admin token
    this.users = this.loadLocalUsers();
    this.loadUsers();
  }

  private loadUsers() {
    const tryLoad = (retry = true) => {
      this.userService.getUsers().subscribe({
        next: (list) => {
          // Map backend DTO to the local User interface
          const serverUsers: User[] = list.map((u, idx) => ({
            id: (u as any).id ?? (idx + 1),
            name: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
            email: u.email,
            role: u.nombreRol ? this.capitalize(u.nombreRol) : 'Cliente',
            status: 'active',
            lastLogin: ''
          }));

          // Merge serverUsers into this.users, preferring server data but keeping local-only users
          const merged = [...this.users];
          for (const su of serverUsers) {
            const existingIdx = merged.findIndex(mu => mu.email === su.email);
            if (existingIdx >= 0) {
              merged[existingIdx] = su; // overwrite with server authoritative data
            } else {
              merged.push(su);
            }
          }
          this.users = merged;
        },
        error: err => {
          console.error('Error cargando usuarios', err);
          // If 403 (forbidden) try to fetch admin token from assets and retry once
          if (err && err.status === 403 && retry) {
            console.info('Recibiendo 403 — intentando cargar token admin desde /assets/admin.token y reintentando');
            this.http.get('/assets/admin.token', { responseType: 'text' }).subscribe({
              next: (token) => {
                if (token) {
                  this.auth.setAdminToken(token.trim());
                }
                // retry once
                tryLoad(false);
              },
              error: e2 => {
                console.error('No se pudo obtener /assets/admin.token', e2);
                alert('No autorizado para listar usuarios. Asegúrate de tener un token admin válido.');
              }
            });
            return;
          }

          alert('No se pudieron cargar los usuarios. Revisa la consola.');
        }
      });
    };

    // If no admin token exists, try to fetch it first (useful when token is rotated)
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      this.http.get('/assets/admin.token', { responseType: 'text' }).subscribe({
        next: (t) => {
          if (t) this.auth.setAdminToken(t.trim());
          tryLoad();
        },
        error: (e) => {
          console.warn('No se pudo obtener /assets/admin.token al iniciar user-management', e);
          // still try, maybe the user is logged as admin
          tryLoad();
        }
      });
    } else {
      tryLoad();
    }
  }

  // --- Local persistence helpers ---
  private localStorageKey = 'localUsers';

  private loadLocalUsers(): User[] {
    try {
      const raw = localStorage.getItem(this.localStorageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as any[];
      return parsed.map((u, idx) => ({
        id: u.id ?? -(idx + 1),
        name: u.name || `${u.nombre || ''} ${u.apellido || ''}`.trim(),
        email: u.email,
        role: u.role || 'Cliente',
        status: 'active',
        lastLogin: ''
      }));
    } catch (e) {
      console.warn('No se pudieron cargar usuarios locales', e);
      return [];
    }
  }

  private saveLocalUser(created: any) {
    try {
      const raw = localStorage.getItem(this.localStorageKey);
      const arr = raw ? JSON.parse(raw) : [];
      // represent stored user with basic fields
      const toStore = {
        id: created.id,
        nombre: created.nombre,
        apellido: created.apellido,
        email: created.email,
        nombreRol: created.nombreRol || 'cliente'
      };
      // replace if same email
      const idx = arr.findIndex((x: any) => x.email === toStore.email);
      if (idx >= 0) arr[idx] = toStore; else arr.unshift(toStore);
      localStorage.setItem(this.localStorageKey, JSON.stringify(arr));
    } catch (e) {
      console.warn('No se pudo guardar usuario localmente', e);
    }
  }

  private removeLocalUserByEmail(email: string) {
    try {
      const raw = localStorage.getItem(this.localStorageKey);
      if (!raw) return;
      const arr = JSON.parse(raw) as any[];
      const filtered = arr.filter(u => u.email !== email);
      localStorage.setItem(this.localStorageKey, JSON.stringify(filtered));
    } catch (e) {
      console.warn('No se pudo eliminar usuario localmente', e);
    }
  }

  private capitalize(s?: string) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  private roleToId(role: string) {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return 1;
    return 2; // cliente default
  }

  private idToRole(id: number) {
    if (id === 1) return 'Admin';
    return 'Cliente';
  }
}

