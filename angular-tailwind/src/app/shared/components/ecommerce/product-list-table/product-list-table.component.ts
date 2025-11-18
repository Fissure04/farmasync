import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../../services/product.service';
interface Sort {
  key: keyof Product;
  asc: boolean;
}

@Component({
  selector: 'app-product-list-table',
  standalone: true,
  imports: [
    CommonModule,
    TableDropdownComponent,
    ButtonComponent,
    RouterModule,
  ],
  templateUrl: './product-list-table.component.html',
  styles: ``
})
export class ProductListTableComponent implements OnInit {

  products: Product[] = [];
  loading = false;
  error = '';

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.error = 'Error al cargar productos';
        this.loading = false;
      }
    });
  }

  selected: string[] = [];
  sort: Sort = { key: 'nombre', asc: true };
  page: number = 1;
  perPage: number = 7;
  showFilter: boolean = false;

  get totalProductsLength(): number {
    return this.products.filter(p => p.id !== undefined).length;
  }

  sortedProducts(): Product[] {
    return [...this.products].sort((a, b) => {
      let valA: any = a[this.sort.key];
      let valB: any = b[this.sort.key];
      if (this.sort.key === 'precio') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }
      if (valA < valB) return this.sort.asc ? -1 : 1;
      if (valA > valB) return this.sort.asc ? 1 : -1;
      return 0;
    });
  }

  paginatedProducts(): Product[] {
    const start = (this.page - 1) * this.perPage;
    return this.sortedProducts().filter(p => p.id !== undefined).slice(start, start + this.perPage);
  }

  totalPages(): number {
    return Math.ceil(this.totalProductsLength / this.perPage);
  }

  goToPage(n: number): void {
    if (n >= 1 && n <= this.totalPages()) {
      this.page = n;
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages()) {
      this.page++;
    }
  }

  toggleSelect(id: string): void {
    this.selected = this.selected.includes(id)
      ? this.selected.filter((i) => i !== id)
      : [...this.selected, id];
  }

  toggleAll(): void {
    const ids = this.paginatedProducts().map((p) => p.id).filter(id => id !== undefined) as string[];
    this.selected = this.isAllSelected()
      ? this.selected.filter((id) => !ids.includes(id))
      : [...new Set([...this.selected, ...ids])];
  }

  isAllSelected(): boolean {
    const ids = this.paginatedProducts().map((p) => p.id).filter(id => id !== undefined) as string[];
    return ids.length > 0 && ids.every((id) => this.selected.includes(id));
  }

  startItem(): number {
    return this.totalProductsLength === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  endItem(): number {
    return Math.min(this.page * this.perPage, this.totalProductsLength);
  }

  sortBy(key: keyof Product): void {
    this.sort = {
      key,
      asc: this.sort.key === key ? !this.sort.asc : true,
    };
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

   handleViewMore() {
    console.log('View More clicked');
    // Add your view more logic here
  }

  handleEdit(product: Product) {
    console.log('Edit clicked for product:', product);
    // Navigate to edit page with product id
    this.router.navigate(['/edit-product', product.id]);
  }

  handleDelete() {
    console.log('Delete clicked');
    // Add your delete logic here
  }
}
