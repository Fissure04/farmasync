import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LabelComponent,
    InputFieldComponent,
    ButtonComponent,
    PageBreadcrumbComponent,
  ],
  templateUrl: './edit-product.component.html',
  styles: ``
})
export class EditProductComponent implements OnInit {
  productForm: FormGroup;
  productId: string = '';
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      provedor_id: ['', Validators.required],
      imagen_url: ['']
    });
  }

  ngOnInit() {
    this.productId = this.route.snapshot.params['id'];
    if (this.productId) {
      this.loadProduct();
    }
  }

  loadProduct() {
    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue(product);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading product:', err);
        this.error = 'Error al cargar el producto';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.loading = true;
      this.error = '';
      const productData = this.productForm.value;

      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (product: Product) => {
          console.log('Product updated successfully:', product);
          this.router.navigate(['/dashboard/ecommerce']);
        },
        error: (err: any) => {
          console.error('Error updating product:', err);
          this.error = 'Error al actualizar el producto';
          this.loading = false;
        }
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard/ecommerce']);
  }
}
