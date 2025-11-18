// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-recent-orders',
//   imports: [CommonModule],
//   templateUrl: './recent-orders.component.html',
//   styleUrl: './recent-orders.component.css'
// })
// export class RecentOrdersComponent {

// }


import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { PurchaseModalComponent } from '../../ui/purchase-modal/purchase-modal.component';

export interface Product {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  image: string;
}

@Component({
  selector: 'app-recent-orders',
  imports: [
    CommonModule,
    BadgeComponent,
    PurchaseModalComponent,
  ],
  templateUrl: './recent-orders.component.html'
})
export class RecentOrdersComponent {
  tableData: Product[] = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      variants: "Caja de 20 tabletas",
      category: "Analgésicos",
      price: "$5.99",
      image: "/images/product/product-01.jpg",
    },
    {
      id: 2,
      name: "Ibuprofeno 400mg",
      variants: "Caja de 30 tabletas",
      category: "Antiinflamatorios",
      price: "$7.50",
      image: "/images/product/product-02.jpg",
    },
    {
      id: 3,
      name: "Amoxicilina 500mg",
      variants: "Caja de 12 cápsulas",
      category: "Antibióticos",
      price: "$12.99",
      image: "/images/product/product-03.jpg",
    },
    {
      id: 4,
      name: "Vitamina C 1000mg",
      variants: "Frasco de 60 tabletas",
      category: "Vitaminas",
      price: "$15.00",
      image: "/images/product/product-04.jpg",
    },
    {
      id: 5,
      name: "Loratadina 10mg",
      variants: "Caja de 20 tabletas",
      category: "Antihistamínicos",
      price: "$8.25",
      image: "/images/product/product-05.jpg",
    },
  ];

  isModalOpen = false;
  selectedProduct: Product | null = null;

  openProduct(product: Product) {
    this.selectedProduct = product;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedProduct = null;
  }

  onCheckout(data: { product: Product; quantity: number }) {
    console.log('Compra realizada:', data);
    alert(`Compra exitosa: ${data.quantity} × ${data.product.name}`);
  }
}