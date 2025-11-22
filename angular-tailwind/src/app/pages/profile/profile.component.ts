import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ClientInfoCardComponent } from '../../shared/components/user-profile/client-info-card/client-info-card.component';
import { SalesHistoryComponent } from '../../shared/components/ui/sales-history.component';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ClientInfoCardComponent,
    SalesHistoryComponent,
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {

}
