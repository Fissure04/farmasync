import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../services/agent.service';

@Component({
  selector: 'app-agent-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position:fixed;right:12px;bottom:12px;z-index:9999">
      <button (click)="ping()" title="Ping Agent" style="padding:8px 12px;border-radius:8px;background:#111827;color:#fff;border:none;box-shadow:0 2px 8px rgba(0,0,0,0.2);font-size:13px">Ping Agent</button>
    </div>
  `,
})
export class AgentDebugComponent {
  constructor(private agent: AgentService) {}

  ping() {
    console.log('[AgentDebug] ping() called');
    this.agent.ping().subscribe({
      next: (res) => console.log('[AgentDebug] ping response', res),
      error: (err) => console.error('[AgentDebug] ping error', err),
    });
  }
}
