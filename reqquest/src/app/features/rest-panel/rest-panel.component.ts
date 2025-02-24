import { Component, effect, inject, OnInit } from "@angular/core";
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
import { RestTabStore } from "./utils/rest-tab.store";
import { HttpMethod } from "./utils/rest.interface";
import { methodColor } from "./utils/rest.utils";

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
  tabStore = inject(RestTabStore);
  fb = inject(NonNullableFormBuilder);
  methodColor = methodColor;
  requestMethods: HttpMethod[] = [
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

  constructor() {
    effect(() => {
      this.requestForm.setValue(
        {
          method: this.tabStore.activeTab().method,
          url: this.tabStore.activeTab().url,
        },
        { emitEvent: false },
      );
    });
  }

  ngOnInit() {
    this.requestForm.valueChanges.subscribe((value) => {
      this.tabStore.updateTab(value);
    });
  }

  requestForm = this.fb.group({
    method: [this.tabStore.activeTab().method || "GET", Validators.required],
    url: [
      this.tabStore.activeTab().url || "",
      [Validators.required, Validators.pattern(/^https?:\/\/.+/)],
    ],
  });

  submitRequest(): void {
    if (this.requestForm.valid) {
      this.tabStore.makeRequest();
    }
  }
}
