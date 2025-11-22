import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Angular Ecommerce Dashboard | TailAdmin';
  constructor(private auth: AuthService) {
    // Strategy:
    // 1) Try to fetch a public file at `/assets/admin.token` (one-line token). If present, use it.
    // 2) Poll that file periodically so when your deployment updates the token the UI picks it up.
    // 3) If the file is absent, fall back to prompting the user the first time they switch to Admin.

    const POLL_MS = 1000 * 60 * 15; // 15 minutes

    const applyTokenIfChanged = async () => {
      try {
        const resp = await fetch('/assets/admin.token', { cache: 'no-cache' });
        if (!resp.ok) return;
        const text = (await resp.text()).trim();
        if (!text) return;
        const existing = localStorage.getItem('adminToken');
        if (existing !== text) {
          this.auth.setAdminToken(text);
          console.info('Admin token loaded from /assets/admin.token');
        }
      } catch (e) {
        // ignore fetch errors silently; fallback remains prompt/manual
      }
    };

    // Try once at startup
    void applyTokenIfChanged();

    // Poll periodically to pick up rotated tokens without a full deploy
    setInterval(() => void applyTokenIfChanged(), POLL_MS);
  }
}
