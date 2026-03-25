import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HeaderComponent } from "../components/header/header.component";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "../components/footer/footer.component";
import { SideNavComponent } from "../components/sidenav/side-nav.component";
import { UiPreferencesService } from "../core/ui-preferences.service";
import { NotificationsService } from "../core/notifications.service";

@Component({
  selector: "reqquest-home",
  standalone: true,

  imports: [
    CommonModule,
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    SideNavComponent,
  ],
  template: `
    <div class="flex h-dvh min-h-dvh max-w-full flex-col overflow-hidden">
      <reqquest-header class="shrink-0"></reqquest-header>

      <main class="flex min-h-0 flex-1 overflow-hidden bg-muted/30 max-md:flex-col">
        <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
          <router-outlet></router-outlet>
        </div>

        <reqquest-side-nav
          class="md:order-first"
          [sidebarExpanded]="uiPreferences.sidebarExpanded()"
        ></reqquest-side-nav>
      </main>

      <reqquest-footer
        class="shrink-0 max-md:hidden"
        [sidebarExpanded]="uiPreferences.sidebarExpanded()"
        [darkMode]="uiPreferences.darkMode()"
        [restLayout]="uiPreferences.restLayout()"
        [interceptorEnabled]="uiPreferences.interceptorEnabled()"
      ></reqquest-footer>

      @if (notifications.notices().length > 0) {
        <section
          class="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4"
        >
          @for (notice of notifications.notices(); track notice.id) {
            <article
              class="pointer-events-auto flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow"
              [ngClass]="{
                'border-emerald-300 text-emerald-700':
                  notice.tone === 'success',
                'border-amber-300 text-amber-700': notice.tone === 'warning',
                'border-red-300 text-red-700': notice.tone === 'error',
              }"
            >
              <span>{{ notice.message }}</span>
              <button
                type="button"
                class="rounded px-1 text-muted-foreground hover:bg-muted"
                (click)="notifications.dismiss(notice.id)"
              >
                x
              </button>
            </article>
          }
        </section>
      }
    </div>
  `,
})
export default class HomeComponent {
  readonly uiPreferences = inject(UiPreferencesService);
  readonly notifications = inject(NotificationsService);
}
