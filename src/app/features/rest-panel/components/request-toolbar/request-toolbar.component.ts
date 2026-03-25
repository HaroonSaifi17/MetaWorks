import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmTooltip } from "@spartan-ng/helm/tooltip";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSend, lucideSave, lucideCopy, lucideEraser, lucideCircleX, lucideChevronDown } from "@ng-icons/lucide";
import { HttpMethod } from "../../utils/rest.interface";
import { methodColor } from "../../utils/rest.utils";
import { CommonModule } from "@angular/common";

@Component({
  selector: "reqquest-request-toolbar",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmSelectImports,
    HlmInput,
    HlmButton,
    HlmTooltip,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideSend,
      lucideSave,
      lucideCopy,
      lucideEraser,
      lucideCircleX,
      lucideChevronDown,
    }),
  ],
  template: `
    <form [formGroup]="form" class="flex flex-wrap gap-2 items-center" (ngSubmit)="submitRequest.emit()">
      <div class="group flex h-10 min-w-[200px] flex-1 items-center rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all relative z-10">
        <hlm-select class="block h-full shrink-0" formControlName="method">
          <hlm-select-trigger class="h-full w-[110px] rounded-l-md border-none px-3 font-semibold focus:ring-0 !bg-transparent !hover:bg-muted/50 transition-colors flex items-center justify-between">
            <hlm-select-value [placeholder]="methodPlaceholder" />
          </hlm-select-trigger>
          <hlm-select-content *hlmSelectPortal class="max-h-[300px] z-50">
            @for (method of methods; track method) {
              <hlm-select-item [ngClass]="methodColor(method)" [value]="method" class="font-medium">
                {{ method }}
              </hlm-select-item>
            }
          </hlm-select-content>
        </hlm-select>

        <div class="h-5 w-px bg-border mx-1"></div>

        <input
          #urlInput
          formControlName="url"
          type="text"
          class="h-full min-w-0 flex-1 rounded-r-md bg-transparent px-3 font-medium outline-none placeholder:text-muted-foreground/50 text-sm"
          placeholder="https://api.example.com/v1/resource"
        />
      </div>

      <div class="flex items-center gap-2">
        @if (isLoading) {
          <button type="button" hlmBtn variant="destructive" class="h-10 gap-2 px-4 shadow-sm" (click)="cancelRequest.emit()">
            <ng-icon name="lucideCircleX" size="16px" />
            <span class="max-sm:hidden">Cancel</span>
          </button>
        } @else {
          <button type="submit" hlmBtn class="h-10 gap-2 bg-primary px-6 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            <ng-icon name="lucideSend" size="16px" class="text-primary-foreground" />
            <span>Send</span>
          </button>
        }

        <div class="flex h-10 items-center rounded-md border bg-background shadow-sm">
          <button type="button" hlmBtn variant="ghost" size="icon" class="h-full w-9 rounded-l-md rounded-r-none hover:bg-muted transition-colors text-foreground" (click)="saveRequest.emit()" hlmTooltip="Save Request">
            <ng-icon name="lucideSave" size="16px" />
          </button>
          <div class="h-4 w-px bg-border"></div>
          <button type="button" hlmBtn variant="ghost" size="icon" class="h-full w-9 rounded-none hover:bg-muted transition-colors text-foreground" (click)="duplicateTab.emit()" hlmTooltip="Duplicate Tab">
            <ng-icon name="lucideCopy" size="16px" />
          </button>
          <div class="h-4 w-px bg-border"></div>
          <button type="button" hlmBtn variant="ghost" size="icon" class="h-full w-9 rounded-none hover:bg-muted transition-colors text-foreground" (click)="clearTab.emit()" hlmTooltip="Clear">
            <ng-icon name="lucideEraser" size="16px" />
          </button>
          <div class="h-4 w-px bg-border"></div>
          <button type="button" hlmBtn variant="ghost" size="icon" class="h-full w-9 rounded-r-md rounded-l-none hover:bg-muted transition-colors text-foreground" (click)="copyCurl.emit()" hlmTooltip="Copy as cURL">
            <ng-icon name="lucideCopy" size="16px" />
          </button>
        </div>
      </div>
    </form>
  `
})
export class RequestToolbarComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() isLoading = false;
  @Input() methods: HttpMethod[] = [];
  @Input() methodPlaceholder = "GET";

  @Output() submitRequest = new EventEmitter<void>();
  @Output() cancelRequest = new EventEmitter<void>();
  @Output() saveRequest = new EventEmitter<void>();
  @Output() duplicateTab = new EventEmitter<void>();
  @Output() clearTab = new EventEmitter<void>();
  @Output() copyCurl = new EventEmitter<void>();

  @ViewChild("urlInput") private urlInput?: ElementRef<HTMLInputElement>;

  focusUrlInput(): void {
    this.urlInput?.nativeElement.focus();
    this.urlInput?.nativeElement.select();
  }

  readonly methodColor = methodColor;
}
