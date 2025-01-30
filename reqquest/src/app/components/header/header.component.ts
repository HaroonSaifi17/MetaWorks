import { Component, inject, signal } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp } from '@ng-icons/heroicons/outline';
import { lucideSearch } from '@ng-icons/lucide';
import { LoginComponent } from '../login/login.component';
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
  HlmMenuItemIconDirective,
  HlmMenuItemSubIndicatorComponent,
  HlmMenuLabelComponent,
  HlmMenuSeparatorComponent,
  HlmMenuShortcutComponent,
  HlmSubMenuComponent,
} from '@spartan-ng/ui-menu-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';

@Component({
  selector: 'reqquest-header',
  imports: [
    HlmButtonDirective,
    HlmIconDirective,
    NgIcon,
    LoginComponent,
    BrnDialogTriggerDirective,
    HlmDialogComponent,
    CommonModule,
    HlmAvatarImageDirective,
    HlmAvatarComponent,
    HlmAvatarFallbackDirective,
    HlmMenuComponent,
    HlmMenuGroupComponent,
    HlmMenuItemDirective,
    HlmMenuItemIconDirective,
    HlmMenuItemSubIndicatorComponent,
    HlmMenuLabelComponent,
    HlmMenuSeparatorComponent,
    HlmMenuShortcutComponent,
    HlmSubMenuComponent,
    BrnMenuTriggerDirective,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers: [provideIcons({ heroCloudArrowUp, lucideSearch })],
})
export class HeaderComponent {
  formTrigger = signal(false);
  authService = inject(SupabaseAuthService);
}
