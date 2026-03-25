import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmInput } from "@spartan-ng/helm/input";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus, lucideTrash2, lucideCircleX } from "@ng-icons/lucide";
import { CodeEditorComponent } from "../code-editor/code-editor.component";
import { AuthType, Tab } from "../../utils/rest.interface";

export type RequestTab = "params" | "headers" | "body" | "auth" | "pre" | "tests";

@Component({
  selector: "reqquest-request-options",
  standalone: true,
  imports: [CommonModule, FormsModule, HlmButton, HlmInput, NgIcon, CodeEditorComponent],
  providers: [provideIcons({ lucidePlus, lucideTrash2, lucideCircleX })],
  template: `
    <article class="flex h-full min-h-0 flex-col rounded-lg border bg-background shadow-sm overflow-hidden">
      <header class="flex flex-wrap items-center gap-1 border-b bg-muted/20 px-2 py-1 shrink-0">
        <button type="button" hlmBtn size="sm" variant="ghost" class="h-7 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm" [attr.data-active]="activeRequestTab === 'params'" (click)="activeRequestTabChange.emit('params')">
          Params
        </button>
        <button type="button" hlmBtn size="sm" variant="ghost" class="h-7 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm" [attr.data-active]="activeRequestTab === 'headers'" (click)="activeRequestTabChange.emit('headers')">
          Headers
          @if (activeTab.headers.length > 0) { <span class="ml-1 text-[10px] opacity-70">({{ activeTab.headers.length }})</span> }
        </button>
        <button type="button" hlmBtn size="sm" variant="ghost" class="h-7 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm" [attr.data-active]="activeRequestTab === 'auth'" (click)="activeRequestTabChange.emit('auth')">
          Auth
          @if (activeTab.auth.type !== 'none') { <span class="ml-1 text-[10px] opacity-70">({{ activeTab.auth.type }})</span> }
        </button>
        <button type="button" hlmBtn size="sm" variant="ghost" class="h-7 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm" [attr.data-active]="activeRequestTab === 'body'" [disabled]="!canSendBody" (click)="activeRequestTabChange.emit('body')">
          Body
        </button>
        <div class="mx-1 h-4 w-px bg-border"></div>
        <button type="button" hlmBtn size="sm" variant="ghost" class="h-7 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm" [attr.data-active]="activeRequestTab === 'pre'" (click)="activeRequestTabChange.emit('pre')">
          Scripts
        </button>
        <button type="button" hlmBtn size="sm" variant="ghost" class="h-7 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm" [attr.data-active]="activeRequestTab === 'tests'" (click)="activeRequestTabChange.emit('tests')">
          Tests
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto p-3">
        @if (unresolvedVariables.length > 0) {
          <div class="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
            Missing environment values: <span class="font-semibold">{{ unresolvedVariables.join(", ") }}</span>. <span class="opacity-80">Configure them in Settings.</span>
          </div>
        }

        @if (activeRequestTab === "params") {
          <div class="mb-2 flex items-center justify-between">
             <h3 class="text-xs font-semibold uppercase text-muted-foreground">Query Parameters</h3>
             <div class="flex gap-2">
               <button type="button" hlmBtn size="sm" variant="ghost" class="h-6 px-2 text-xs" (click)="loadExampleParams.emit()">Example</button>
               <button type="button" hlmBtn size="sm" variant="secondary" class="h-6 gap-1 px-2 text-xs" (click)="addParam.emit()">
                  <ng-icon name="lucidePlus" size="12px" /> Add
               </button>
             </div>
          </div>
          <div class="space-y-1">
            @for (param of activeTab.params; track trackByIndex($index); let i = $index) {
              <div class="group flex items-center gap-2 rounded-md border border-transparent p-1 hover:border-border hover:bg-muted/30">
                <input type="checkbox" class="h-4 w-4 rounded border-input text-primary focus:ring-1 focus:ring-primary" [checked]="param.enabled" (change)="toggleParam.emit({index: i, enabled: $any($event.target).checked})" />
                <input hlmInput type="text" class="h-8 min-w-0 flex-1 text-sm bg-transparent" placeholder="Key" [value]="param.key" (input)="updateParamKey.emit({index: i, value: $any($event.target).value})" />
                <input hlmInput type="text" class="h-8 min-w-0 flex-1 text-sm bg-transparent" placeholder="Value" [value]="param.value" (input)="updateParamValue.emit({index: i, value: $any($event.target).value})" />
                <button type="button" hlmBtn variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" (click)="removeParam.emit(i)">
                  <ng-icon name="lucideTrash2" size="14px" />
                </button>
              </div>
            }
            @if (activeTab.params.length === 0) {
               <div class="flex h-20 flex-col items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                  <p>No parameters</p>
                  <button class="mt-1 font-medium hover:underline" (click)="addParam.emit()">Add one</button>
               </div>
            }
          </div>
        }

        @if (activeRequestTab === "headers") {
          <div class="mb-2 flex items-center justify-between">
             <h3 class="text-xs font-semibold uppercase text-muted-foreground">Headers</h3>
             <button type="button" hlmBtn size="sm" variant="secondary" class="h-6 gap-1 px-2 text-xs" (click)="addHeader.emit()">
                <ng-icon name="lucidePlus" size="12px" /> Add
             </button>
          </div>
          <div class="space-y-1">
            @for (header of activeTab.headers; track trackByIndex($index); let i = $index) {
              <div class="group flex items-center gap-2 rounded-md border border-transparent p-1 hover:border-border hover:bg-muted/30">
                <input type="checkbox" class="h-4 w-4 rounded border-input" [checked]="header.enabled" (change)="toggleHeader.emit({index: i, enabled: $any($event.target).checked})" />
                <input hlmInput type="text" class="h-8 min-w-0 flex-1 text-sm bg-transparent" placeholder="Header" [value]="header.key" (input)="updateHeaderKey.emit({index: i, value: $any($event.target).value})" />
                <input hlmInput type="text" class="h-8 min-w-0 flex-1 text-sm bg-transparent" placeholder="Value" [value]="header.value" (input)="updateHeaderValue.emit({index: i, value: $any($event.target).value})" />
                <button type="button" hlmBtn variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" (click)="removeHeader.emit(i)">
                  <ng-icon name="lucideTrash2" size="14px" />
                </button>
              </div>
            }
            @if (activeTab.headers.length === 0) {
               <div class="flex h-20 flex-col items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                  <p>No headers</p>
                  <button class="mt-1 font-medium hover:underline" (click)="addHeader.emit()">Add one</button>
               </div>
            }
          </div>
        }

        @if (activeRequestTab === "auth") {
          <div class="grid gap-4">
             <div>
                <label class="mb-2 block text-xs font-medium text-muted-foreground">Authorization Type</label>
                <div class="flex flex-wrap gap-2">
                  @for (type of authTypes; track type.value) {
                    <button type="button" hlmBtn size="sm" variant="outline" class="h-8 text-xs" [class.border-primary]="activeTab.auth.type === type.value" [class.bg-primary-foreground]="activeTab.auth.type === type.value" (click)="updateAuthType.emit(type.value)">
                      {{ type.label }}
                    </button>
                  }
                </div>
             </div>

             @if (activeTab.auth.type === "bearer") {
                <div class="space-y-2">
                  <label class="text-xs font-medium">Token</label>
                  <input hlmInput type="text" class="font-mono text-sm" [placeholder]="'{{TOKEN}}'" [value]="activeTab.auth.bearerToken" (input)="updateBearerToken.emit($any($event.target).value)" />
                </div>
             }

             @if (activeTab.auth.type === "basic") {
               <div class="grid gap-3 sm:grid-cols-2">
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Username</label>
                    <input hlmInput type="text" class="text-sm" placeholder="username" [value]="activeTab.auth.basicUsername" (input)="updateBasicUsername.emit($any($event.target).value)" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-medium">Password</label>
                    <input hlmInput type="password" class="text-sm" placeholder="password" [value]="activeTab.auth.basicPassword" (input)="updateBasicPassword.emit($any($event.target).value)" />
                  </div>
               </div>
             }

             @if (activeTab.auth.type === "apikey") {
                <div class="grid gap-3">
                   <div class="grid gap-3 sm:grid-cols-2">
                      <div class="space-y-1">
                        <label class="text-xs font-medium">Key</label>
                        <input hlmInput type="text" class="text-sm" placeholder="X-API-Key" [value]="activeTab.auth.apiKeyKey" (input)="updateApiKeyKey.emit($any($event.target).value)" />
                      </div>
                      <div class="space-y-1">
                        <label class="text-xs font-medium">Value</label>
                        <input hlmInput type="text" class="text-sm" [placeholder]="'{{API_KEY}}'" [value]="activeTab.auth.apiKeyValue" (input)="updateApiKeyValue.emit($any($event.target).value)" />
                      </div>
                   </div>
                   <div class="space-y-1">
                     <label class="text-xs font-medium">Add to</label>
                     <div class="flex gap-2">
                       <button type="button" hlmBtn size="sm" variant="outline" class="h-7 text-xs" [class.bg-muted]="activeTab.auth.apiKeyIn === 'header'" (click)="updateApiKeyIn.emit('header')">Header</button>
                       <button type="button" hlmBtn size="sm" variant="outline" class="h-7 text-xs" [class.bg-muted]="activeTab.auth.apiKeyIn === 'query'" (click)="updateApiKeyIn.emit('query')">Query Params</button>
                     </div>
                   </div>
                </div>
             }
          </div>
        }

        @if (activeRequestTab === "body") {
          @if (!canSendBody) {
             <div class="flex h-full flex-col items-center justify-center text-muted-foreground">
                <ng-icon name="lucideCircleX" size="32px" class="mb-2 opacity-20" />
                <p class="text-sm">Body not allowed for {{ activeTab.method }} requests</p>
             </div>
          } @else {
            <div class="flex h-full flex-col gap-2">
              <div class="flex justify-between">
                 <span class="text-xs font-semibold uppercase text-muted-foreground">JSON Body</span>
                 <button type="button" hlmBtn size="sm" variant="ghost" class="h-6 px-2 text-xs" (click)="loadExampleBody.emit()">Load Example</button>
              </div>
              <reqquest-code-editor
                class="flex-1 min-h-0 border rounded-md"
                [code]="activeTab.body"
                [lang]="'json'"
                [readonly]="false"
                (codeChange)="updateBody.emit($event)"
              />
            </div>
          }
        }

        @if (activeRequestTab === "pre") {
           <div class="flex h-full flex-col gap-2">
              <div class="flex justify-between">
                 <span class="text-xs font-semibold uppercase text-muted-foreground">Pre-request Script (JS)</span>
                 <button type="button" hlmBtn size="sm" variant="ghost" class="h-6 px-2 text-xs" (click)="loadExamplePreScript.emit()">Load Example</button>
              </div>
              <reqquest-code-editor
                class="flex-1 min-h-0 border rounded-md"
                [code]="activeTab.preRequestScript"
                [lang]="'plain'"
                [readonly]="false"
                (codeChange)="updatePreScript.emit($event)"
              />
           </div>
        }

        @if (activeRequestTab === "tests") {
           <div class="flex h-full flex-col gap-2">
              <div class="flex items-center justify-between">
                 <span class="text-xs font-semibold uppercase text-muted-foreground">Test Script (JS)</span>
                 <div class="flex items-center gap-2">
                    <span class="text-xs text-muted-foreground">{{ testResultSummary }}</span>
                    <button type="button" hlmBtn size="sm" variant="ghost" class="h-6 px-2 text-xs" (click)="loadExampleTestScript.emit()">Example</button>
                 </div>
              </div>
              <reqquest-code-editor
                class="min-h-[200px] flex-1 min-h-0 border rounded-md"
                [code]="activeTab.testScript"
                [lang]="'plain'"
                [readonly]="false"
                (codeChange)="updateTestScript.emit($event)"
              />

              @if (activeTab.testResults.length > 0) {
                <div class="mt-2 space-y-1 border-t pt-2">
                  <h4 class="mb-1 text-xs font-semibold">Results</h4>
                  @for (result of activeTab.testResults; track trackByIndex($index)) {
                    <div class="flex items-start gap-2 rounded border px-2 py-1 text-xs" [ngClass]="result.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'">
                      <span class="font-bold">{{ result.passed ? "PASS" : "FAIL" }}</span>
                      <span>{{ result.name }}</span>
                    </div>
                  }
                </div>
              }
           </div>
        }
      </div>
    </article>
  `
})
export class RequestOptionsComponent {
  @Input({ required: true }) activeTab!: Tab;
  @Input() unresolvedVariables: string[] = [];
  @Input() testResultSummary = "";
  @Input() canSendBody = true;
  @Input() activeRequestTab: RequestTab = "params";

