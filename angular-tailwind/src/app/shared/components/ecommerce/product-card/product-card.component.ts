import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  provedor_id: string;
  imagen_url?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product;
}
