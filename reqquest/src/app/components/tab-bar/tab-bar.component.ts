import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RestPanelComponent } from '../../features/rest-panel/rest-panel.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideX } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'reqquest-tab-bar',
  standalone: true,
  imports: [CommonModule, RestPanelComponent, NgIcon, HlmButtonDirective],
  providers: [provideIcons({ lucidePlus, lucideX })],
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.css',
})
export class TabBarComponent {
  tabs = signal([
    {
      name: 'Untitled',
      isActive: true,
      requestMethod: 'GET',
    },
    {
      name: 'Untitled',
      isActive: false,
      requestMethod: 'GET',
    },
  ]);
  addTab() {
    this.tabs.set([
      ...this.tabs(),
      { name: 'Untitled', isActive: false, requestMethod: 'GET' },
    ]);
    this.setActive(this.tabs().length - 1);
  }
  setActive(activeIndex: number) {
    this.tabs.set(
      this.tabs().map((tab, index) => ({
        ...tab,
        isActive: index === activeIndex,
      }))
    );
  }
  changeMethod(index: number, event: string)  {
    this.tabs.set(
      this.tabs().map((tab, tabIndex) => ({
        ...tab,
        requestMethod: tabIndex === index ? event : tab.requestMethod,
      }))
    );
  }
}
