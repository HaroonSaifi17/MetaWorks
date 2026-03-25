import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmTooltip } from "@spartan-ng/helm/tooltip";
import { NgIcon } from "@ng-icons/core";
import { TabResponse } from "../../utils/rest.interface";
import { formatBytes, formatDuration } from "../../utils/rest.utils";
import { CodeEditorComponent } from "../code-editor/code-editor.component";

export type ResponseSection = "body" | "headers" | "meta";

@Component({
  selector: "reqquest-response-viewer",
  standalone: true,
  imports: [CommonModule, HlmButton, HlmTooltip, NgIcon, CodeEditorComponent],
  template: `
    <article class="flex h-full w-full min-h-0 flex-col overflow-hidden bg-background" [class.rounded-lg]="!plain" [class.border]="!plain" [class.shadow-sm]="!plain">
      <!-- Header -->
      <header class="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-3 py-1">
         <div class="flex items-center gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Response</span>
            @if (response) {
               <div class="flex items-center gap-2 rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium shadow-sm" [ngClass]="getStatusTone(response.status)">
                  {{ response.status }} {{ response.statusText }}
               </div>
            }
         </div>

         @if (response) {
            <div class="flex items-center justify-end gap-3 flex-wrap">
               <div class="flex gap-3 text-[10px] text-muted-foreground font-mono">
                  <span>{{ formatDuration(response.durationMs) }}</span>
                  <span class="text-border">|</span>
                  <span>{{ formatBytes(response.sizeBytes) }}</span>
               </div>
               <div class="h-4 w-px bg-border"></div>
               <div class="flex bg-muted/50 p-0.5 rounded-md">
                 @for (section of sections; track section) {
                   <button
                     type="button"
                     class="rounded px-2 py-0.5 text-[10px] font-medium transition-all hover:bg-background hover:shadow-sm"
                     [class.bg-background]="activeSection === section"
                     [class.shadow-sm]="activeSection === section"
                     [class.text-foreground]="activeSection === section"
                     [class.text-muted-foreground]="activeSection !== section"
                     (click)="sectionChange.emit(section)"
                   >{{ section | titlecase }}</button>
                 }
               </div>
               <button type="button" hlmBtn size="icon" variant="ghost" class="h-7 w-7" (click)="copyBody.emit()" hlmTooltip="Copy Response">
                  <ng-icon name="lucideCopy" size="14px" />
               </button>
            </div>
         }
      </header>

      <!-- Content -->
      <div class="min-h-0 flex-1 relative bg-background">
        @if (isLoading) {
          <div class="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <ng-icon name="lucideLoaderCircle" size="32px" class="animate-spin text-primary" />
            <span class="text-sm font-medium">Sending request...</span>
          </div>
        } @else if (error) {
          <div class="p-4">
            <div class="rounded-md border border-destructive/20 bg-destructive/5 p-4">
               <h3 class="mb-2 text-sm font-semibold text-destructive">Error</h3>
               <pre class="whitespace-pre-wrap text-xs text-destructive/80 font-mono">{{ error | json }}</pre>
            </div>
          </div>
        } @else if (!response) {
          <div class="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/30">
             <ng-icon name="lucideSend" size="48px" strokeWidth="1" />
             <p class="text-sm">Enter a URL and click Send</p>
          </div>
        } @else {
           @if (activeSection === "body") {
               <reqquest-code-editor
                 class="block h-full w-full min-h-0"
                 [code]="formatResponseBody(response.data)"
                 [lang]="responseLanguage(response.data)"
               />
           }

           @if (activeSection === "headers") {
             <div class="absolute inset-0 overflow-auto p-0">
               <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
                     <tr>
                        <th class="border-b px-4 py-2 font-medium text-muted-foreground w-1/3">Name</th>
                        <th class="border-b px-4 py-2 font-medium text-muted-foreground">Value</th>
                     </tr>
                  </thead>
                  <tbody>
                     @for (header of Object.entries(response.headers || {}); track header[0]) {
                       <tr class="group border-b last:border-0 hover:bg-muted/20">
                          <td class="px-4 py-2 font-mono font-medium text-foreground truncate" [title]="header[0]">{{ header[0] }}</td>
                          <td class="px-4 py-2 font-mono text-muted-foreground break-all">{{ header[1] }}</td>
                       </tr>
                     }
                  </tbody>
               </table>
             </div>
           }

           @if (activeSection === "meta") {
              <div class="p-4 overflow-auto h-full">
                 <dl class="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
                    <dt class="text-muted-foreground">Request URL</dt>
                    <dd class="font-mono break-all select-all">{{ response.requestUrl }}</dd>

                    <dt class="text-muted-foreground">Status</dt>
                    <dd class="font-medium flex items-center gap-2">
                      <span [ngClass]="getStatusTone(response.status)">{{ response.status }}</span>
                      <span class="text-muted-foreground">{{ response.statusText }}</span>
                    </dd>

                    <dt class="text-muted-foreground">Duration</dt>
                    <dd>{{ formatDuration(response.durationMs || 0) }}</dd>

                    <dt class="text-muted-foreground">Size</dt>
                    <dd>{{ formatBytes(response.sizeBytes || 0) }}</dd>
                 </dl>
              </div>
           }
        }
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        min-height: 0;
        width: 100%;
      }
    `
  ]
})
export class ResponseViewerComponent {
  @Input() response: TabResponse | null = null;
  @Input() isLoading = false;
  @Input() error: any = null;
  @Input() activeSection: ResponseSection = "body";
  @Input() plain = false;

  @Output() sectionChange = new EventEmitter<ResponseSection>();
  @Output() copyBody = new EventEmitter<void>();

  readonly sections: ResponseSection[] = ["body", "headers", "meta"];
  readonly Object = Object;
  readonly formatBytes = formatBytes;
  readonly formatDuration = formatDuration;

  getStatusTone(status: number): string {
     if (status >= 200 && status < 300) return "text-emerald-600";
     if (status >= 300 && status < 400) return "text-blue-600";
     if (status >= 400 && status < 500) return "text-amber-600";
     if (status >= 500) return "text-red-600";
     return "text-muted-foreground";
  }

  formatResponseBody(data: unknown): string {
    if (typeof data === "string") return data;
    try { return JSON.stringify(data, null, 2); } catch { return String(data); }
  }

  responseLanguage(data: unknown): "json" | "plain" {
    if (data != null && typeof data === "object") return "json";
    if (typeof data === "string") {
      const normalized = data.trim();
      if (normalized.startsWith("{") || normalized.startsWith("[")) {
        try { JSON.parse(normalized); return "json"; } catch { return "plain"; }
      }
    }
    return "plain";
  }
}
