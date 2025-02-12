import { Component, inject, OnInit } from "@angular/core";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmSelectImports } from "@spartan-ng/ui-select-helm";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSave } from "@ng-icons/lucide";
import {
  RestTabStateService,
  RequestMethod,
} from "./utils/rest-tab-state.service";

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
    ReactiveFormsModule,
    NgIcon,
  ],
  templateUrl: "./rest-panel.component.html",
  providers: [provideIcons({ lucideSave })],
  styleUrl: "./rest-panel.component.css",
})
export class RestPanelComponent implements OnInit {
  tabService = inject(RestTabStateService);
  fb = inject(NonNullableFormBuilder);
  requestMethods: RequestMethod[] = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
    "HEAD",
    "CONNECT",
    "TRACE",
  ];

  constructor() {}
  ngOnInit() {
    this.requestForm.valueChanges.subscribe((value) => {
      this.tabService.modifyTab(value);
    });
  }

  activeTab = this.tabService.activeTab();
  requestForm = this.fb.group({
    method: [this.activeTab.method || "GET", Validators.required],
    url: [
      this.activeTab.url || "",
      [Validators.required, Validators.pattern(/^https?:\/\/.+/)],
    ],
  });

  submitRequest(): void {
    if (this.requestForm.valid) {
      this.tabService.submitRequest();
    }
  }
}
