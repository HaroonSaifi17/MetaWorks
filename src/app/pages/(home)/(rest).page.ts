import { Component } from "@angular/core";
import { RestPanelComponent } from "../../features/rest-panel/rest-panel.component";
import { TabBarComponent } from "../../features/rest-panel/component/tab-bar/tab-bar.component";

@Component({
  selector: "reqquest-main",
  standalone: true,
  imports: [RestPanelComponent, TabBarComponent],
  template: `
    <section class="flex h-full min-h-0 flex-col">
      <reqquest-tab-bar class="shrink-0"></reqquest-tab-bar>
      <reqquest-rest-panel class="min-h-0 flex-1 overflow-hidden"></reqquest-rest-panel>
    </section>
  `,
  host: {
    class: "block h-full",
  },
})
export default class RestComponent {}
