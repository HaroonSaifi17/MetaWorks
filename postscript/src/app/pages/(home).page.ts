import { Component } from '@angular/core';

import { AnalogWelcomeComponent } from './analog-welcome.component';

@Component({
  selector: 'postscript-home',
  
  imports: [AnalogWelcomeComponent],
  template: `
     <postscript-analog-welcome/>
  `,
})
export default class HomeComponent {
}
