import { Component } from '@angular/core';

import { AnalogWelcomeComponent } from './analog-welcome.component';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'postscript-home',

  imports: [AnalogWelcomeComponent, HlmButtonDirective],
  template: `
    <postscript-analog-welcome />
    <button hlmBtn variant="default" size="lg">Secondary</button>
  `,
})
export default class HomeComponent {}