  @Output() activeRequestTabChange = new EventEmitter<RequestTab>();
  
  // Param events
  @Output() addParam = new EventEmitter<void>();
  @Output() updateParamKey = new EventEmitter<{ index: number, value: string }>();
  @Output() updateParamValue = new EventEmitter<{ index: number, value: string }>();
  @Output() toggleParam = new EventEmitter<{ index: number, enabled: boolean }>();
  @Output() removeParam = new EventEmitter<number>();
  @Output() loadExampleParams = new EventEmitter<void>();

  // Header events
  @Output() addHeader = new EventEmitter<void>();
  @Output() updateHeaderKey = new EventEmitter<{ index: number, value: string }>();
  @Output() updateHeaderValue = new EventEmitter<{ index: number, value: string }>();
  @Output() toggleHeader = new EventEmitter<{ index: number, enabled: boolean }>();
  @Output() removeHeader = new EventEmitter<number>();

  // Auth events
  @Output() updateAuthType = new EventEmitter<AuthType>();
  @Output() updateBearerToken = new EventEmitter<string>();
  @Output() updateBasicUsername = new EventEmitter<string>();
  @Output() updateBasicPassword = new EventEmitter<string>();
  @Output() updateApiKeyKey = new EventEmitter<string>();
  @Output() updateApiKeyValue = new EventEmitter<string>();
  @Output() updateApiKeyIn = new EventEmitter<"header" | "query">();

  // Body events
  @Output() updateBody = new EventEmitter<string>();
  @Output() loadExampleBody = new EventEmitter<void>();

  // Script events
  @Output() updatePreScript = new EventEmitter<string>();
  @Output() loadExamplePreScript = new EventEmitter<void>();
  
  @Output() updateTestScript = new EventEmitter<string>();
  @Output() loadExampleTestScript = new EventEmitter<void>();

  readonly authTypes: Array<{ value: AuthType; label: string }> = [
    { value: "none", label: "No Auth" },
    { value: "bearer", label: "Bearer Token" },
    { value: "basic", label: "Basic Auth" },
    { value: "apikey", label: "API Key" },
  ];

  trackByIndex(index: number): number { return index; }
}
