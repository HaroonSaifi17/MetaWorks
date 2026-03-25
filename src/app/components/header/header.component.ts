import { Component, HostListener, inject, signal } from "@angular/core";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmIcon } from "@spartan-ng/helm/icon";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { heroCloudArrowUp } from "@ng-icons/heroicons/outline";
import {
  lucideLifeBuoy,
  lucideLogOut,
  lucideSearch,
  lucideSettings,
  lucideUser,
  lucideUserPlus,
} from "@ng-icons/lucide";
import { HlmDialog, HlmDialogTrigger } from "@spartan-ng/helm/dialog";
import { HlmInput } from "@spartan-ng/helm/input";
import { SupabaseAuthService } from "../../core/auth.service";
import { CommonModule } from "@angular/common";
import {
  HlmAvatarImage,
  HlmAvatar,
  HlmAvatarFallback,
} from "@spartan-ng/helm/avatar";
import { Router, RouterLink } from "@angular/router";
import { HlmTooltip } from "@spartan-ng/helm/tooltip";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { AuthComponent } from "../../features/auth/auth.component";
import { RestWorkbenchService } from "../../core/rest-workbench.service";
import { NotificationsService } from "../../core/notifications.service";

@Component({
  selector: "reqquest-header",
  standalone: true,
  imports: [
    HlmButton,
    HlmIcon,
    NgIcon,
    AuthComponent,
    HlmDialogTrigger,
    HlmDialog,
    CommonModule,
    HlmAvatarImage,
    HlmAvatar,
    HlmAvatarFallback,
    RouterLink,
    HlmTooltip,
    HlmInput,
    ...HlmDropdownMenuImports,
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css",
  providers: [
    provideIcons({
      heroCloudArrowUp,
      lucideSearch,
      lucideLogOut,
      lucideSettings,
      lucideUser,
      lucideUserPlus,
      lucideLifeBuoy,
    }),
  ],
})
export class HeaderComponent {
  formTrigger = signal(false);
  authService = inject(SupabaseAuthService);
  private readonly router = inject(Router);
  private readonly workbench = inject(RestWorkbenchService);
  private readonly notifications = inject(NotificationsService);

  readonly searchTerm = signal("");
  readonly isSearchOpen = signal(false);
  readonly workspaceName = signal("Personal Workspace");
  readonly isRenameWorkspaceOpen = signal(false);
  readonly workspaceDraftName = signal(this.workspaceName());

  private readonly searchableRoutes: Array<{ label: string; path: string }> = [
    { label: "REST", path: "/" },
    { label: "GraphQL", path: "/graphql" },
    { label: "Realtime", path: "/realtime" },
    { label: "Settings", path: "/settings" },
  ];

  @HostListener("window:keydown", ["$event"])
  handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      this.isSearchOpen.set(true);
      return;
    }

    if (event.key === "Escape") {
      this.closeSearch();
      this.cancelWorkspaceRename();
    }
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = "none";
  }

  get filteredRoutes() {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.searchableRoutes;
    }

    return this.searchableRoutes.filter((route) =>
      route.label.toLowerCase().includes(term),
    );
  }

  openSearch() {
    this.searchTerm.set("");
    this.isSearchOpen.set(true);
  }

  closeSearch() {
    this.isSearchOpen.set(false);
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  async jumpToRoute(path: string) {
    this.closeSearch();
    await this.router.navigateByUrl(path);
    if (path === "/") {
      this.workbench.requestUrlFocus();
    }
  }

  onSupportClick() {
    this.notifications.show(
      "Open Settings to configure timeout, environments, and layout.",
      "info",
      4500,
    );
    void this.router.navigateByUrl("/settings");
  }

  async onInviteClick() {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      this.notifications.show("Clipboard is unavailable.", "error");
      return;
    }

    const inviteUrl = `${window.location.origin}/?invite=demo-workspace`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      this.notifications.show("Invite link copied.", "success");
    } catch {
      this.notifications.show("Could not copy invite link.", "error");
    }
  }

  onWorkspaceClick() {
    this.workspaceDraftName.set(this.workspaceName());
    this.isRenameWorkspaceOpen.set(true);
  }

  cancelWorkspaceRename() {
    this.isRenameWorkspaceOpen.set(false);
  }

  saveWorkspaceRename() {
    const nextName = this.workspaceDraftName().trim();
    this.workspaceName.set(nextName || "Personal Workspace");
    this.isRenameWorkspaceOpen.set(false);
    this.notifications.show("Workspace renamed.", "success");
  }

  async goToSettings() {
    await this.router.navigateByUrl("/settings");
  }

  async goToProfile() {
    await this.router.navigateByUrl("/settings");
  }

  user = this.authService.user;
}
