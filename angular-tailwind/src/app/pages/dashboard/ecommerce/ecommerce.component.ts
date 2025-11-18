import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../../shared/components/ecommerce/product-card/product-card.component';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  searchQuery = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.filteredProducts = products;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    if (this.searchQuery.trim() === '') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
}
