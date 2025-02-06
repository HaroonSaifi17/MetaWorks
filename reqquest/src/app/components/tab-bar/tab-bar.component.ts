import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RestPanelComponent } from '../../features/rest-panel/rest-panel.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideX } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import RequestMethod from '../../utils/method.type';

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
      requestMethod: RequestMethod.GET,
    },
    {
      name: 'Untitled',
      isActive: false,
      requestMethod: RequestMethod.GET,
    },
  ]);

  addTab() {
    this.tabs.set([
      ...this.tabs(),
      { name: 'Untitled', isActive: false, requestMethod: RequestMethod.GET },
    ]);
    this.setActive(this.tabs().length - 1);
  }

  deleteTab(index: number) {
    this.tabs.set(this.tabs().filter((_, i) => i !== index));

    if (this.tabs().length > 0) {
      this.setActive(
        index === this.tabs().length ? Math.max(0, index - 1) : index
      );
    }
  }

  setActive(activeIndex: number) {
    if (this.tabs().length > 0) {
      this.tabs.set(
        this.tabs().map((tab, index) => ({
          ...tab,
          isActive: index === activeIndex,
        }))
      );
    }
  }

  methodColor(method: RequestMethod): string {
    switch (method) {
      case RequestMethod.GET:
        return 'text-green-400';
      case RequestMethod.POST:
        return 'text-blue-400';
      case RequestMethod.PUT:
        return 'text-yellow-400';
      case RequestMethod.DELETE:
        return 'text-red-400';
      case RequestMethod.PATCH:
        return 'text-purple-400';
      case RequestMethod.OPTIONS:
        return 'text-orange-400';
      case RequestMethod.HEAD:
        return 'text-pink-400';
      case RequestMethod.CONNECT:
        return 'text-amber-600';
      case RequestMethod.TRACE:
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  }

  changeMethod(index: number, event: RequestMethod) {
    this.tabs.set(
      this.tabs().map((tab, tabIndex) => ({
        ...tab,
        requestMethod: tabIndex === index ? event : tab.requestMethod,
      }))
    );
  }
}
