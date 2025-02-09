import { Component } from "@angular/core";
import { RestPanelComponent } from "../../features/rest-panel/rest-panel.component";
import { TabBarComponent } from "../../features/rest-panel/component/tab-bar/tab-bar.component";

@Component({
  selector: "reqquest-main",
  standalone: true,
  imports: [RestPanelComponent, TabBarComponent],
  template: `
    <reqquest-tab-bar></reqquest-tab-bar>
    <reqquest-rest-panel></reqquest-rest-panel>
  `,
})
export default class RestComponent {}
