import { Component, signal } from '@angular/core';

import { HeaderComponent } from '../components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';
import { SideNavComponent } from '../components/sidenav/side-nav.component';

@Component({
  selector: 'reqquest-home',
  standalone: true,

  imports: [HeaderComponent, RouterOutlet, FooterComponent, SideNavComponent],
  template: `
    <div class="flex flex-col min-h-[100dvh] max-w-[100vw]">
      <reqquest-header></reqquest-header>
      <main class="flex flex-grow max-md:flex-col-reverse overflow-hidden">
        <reqquest-side-nav
          [sidebarExpanded]="sidebarExpanded"
        ></reqquest-side-nav>
        <div class="flex-grow overflow-y-auto">
          <router-outlet></router-outlet>
        </div>
      </main>
      <reqquest-footer
        class="max-md:hidden"
        [sidebarExpanded]="sidebarExpanded"
      ></reqquest-footer>
    </div>
  `,
})
export default class HomeComponent {
  sidebarExpanded = signal(true);
}
