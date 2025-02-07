import { Component, OnInit, Output, EventEmitter, signal, effect } from "@angular/core";
import RequestMethod from "../../utils/method.type";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmSelectImports } from "@spartan-ng/ui-select-helm";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSave } from "@ng-icons/lucide";

@Component({
  selector: "reqquest-rest-panel",
  standalone: true,
  imports: [
    BrnSelectImports,
    HlmSelectImports,
    CommonModule,
    FormsModule,
    HlmInputDirective,
    HlmButtonDirective,
    NgIcon,
  ],
  templateUrl: "./rest-panel.component.html",
  providers: [provideIcons({ lucideSave })],
  styleUrl: "./rest-panel.component.css",
})
export class RestPanelComponent {

  @Output() requestMethodEvent = new EventEmitter<RequestMethod>();
  requestMethods  = Object.values(RequestMethod);
  selectedMethod  = signal(RequestMethod.GET);

  constructor() {
   effect(() => {
      this.requestMethodEvent.emit(this.selectedMethod());
    })
  }


  methodColor(method: RequestMethod): string {
    switch (method) {
      case RequestMethod.GET:
        return "text-green-400";
      case RequestMethod.POST:
        return "text-blue-400";
      case RequestMethod.PUT:
        return "text-yellow-400";
      case RequestMethod.DELETE:
        return "text-red-400";
      case RequestMethod.PATCH:
        return "text-purple-400";
      case RequestMethod.OPTIONS:
        return "text-orange-400";
      case RequestMethod.HEAD:
        return "text-pink-400";
      case RequestMethod.CONNECT:
        return "text-amber-600";
      case RequestMethod.TRACE:
        return "text-gray-400";
      default:
        return "text-white";
    }
  }
}
