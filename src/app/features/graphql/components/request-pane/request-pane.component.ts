import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2, lucideCode, lucideVariable, lucideList, lucideShield } from '@ng-icons/lucide';

import { CodeEditorComponent } from '../../../rest-panel/components/code-editor/code-editor.component';

@Component({
  selector: 'app-graphql-request-pane',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButton,
    HlmInput,
    HlmSelectImports,
    NgIconComponent,
    CodeEditorComponent
  ],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
  `],
  providers: [
    provideIcons({ lucidePlus, lucideTrash2, lucideCode, lucideVariable, lucideList, lucideShield })
  ],
  template: `
    <!-- Tabs Header -->
      <div class="flex shrink-0 flex-wrap items-center gap-1 border-b bg-muted/20 px-2 py-1">
        <button
          type="button"
          hlmBtn
          size="sm"
          variant="ghost"
          class="h-7 whitespace-nowrap gap-2 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm transition-all"
          [attr.data-active]="activeTab === 'query'"
          (click)="activeTab = 'query'"
        >
          <ng-icon name="lucideCode" size="14" />
          Query
        </button>
        <button
          type="button"
          hlmBtn
          size="sm"
          variant="ghost"
          class="h-7 whitespace-nowrap gap-2 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm transition-all"
          [attr.data-active]="activeTab === 'variables'"
          (click)="activeTab = 'variables'"
        >
          <ng-icon name="lucideVariable" size="14" />
          Variables
        </button>
        <button
          type="button"
          hlmBtn
          size="sm"
          variant="ghost"
          class="h-7 whitespace-nowrap gap-2 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm transition-all"
          [attr.data-active]="activeTab === 'headers'"
          (click)="activeTab = 'headers'"
        >
           <ng-icon name="lucideList" size="14" />
          Headers
        </button>
        <button
          type="button"
          hlmBtn
          size="sm"
          variant="ghost"
          class="h-7 whitespace-nowrap gap-2 text-xs font-medium text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm transition-all"
          [attr.data-active]="activeTab === 'auth'"
          (click)="activeTab = 'auth'"
        >
           <ng-icon name="lucideShield" size="14" />
          Auth
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative bg-background min-h-0 flex flex-col">
        <!-- Query Tab -->
        <reqquest-code-editor
          *ngIf="activeTab === 'query'"
          class="flex-1 min-h-0 block"
          [code]="query"
          lang="graphql"
          [plain]="true"
          [readonly]="false"
          (codeChange)="queryChange.emit($event)"
        />

        <!-- Variables Tab -->
        <reqquest-code-editor
          *ngIf="activeTab === 'variables'"
          class="flex-1 min-h-0 block"
          [code]="variables"
          lang="json"
          [plain]="true"
          [readonly]="false"
          (codeChange)="variablesChange.emit($event)"
        />

        <!-- Headers Tab -->
        <div *ngIf="activeTab === 'headers'" class="h-full flex flex-col p-0">
          <div class="bg-muted/10 px-4 py-2 text-xs text-muted-foreground border-b font-mono shrink-0 flex items-center justify-between">
            <span>JSON Format: &#123; "Key": "Value" &#125;</span>
          </div>
          <reqquest-code-editor
            class="flex-1 min-h-0 block"
            [code]="headers"
            lang="json"
            [plain]="true"
            [readonly]="false"
            (codeChange)="headersChange.emit($event)"
          />
        </div>

        <!-- Auth Tab -->
        <div *ngIf="activeTab === 'auth'" class="h-full w-full p-4 overflow-auto">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Authorization Type
              </label>
              <div class="flex flex-wrap gap-2">
                 <button 
                   type="button" 
                   hlmBtn 
                   size="sm" 
                   variant="outline" 
                   class="h-8 text-xs" 
                   [class.border-primary]="authType === 'none'" 
                   [class.bg-primary-foreground]="authType === 'none'" 
                   (click)="authTypeChange.emit('none')"
                 >
                   No Auth
                 </button>
                 <button 
                   type="button" 
                   hlmBtn 
                   size="sm" 
                   variant="outline" 
                   class="h-8 text-xs" 
                   [class.border-primary]="authType === 'bearer'" 
                   [class.bg-primary-foreground]="authType === 'bearer'" 
                   (click)="authTypeChange.emit('bearer')"
                 >
                   Bearer Token
                 </button>
              </div>
            </div>

            <div *ngIf="authType === 'bearer'" class="space-y-2 animate-in fade-in slide-in-from-top-1">
              <label class="text-xs font-medium text-muted-foreground">
                Token
              </label>
              <input
                hlmInput
                type="password"
                class="font-mono text-sm"
                placeholder="Paste your Bearer token"
                [ngModel]="authToken"
                (ngModelChange)="authTokenChange.emit($event)"
              />
            </div>
          </div>
        </div>
      </div>
  `
})
export class GraphqlRequestPaneComponent {
  @Input() query = '';
  @Input() variables = '';
  @Input() headers = '';
  @Input() authType: 'none' | 'bearer' = 'none';
  @Input() authToken = '';

  @Output() queryChange = new EventEmitter<string>();
  @Output() variablesChange = new EventEmitter<string>();
  @Output() headersChange = new EventEmitter<string>();
  @Output() authTypeChange = new EventEmitter<'none' | 'bearer'>();
  @Output() authTokenChange = new EventEmitter<string>();

  activeTab: 'query' | 'variables' | 'headers' | 'auth' = 'query';
}





