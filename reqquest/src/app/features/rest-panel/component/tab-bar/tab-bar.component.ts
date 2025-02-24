import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus, lucideX } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { RestTabStore } from "../../utils/rest-tab.store";
import { methodColor } from "../../utils/rest.utils";

@Component({
  selector: "reqquest-tab-bar",
  standalone: true,
  imports: [CommonModule, NgIcon, HlmButtonDirective],
  providers: [provideIcons({ lucidePlus, lucideX })],
  templateUrl: "./tab-bar.component.html",
  styleUrl: "./tab-bar.component.css",
})
export class TabBarComponent {
  tabStore = inject(RestTabStore);
  methodColor = methodColor;
}
