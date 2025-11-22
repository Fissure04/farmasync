import { Component, ElementRef, ViewChild } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  cartCount = 0;
  isApplicationMenuOpen = false;
  showUserSwitcher = false;
  readonly isMobileOpen$;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    public sidebarService: SidebarService,
    public authService: AuthService
  ) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.updateCartCount();
    // listen for cart changes
    window.addEventListener('cart:changed', this.onCartChanged as EventListener);
  }

  handleToggle() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  toggleApplicationMenu() {
    this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
  }

  switchToAdmin() {
    // If admin token is present it will be used by interceptor. If not, allow pasting it.
    const existing = localStorage.getItem('adminToken');
    if (!existing) {
      const token = prompt('Pega aquí el token ADMIN (se guardará en localStorage)');
      if (token) {
        this.authService.setAdminToken(token);
      }
    } else {
      // refresh current user state
      this.authService.setAdminToken(existing);
    }
    this.showUserSwitcher = false;
  }

  switchToClient() {
    // Remove admin token and ensure we are unauthenticated (or prompt a client login)
    localStorage.removeItem('adminToken');
    this.authService.logout();
    this.showUserSwitcher = false;
  }

  ngAfterViewInit() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('cart:changed', this.onCartChanged as EventListener);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };

  onCartChanged = (e: Event | any) => {
    // event can be CustomEvent with detail.count
    try {
      if (e && e.detail && typeof e.detail.count === 'number') {
        this.cartCount = e.detail.count;
      } else {
        this.updateCartCount();
      }
    } catch (err) {
      this.updateCartCount();
    }
  }

  updateCartCount() {
    try {
      const cartRaw = localStorage.getItem('cart');
      const cart = cartRaw ? JSON.parse(cartRaw) : [];
      this.cartCount = cart.reduce((s: number, it: any) => s + (it.quantity || 0), 0);
    } catch (e) {
      this.cartCount = 0;
    }
  }
}
