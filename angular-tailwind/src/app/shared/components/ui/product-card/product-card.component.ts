import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-theme-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="relative">
        <img [src]="image" alt="{{title}}" class="w-full h-40 object-cover" />
        <div class="absolute top-3 right-3 bg-white/80 dark:bg-gray-900/60 rounded-full px-2 py-1 text-xs font-semibold text-gray-800 dark:text-white">
          {{ badge }}
        </div>
      </div>
      <div class="p-4">
        <h4 class="text-sm font-semibold text-gray-800 dark:text-white mb-1">{{ title }}</h4>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">{{ description }}</p>
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium text-brand-600 dark:text-brand-400">{{ price }}</div>
          <button class="px-3 py-1 rounded-lg bg-brand-500 text-white text-xs hover:bg-brand-600 transition">Comprar</button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ProductCardComponent {
  @Input() title = 'Producto';
  @Input() description = '';
  @Input() price = '$0.00';
  @Input() image = '/public/images/product/default.png';
  @Input() badge = '';
}
