import { Component, Input, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideFlipHorizontal,
  lucideFlipVertical,
  lucideHelpCircle,
  lucideInfo,
  lucidePanelLeft,
  lucidePanelLeftOpen,
  lucideShieldCheck,
  lucideSun,
  lucideMoon,
} from "@ng-icons/lucide";
import { bootstrapLightningCharge } from "@ng-icons/bootstrap-icons";

import { HlmIcon } from "@spartan-ng/helm/icon";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmTooltip } from "@spartan-ng/helm/tooltip";
import { UiPreferencesService } from "../../core/ui-preferences.service";
import { NotificationsService } from "../../core/notifications.service";

@Component({
  selector: "reqquest-footer",
  standalone: true,
  imports: [NgIcon, HlmIcon, HlmButton, HlmTooltip],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.css",
  providers: [
    provideIcons({
      lucidePanelLeft,
      lucidePanelLeftOpen,
      lucideFlipHorizontal,
      lucideFlipVertical,
      lucideInfo,
      lucideHelpCircle,
      lucideSun,
      lucideMoon,
      bootstrapLightningCharge,
      lucideShieldCheck,
    }),
  ],
})
export class FooterComponent {
  @Input() sidebarExpanded = true;
  @Input() darkMode = false;
  @Input() restLayout: "vertical" | "horizontal" = "vertical";
  @Input() interceptorEnabled = false;

  private readonly uiPreferences = inject(UiPreferencesService);
  private readonly notifications = inject(NotificationsService);

  toggleSidebar() {
    this.uiPreferences.toggleSidebarExpanded();
  }

  toggleDarkMode() {
    this.uiPreferences.toggleDarkMode();
  }

  toggleRestLayout() {
    this.uiPreferences.toggleRestLayout();
  }

  toggleInterceptor() {
    this.uiPreferences.toggleInterceptorEnabled();
    this.notifications.show(
      this.uiPreferences.interceptorEnabled()
        ? "Interceptor enabled. Use mock:// URL for local responses."
        : "Interceptor disabled. Requests now hit real endpoints.",
      "info",
    );
  }

  openShortcutsHelp() {
    this.notifications.show(
      "Shortcuts: Ctrl/Cmd+K, Ctrl/Cmd+Enter, Alt+N, Esc",
      "info",
      5000,
    );
  }

  showAbout() {
    this.notifications.show(
      "ReqQuest: API workbench for REST, GraphQL, and realtime tests.",
      "info",
      5000,
    );
  }
}
