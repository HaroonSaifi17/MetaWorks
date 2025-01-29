import { Component, signal } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp } from '@ng-icons/heroicons/outline';
import { lucideSearch } from '@ng-icons/lucide';
import { LoginComponent } from '../login/login.component';
import { BrnDialogTriggerDirective } from '@spartan-ng/brain/dialog';
import { HlmDialogComponent } from '@spartan-ng/ui-dialog-helm';

@Component({
  selector: 'reqquest-header',
  imports: [
    HlmButtonDirective,
    HlmIconDirective,
    NgIcon,
    LoginComponent,
    BrnDialogTriggerDirective,
    HlmDialogComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers: [provideIcons({ heroCloudArrowUp, lucideSearch })],
})
export class HeaderComponent {
  formTrigger = signal(false)
}
