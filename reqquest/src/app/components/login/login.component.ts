import { Component } from '@angular/core';
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
import { createClient } from '@supabase/supabase-js';

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
  supabase = createClient(import.meta.env['VITE_SUPABASE_URL'],import.meta.env['VITE_ANON_PUBLIC_KEY']);
  login(){
    this.supabase.auth.signInWithOAuth({
      provider: 'google',
      })
  }
}
