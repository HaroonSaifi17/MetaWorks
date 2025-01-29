import { Component, inject, signal } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
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
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

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
    CommonModule,
    HlmInputDirective,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  supabase = inject(SupabaseAuthService);
  formTrigger = signal(false)
  fb = inject(NonNullableFormBuilder)
  form = this.fb.group({
    email: this.fb.control('',{validators: [Validators.required, Validators.email]}),
  })
}
