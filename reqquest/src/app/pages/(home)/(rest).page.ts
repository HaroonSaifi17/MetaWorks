import { Component } from '@angular/core';
import { TabBarComponent } from '../../components/tab-bar/tab-bar.component';

@Component({
  selector: 'reqquest-main',
  standalone: true,
  imports: [TabBarComponent],
  template: ` <reqquest-tab-bar></reqquest-tab-bar> `,
})
export default class RestComponent {}
