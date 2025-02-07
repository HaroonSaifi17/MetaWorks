import { Component, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideGlobe, lucideLink2, lucideSettings } from "@ng-icons/lucide";
import { HlmIconDirective } from "@spartan-ng/ui-icon-helm";
import { Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgGraphqlComponent } from "../../utils/svg/graphgl-svg.component";

@Component({
  selector: "reqquest-side-nav",
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    RouterLinkActive,
    NgIcon,
    HlmIconDirective,
    SvgGraphqlComponent,
  ],
  templateUrl: "./side-nav.component.html",
  styleUrl: "./side-nav.component.css",
  providers: [provideIcons({ lucideLink2, lucideSettings, lucideGlobe })],
})
export class SideNavComponent {
  @Input() sidebarExpanded = signal(true);
}
