import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePlay, lucideWrapText, lucideBookOpen } from '@ng-icons/lucide';

@Component({
  selector: 'app-graphql-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButton,
    HlmInput,
    NgIconComponent
  ],
  providers: [
    provideIcons({ lucidePlay, lucideWrapText, lucideBookOpen })
  ],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <!-- Endpoint Input Group -->
      <div class="group flex h-10 min-w-[200px] flex-1 items-center rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all relative z-10">
        <div class="flex h-full items-center justify-center rounded-l-md bg-muted px-3 text-xs font-bold text-muted-foreground tracking-wide border-r">
          POST
        </div>
        
        <input
          hlmInput
          type="text"
          class="h-full min-w-0 flex-1 border-none bg-transparent px-3 font-mono text-sm shadow-none focus-visible:ring-0"
          placeholder="https://api.example.com/graphql"
          [ngModel]="endpoint"
          (ngModelChange)="endpointChange.emit($event)"
          (keydown.enter)="send.emit()"
        />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <div class="flex h-10 items-center rounded-md border bg-background shadow-sm">
          <button
            hlmBtn
            variant="ghost"
            size="icon"
            class="h-full w-9 rounded-l-md rounded-r-none hover:bg-muted transition-colors text-foreground"
            (click)="format.emit()"
            title="Format Query"
          >
            <ng-icon name="lucideWrapText" size="16" />
          </button>
          <div class="h-4 w-px bg-border"></div>
          <button
            hlmBtn
            variant="ghost"
            size="icon"
            class="h-full w-9 rounded-r-md rounded-l-none hover:bg-muted transition-colors text-foreground"
            (click)="loadExample.emit()"
            title="Load Example"
          >
            <ng-icon name="lucideBookOpen" size="16" />
          </button>
        </div>

        <button
          hlmBtn
          class="h-10 gap-2 bg-primary px-6 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          [disabled]="isLoading"
          (click)="send.emit()"
        >
          @if (isLoading) {
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          } @else {
            <ng-icon name="lucidePlay" size="14" />
          }
          <span>{{ isLoading ? 'Sending' : 'Send' }}</span>
        </button>
      </div>
    </div>
  `
})
export class GraphqlToolbarComponent {
  @Input() endpoint = '';
  @Input() isLoading = false;
  @Output() endpointChange = new EventEmitter<string>();
  @Output() send = new EventEmitter<void>();
  @Output() format = new EventEmitter<void>();
  @Output() loadExample = new EventEmitter<void>();
}
