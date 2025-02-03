import { Component, signal } from '@angular/core';

@Component({
  selector: 'reqquest-tab-bar',
  standalone: true,
  imports: [],
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.css',
})
export class TabBarComponent {
  tabs = signal([
    {
      name: 'Untitled',
    },
  ]);
  constructor() {
    console.log('TabBarComponent', this.tabs());
  }
  addTab() {
    this.tabs.set([...this.tabs(), { name: 'Untitled' }]);
  }
}
