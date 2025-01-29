import { Component, inject } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  BrnDialogContentDirective,
} from '@spartan-ng/brain/dialog';
import {
  HlmDialogContentComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { NgIcon } from '@ng-icons/core';
import { HlmIconDirective,  } from '@spartan-ng/ui-icon-helm';
import { SupabaseAuthService } from '@meta-works/shared-services';

@Component({
  selector: 'reqquest-login',
  imports: [
    BrnDialogContentDirective,
    HlmDialogContentComponent,
    HlmDialogHeaderComponent,
    HlmDialogTitleDirective,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  supabase = inject(SupabaseAuthService);
}
