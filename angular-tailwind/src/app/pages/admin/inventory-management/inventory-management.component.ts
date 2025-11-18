import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';

interface ProductWithStatus extends Product {
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-management.component.html',
})
export class InventoryManagementComponent implements OnInit {
  products: ProductWithStatus[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = '';
  showAddModal = false;
  showEditModal = false;
  editingProduct: ProductWithStatus | null = null;
  newProduct: Partial<Product> = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagen_url: '',
    provedor_id: 'prov-001'
  };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products.map(p => ({
          ...p,
          status: p.stock > 0 ? 'active' : 'inactive'
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    });
  }

  openAddProductModal() {
    this.newProduct = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagen_url: '',
      provedor_id: 'prov-001'
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveNewProduct() {
    if (!this.newProduct.nombre || !this.newProduct.precio || this.newProduct.stock === undefined) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    this.productService.createProduct(this.newProduct as Product).subscribe({
      next: (product) => {
        this.loadProducts();
        this.closeAddModal();
      },
      error: (err) => {
        console.error('Error creating product:', err);
        alert('Error al crear el producto');
      }
    });
  }

  editProduct(product: ProductWithStatus) {
    this.editingProduct = { ...product };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingProduct = null;
  }

  saveEditedProduct() {
    if (!this.editingProduct) return;

    this.productService.updateProduct(this.editingProduct.id!, this.editingProduct).subscribe({
      next: (product) => {
        this.loadProducts();
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error updating product:', err);
        alert('Error al actualizar el producto');
      }
    });
  }

  deleteProduct(id: string) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Error al eliminar el producto');
        }
      });
    }
  }

  getActiveProductsCount(): number {
    return this.products.filter(p => p.status === 'active').length;
  }

  getLowStockCount(): number {
    return this.products.filter(p => p.stock < 10).length;
  }

  getTotalInventoryValue(): string {
    const total = this.products.reduce((sum, p) => sum + (p.precio * p.stock), 0);
    return total.toFixed(2);
  }

  getFilteredProducts(): ProductWithStatus[] {
    return this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus || product.status === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }
}
