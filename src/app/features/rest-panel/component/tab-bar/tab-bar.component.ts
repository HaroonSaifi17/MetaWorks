import { CommonModule } from "@angular/common";
import { Component, HostListener, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus, lucideX } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { RestTabStore } from "../../utils/rest-tab.store";
import { methodColor } from "../../utils/rest.utils";
import { FormsModule } from "@angular/forms";
import { HlmInput } from "@spartan-ng/helm/input";

@Component({
  selector: "reqquest-tab-bar",
  standalone: true,
  imports: [CommonModule, NgIcon, HlmButton, FormsModule, HlmInput],
  providers: [provideIcons({ lucidePlus, lucideX })],
  templateUrl: "./tab-bar.component.html",
  styleUrl: "./tab-bar.component.css",
})
export class TabBarComponent {
  tabStore = inject(RestTabStore);
  methodColor = methodColor;

  editingIndex: number | null = null;
  editingName = "";

  @HostListener("window:keydown", ["$event"])
  handleTabShortcuts(event: KeyboardEvent): void {
    if (event.key === "F2") {
      event.preventDefault();
      this.startRename(this.tabStore.activeTabIndex());
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "w") {
      event.preventDefault();
      this.tabStore.deleteTab(this.tabStore.activeTabIndex());
    }
  }

  startRename(index: number): void {
    this.editingIndex = index;
    this.editingName = this.tabStore.tabs()[index]?.name || "";
  }

  commitRename(index: number): void {
    if (this.editingIndex !== index) {
      return;
    }

    this.tabStore.setActiveTab(index);
    this.tabStore.renameTab(this.editingName);
    this.editingIndex = null;
    this.editingName = "";
  }

  cancelRename(): void {
    this.editingIndex = null;
    this.editingName = "";
  }
}
