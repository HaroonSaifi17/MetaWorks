import { Component, inject, signal } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { BrnDialogContentDirective } from '@spartan-ng/brain/dialog';
import {
  HlmDialogContentComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { NgIcon } from '@ng-icons/core';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { SupabaseAuthService } from '@meta-works/shared-services';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Input } from '@angular/core';

type AuthProviderId = 'google' | 'github';
interface AuthProvider {
  id: AuthProviderId;
  name: string;
  icon: string;
}

@Component({
  selector: 'reqquest-auth',
  standalone: true,
  imports: [
    BrnDialogContentDirective,
    HlmDialogContentComponent,
    HlmDialogHeaderComponent,
    HlmDialogTitleDirective,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
    CommonModule,
    HlmInputDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  @Input() formTrigger = signal(false);

  authService = inject(SupabaseAuthService);
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
  });

  providers: AuthProvider[] = [
    { id: 'google', name: 'google', icon: 'ionLogoGoogle' },
    { id: 'github', name: 'github', icon: 'ionLogoGithub' },
  ];

  get email() {
    return this.form.controls.email.value;
  }

  get showEmailError() {
    const control = this.form.controls.email;
    return control.invalid && (control.touched || control.dirty);
  }

  onSubmit() {
    if (this.form.valid) {
      this.authService.signInWithEmail(this.email);
    }
  }
}
