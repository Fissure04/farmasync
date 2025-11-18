import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ClientAgentComponent } from './client-agent/client-agent.component';
import { AdminAgentComponent } from './admin-agent/admin-agent.component';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, ClientAgentComponent, AdminAgentComponent],
  template: `
    <div class="min-h-screen">
      <div *ngIf="authService.isAdmin(); else clientView">
        <app-admin-agent></app-admin-agent>
      </div>
      <ng-template #clientView>
        <div *ngIf="authService.isClient(); else noAuth">
          <app-client-agent></app-client-agent>
        </div>
        <ng-template #noAuth>
          <p class="p-4 text-sm bg-red-100 text-red-800">Not authenticated</p>
        </ng-template>
      </ng-template>
    </div>
  `,
})
export class AgentComponent implements OnInit {
  constructor(public authService: AuthService) {
    console.log('[AgentComponent] constructor - currentUser:', this.authService.currentUser);
  }

  ngOnInit() {
    console.log('[AgentComponent] ngOnInit - isAdmin:', this.authService.isAdmin(), 'isClient:', this.authService.isClient());
  }
}
