import { Component, computed, inject, resource } from "@angular/core";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmSelectImports } from "@spartan-ng/ui-select-helm";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSave } from "@ng-icons/lucide";
import {
  RestTabStateService,
  RequestMethod,
} from "./utils/rest-tab-state.service";

@Component({
  selector: "reqquest-rest-panel",
  standalone: true,
  imports: [
    BrnSelectImports,
    HlmSelectImports,
    CommonModule,
    FormsModule,
    HlmInputDirective,
    HlmButtonDirective,
    NgIcon,
  ],
  templateUrl: "./rest-panel.component.html",
  providers: [provideIcons({ lucideSave })],
  styleUrl: "./rest-panel.component.css",
})
export class RestPanelComponent {
  tabService = inject(RestTabStateService);
  requestMethods: RequestMethod[] = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
    "HEAD",
    "CONNECT",
    "TRACE",
  ];
  currentTab = computed(
    () => this.tabService.tabs()[this.tabService.activeTab()],
  );
  response = resource({
    loader: async () => {
      const response = await fetch(
        this.tabService.tabs()[this.tabService.activeTab()].url,
      );
      return response.json();
    },
  });
  constructor() {}
}
