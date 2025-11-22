import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { CartComponent } from './pages/cart/cart.component';
import { AgentComponent } from './pages/agent/agent.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';
import { InventoryManagementComponent } from './pages/admin/inventory-management/inventory-management.component';
import { SupplierOrdersComponent } from './pages/admin/supplier-orders/supplier-orders.component';
import { EditProductComponent } from './pages/forms/edit-product/edit-product.component';

export const routes: Routes = [
  // auth pages
  {
    path:'signin',
    component:SignInComponent,
    title:'FarmAsync - Iniciar Sesión'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'FarmAsync - Registrarse'
  },
  {
    path:'',
    redirectTo: '/signin',
    pathMatch: 'full',
  },
  {
    path:'',
    component:AppLayoutComponent,
    children:[
      {
        path: 'dashboard',
        component: EcommerceComponent,
        title: 'FarmAsync - Dashboard',
      },
      {
        path: 'cart',
        component: CartComponent,
        title: 'FarmAsync - Carrito de Compras',
      },
      {
        path: 'agent',
        component: AgentComponent,
        title: 'FarmAsync - Agente Inteligente',
      },
      {
        path: 'admin',
        component: AdminDashboardComponent,
        title: 'FarmAsync - Panel Administrativo',
      },
      {
        path: 'admin/users',
        component: UserManagementComponent,
        title: 'FarmAsync - Gestión de Usuarios',
      },
      {
        path: 'admin/inventory',
        component: InventoryManagementComponent,
        title: 'FarmAsync - Gestión de Inventario',
      },
      {
        path: 'admin/orders',
        component: SupplierOrdersComponent,
        title: 'FarmAsync - Gestión de Pedidos',
      },
      {
        path:'calendar',
        component:CalenderComponent,
        title:'Angular Calender | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'profile',
        component:ProfileComponent,
        title:'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'form-elements',
        component:FormElementsComponent,
        title:'Angular Form Elements Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'edit-product/:id',
        component:EditProductComponent,
        title:'FarmAsync - Editar Producto'
      },
      {
        path:'basic-tables',
        component:BasicTablesComponent,
        title:'Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'blank',
        component:BlankComponent,
        title:'Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      // support tickets
      {
        path:'invoice',
        component:InvoicesComponent,
        title:'Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'line-chart',
        component:LineChartComponent,
        title:'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'bar-chart',
        component:BarChartComponent,
        title:'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'alerts',
        component:AlertsComponent,
        title:'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'avatars',
        component:AvatarElementComponent,
        title:'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'badge',
        component:BadgesComponent,
        title:'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'buttons',
        component:ButtonsComponent,
        title:'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'images',
        component:ImagesComponent,
        title:'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'videos',
        component:VideosComponent,
        title:'Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
    ]
  },
  // error pages
  {
    path:'**',
    component:NotFoundComponent,
    title:'FarmAsync - Página No Encontrada'
  },
];
