import { Component, inject, signal } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp } from '@ng-icons/heroicons/outline';
import {
  lucideLifeBuoy,
  lucideLogOut,
  lucideSearch,
  lucideSettings,
  lucideUser,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { BrnDialogTriggerDirective } from '@spartan-ng/brain/dialog';
import { HlmDialogComponent } from '@spartan-ng/ui-dialog-helm';
import { SupabaseAuthService } from '@meta-works/shared-services';
import { CommonModule } from '@angular/common';
import {
  HlmAvatarImageDirective,
  HlmAvatarComponent,
  HlmAvatarFallbackDirective,
} from '@spartan-ng/ui-avatar-helm';
import {
  HlmMenuComponent,
  HlmMenuGroupComponent,
  HlmMenuItemDirective,
  HlmMenuLabelComponent,
  HlmMenuSeparatorComponent,
  HlmMenuShortcutComponent,
} from '@spartan-ng/ui-menu-helm';
import {
  HlmTooltipTriggerDirective,
} from '@spartan-ng/ui-tooltip-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { RouterLink } from '@angular/router';
import { AuthComponent } from '../../features/auth/auth.component';

@Component({
  selector: 'reqquest-header',
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmIconDirective,
    NgIcon,
    AuthComponent,
    BrnDialogTriggerDirective,
    HlmDialogComponent,
    CommonModule,
    HlmAvatarImageDirective,
    HlmAvatarComponent,
    HlmAvatarFallbackDirective,
    HlmMenuComponent,
    HlmMenuGroupComponent,
    HlmMenuItemDirective,
    HlmMenuLabelComponent,
    HlmMenuSeparatorComponent,
    HlmMenuShortcutComponent,
    BrnMenuTriggerDirective,
    HlmTooltipTriggerDirective,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers: [
    provideIcons({
      heroCloudArrowUp,
      lucideSearch,
      lucideLogOut,
      lucideSettings,
      lucideUser,
      lucideUserPlus,
      lucideLifeBuoy
    }),
  ],
})
export class HeaderComponent {
  formTrigger = signal(false);
  authService = inject(SupabaseAuthService);
  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
  user = this.authService.user;
}
