import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGlobe, lucideLink2, lucideSettings } from '@ng-icons/lucide';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'reqquest-nav',
  imports: [
    RouterLink,
    CommonModule,
    RouterLinkActive,
    NgIcon,
    HlmIconDirective,
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
  providers: [provideIcons({ lucideLink2, lucideSettings, lucideGlobe })],
})
export class NavComponent {
  @Input() sidebarExpanded = signal(true);
}
