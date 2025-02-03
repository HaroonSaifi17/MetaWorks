import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideFlipHorizontal,
  lucideFlipVertical,
  lucideInfo,
  lucidePanelLeft,
  lucidePanelLeftOpen,
  lucideShieldCheck,
} from '@ng-icons/lucide';
import { bootstrapLightningCharge } from '@ng-icons/bootstrap-icons';

import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmTooltipTriggerDirective } from '@spartan-ng/ui-tooltip-helm';
import { Input } from '@angular/core';

@Component({
  selector: 'reqquest-footer',
  standalone: true,
  imports: [
    NgIcon,
    HlmIconDirective,
    HlmButtonDirective,
    HlmTooltipTriggerDirective,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  providers: [
    provideIcons({
      lucidePanelLeft,
      lucidePanelLeftOpen,
      lucideFlipHorizontal,
      lucideFlipVertical,
      lucideInfo,
      bootstrapLightningCharge,
      lucideShieldCheck,
    }),
  ],
})
export class FooterComponent {
  @Input() sidebarExpanded = signal(true);
}
