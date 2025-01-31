import { Component, signal } from '@angular/core';

import { HeaderComponent } from '../components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';
import { NavComponent } from '../components/nav/nav.component';

@Component({
  selector: 'reqquest-home',

  imports: [HeaderComponent, RouterOutlet, FooterComponent, NavComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <reqquest-header></reqquest-header>
      <main class="flex-1 flex max-md:flex-col-reverse">
        <reqquest-nav [sidebarExpanded]="sidebarExpanded"></reqquest-nav>
        <div class="flex-1">
          <router-outlet></router-outlet>
        </div>
      </main>
      <reqquest-footer class="max-md:hidden" [sidebarExpanded]="sidebarExpanded"></reqquest-footer>
    </div>
  `,
})
export default class HomeComponent {
  sidebarExpanded =signal(true);
}
