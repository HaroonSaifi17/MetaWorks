import { Component, inject, signal } from "@angular/core";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmInput } from "@spartan-ng/helm/input";
import {
  HlmDialogContent,
  HlmDialogHeader,
  HlmDialogPortal,
  HlmDialogTitle,
} from "@spartan-ng/helm/dialog";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { HlmIcon } from "@spartan-ng/helm/icon";
import { SupabaseAuthService } from "../../core/auth.service";
import { CommonModule } from "@angular/common";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Input } from "@angular/core";
import { ionLogoGithub, ionLogoGoogle, ionMail } from "@ng-icons/ionicons";
import {
  lucideArrowLeft,
  lucideInbox,
  lucideLoaderCircle,
} from "@ng-icons/lucide";

type AuthProviderId = "google" | "github";
interface AuthProvider {
  id: AuthProviderId;
  name: string;
  icon: string;
}

@Component({
  selector: "reqquest-auth",
  standalone: true,
  imports: [
    HlmDialogContent,
    HlmDialogHeader,
    HlmDialogPortal,
    HlmDialogTitle,
    HlmButton,
    NgIcon,
    HlmIcon,
    CommonModule,
    HlmInput,
    ReactiveFormsModule,
  ],
  templateUrl: "./auth.component.html",
  styleUrl: "./auth.component.css",
  providers: [
    provideIcons({
      ionLogoGithub,
      ionLogoGoogle,
      ionMail,
      lucideArrowLeft,
      lucideInbox,
      lucideLoaderCircle,
    }),
  ],
})
export class AuthComponent {
  @Input() formTrigger = signal(false);

  authService = inject(SupabaseAuthService);
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    email: this.fb.control("", {
      validators: [Validators.required, Validators.email],
    }),
  });

  providers: AuthProvider[] = [
    { id: "google", name: "google", icon: "ionLogoGoogle" },
    { id: "github", name: "github", icon: "ionLogoGithub" },
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
