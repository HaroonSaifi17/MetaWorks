import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmInput } from "@spartan-ng/helm/input";
import {
  WorkspaceEnvironment,
  WorkspaceSettings,
  createDefaultWorkspaceSettings,
  getActiveEnvironmentVariables,
  loadWorkspaceSettings,
  saveWorkspaceSettings,
} from "../../core/workspace-settings";
import { UiPreferencesService } from "../../core/ui-preferences.service";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideSettings, lucidePalette, lucideMonitor, lucideLayout, lucideShield, lucideSave, lucideRotateCcw, lucidePlus, lucideTrash2, lucideCheck } from "@ng-icons/lucide";

@Component({
  selector: "reqquest-settings",
  standalone: true,
  imports: [CommonModule, FormsModule, HlmButton, HlmInput, NgIconComponent],
  providers: [provideIcons({ lucideSettings, lucidePalette, lucideMonitor, lucideLayout, lucideShield, lucideSave, lucideRotateCcw, lucidePlus, lucideTrash2, lucideCheck })],
  template: `
    <section class="flex h-full min-h-0 flex-col gap-2 p-2">
      <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        
        <!-- Toolbar -->
        <div class="flex items-center justify-between gap-2 rounded-md border bg-background p-2 shadow-sm shrink-0">
          <div class="flex items-center gap-2 px-2">
             <ng-icon name="lucideSettings" class="text-muted-foreground" size="16"></ng-icon>
             <span class="text-sm font-semibold">Settings</span>
          </div>
          <div class="flex items-center gap-2">
              @if (notice(); as message) {
                 <span class="text-[10px] md:text-xs text-emerald-600 font-medium animate-in fade-in slide-in-from-right-2 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                   <ng-icon name="lucideCheck" size="12"></ng-icon> {{ message }}
                 </span>
              }
              <button hlmBtn size="sm" variant="ghost" class="gap-1.5 text-xs h-8 px-2" (click)="resetDefaults()">
                 <ng-icon name="lucideRotateCcw" size="12"></ng-icon> <span class="hidden sm:inline">Reset</span>
              </button>
              <button hlmBtn size="sm" class="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3" (click)="saveAll()">
                 <ng-icon name="lucideSave" size="12"></ng-icon> Save <span class="hidden sm:inline">Changes</span>
              </button>
          </div>
        </div>

        <!-- Layout Container -->
        <div class="flex flex-col gap-3 flex-1 min-h-0">
             
             <!-- Top Row: UI & Network (Side by Side on Large) -->
             <div class="grid gap-3 grid-cols-1 lg:grid-cols-3 shrink-0">
                
                <!-- UI Preferences Card -->
                <article class="rounded-lg border bg-background shadow-sm overflow-hidden h-fit lg:col-span-1">
                    <div class="px-3 py-2 border-b bg-muted/20">
                        <h2 class="text-xs font-semibold flex items-center gap-1.5">
                            <ng-icon name="lucidePalette" class="text-muted-foreground" size="14"></ng-icon>
                            Appearance & UI
                        </h2>
                    </div>
                    <div class="p-3 space-y-2">
                        <div class="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                            <span class="text-xs font-medium">Theme</span>
                            <button hlmBtn size="sm" variant="outline" class="h-7 w-28 text-[10px]" (click)="uiPreferences.toggleDarkMode()">
                               {{ uiPreferences.darkMode() ? "Dark Mode" : "Light Mode" }}
                            </button>
                        </div>
                        <div class="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                             <span class="text-xs font-medium">Sidebar</span>
                             <button hlmBtn size="sm" variant="outline" class="h-7 w-28 text-[10px]" (click)="uiPreferences.toggleSidebarExpanded()">
                                {{ uiPreferences.sidebarExpanded() ? "Expanded" : "Collapsed" }}
                             </button>
                        </div>
                        <div class="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                             <span class="text-xs font-medium">Layout</span>
                             <button hlmBtn size="sm" variant="outline" class="h-7 w-28 text-[10px]" (click)="uiPreferences.toggleRestLayout()">
                                {{ uiPreferences.restLayout() === "vertical" ? "Vertical" : "Horizontal" }}
                             </button>
                        </div>
                         <div class="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                             <span class="text-xs font-medium">Interceptor</span>
                             <button hlmBtn size="sm" variant="outline" class="h-7 w-28 text-[10px]" (click)="uiPreferences.toggleInterceptorEnabled()">
                                {{ uiPreferences.interceptorEnabled() ? "Enabled" : "Disabled" }}
                             </button>
                        </div>
                    </div>
                </article>

                <!-- Network Settings Card -->
                <article class="rounded-lg border bg-background shadow-sm overflow-hidden h-full lg:col-span-2 flex flex-col">
                     <div class="px-3 py-2 border-b bg-muted/20">
                        <h2 class="text-xs font-semibold flex items-center gap-1.5">
                            <ng-icon name="lucideMonitor" class="text-muted-foreground" size="14"></ng-icon>
                            Network Configuration
                        </h2>
                    </div>
                    <div class="p-3">
                         <div class="flex flex-col sm:flex-row sm:items-end gap-3 max-w-sm sm:max-w-md">
                            <div class="flex-1 space-y-1">
                               <label class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Request Timeout (ms)</label>
                               <input
                                  hlmInput
                                  type="number"
                                  min="1000"
                                  max="120000"
                                  class="h-8 w-full font-mono text-xs"
                                  [ngModel]="timeoutInput()"
                                  (ngModelChange)="timeoutInput.set($event)"
                                />
                            </div>
                            <button hlmBtn size="sm" variant="secondary" class="h-8 shrink-0 text-xs w-full sm:w-auto" (click)="saveTimeout()">
                               Update
                            </button>
                         </div>
                         <p class="text-[10px] text-muted-foreground mt-1.5">
                            Controls how long to wait for a response before aborting. Min: 1000ms, Max: 120000ms.
                         </p>
                    </div>

                    <!-- Active Variables Preview -->
                    <div class="px-3 py-2 border-t bg-muted/20 flex items-center justify-between mt-1">
                         <h3 class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Active Variables Preview</h3>
                    </div>
                    <div class="flex-1 min-h-0 p-3 bg-muted/5 overflow-y-auto">
                        @if (activeVariablesEntries().length === 0) {
                          <div class="text-center py-2 text-muted-foreground text-xs opacity-60">
                             No active variables available.
                          </div>
                        } @else {
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            @for (entry of activeVariablesEntries(); track entry[0]) {
                              <div class="flex items-center justify-between rounded-md border bg-background px-2 py-1.5 text-[10px] shadow-sm">
                                <code class="text-blue-600 font-bold shrink-0">{{ entry[0] }}</code>
                                <code class="text-muted-foreground truncate ml-3 font-mono select-all">{{ entry[1] }}</code>
                              </div>
                            }
                          </div>
                        }
                    </div>
                </article>
             </div>

            <!-- Environments Editor (Full Width & Fills Remaining Height) -->
            <article class="rounded-lg border bg-background shadow-sm overflow-hidden flex flex-col flex-1 min-h-[300px]">
                <div class="px-3 py-2 border-b bg-muted/20 flex items-center justify-between sticky top-0 bg-background z-10 shrink-0">
                    <h2 class="text-xs font-semibold flex items-center gap-1.5">
                        <ng-icon name="lucideShield" class="text-muted-foreground" size="14"></ng-icon>
                        Environments & Variables
                    </h2>
                    <button hlmBtn size="sm" variant="outline" class="h-7 gap-1.5 text-[10px]" (click)="addEnvironment()">
                        <ng-icon name="lucidePlus" size="12"></ng-icon> New Environment
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/5 min-h-0">
                     @for (environment of environments(); track environment.id; let i = $index) {
                        <div class="rounded-md border bg-background shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                            <!-- Environment Header -->
                            <div class="px-3 py-2 border-b bg-muted/10 flex flex-col sm:flex-row sm:items-center gap-2">
                                <div class="flex-1 min-w-[150px]">
                                    <input
                                      hlmInput
                                      type="text"
                                      class="h-7 w-full font-semibold bg-transparent border-transparent hover:border-input focus:border-input transition-colors px-1.5 -ml-1.5 text-xs"
                                      [value]="environment.name"
                                      (input)="updateEnvironmentName(i, $any($event.target).value)"
                                    />
                                </div>
                                <div class="flex items-center justify-end gap-1.5">
                                     <button
                                      type="button"
                                      hlmBtn
                                      size="sm"
                                      [variant]="settings().activeEnvironmentId === environment.id ? 'default' : 'outline'"
                                      class="h-6 text-[10px] gap-1 px-2"
                                      (click)="setActiveEnvironment(environment.id)"
                                    >
                                      @if(settings().activeEnvironmentId === environment.id) {
                                         <ng-icon name="lucideCheck" size="10"></ng-icon> Active
                                      } @else {
                                         Set Active
                                      }
                                    </button>
                                    <button
                                      type="button"
                                      hlmBtn
                                      size="sm"
                                      variant="ghost"
                                      class="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                      (click)="removeEnvironment(environment.id)"
                                    >
                                      <ng-icon name="lucideTrash2" size="12"></ng-icon>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Variables List -->
                            <div class="p-3 space-y-1.5">
                                 @if (environment.variables.length === 0) {
                                     <p class="text-[10px] text-muted-foreground italic p-1">No variables defined.</p>
                                 }
                                 
                                 @for (variable of environment.variables; track varIndex; let varIndex = $index) {
                                     <div class="flex items-center gap-2 group">
                                         <div class="shrink-0 pt-0.5">
                                             <input
                                              type="checkbox"
                                              class="h-3.5 w-3.5 rounded border-input text-primary focus:ring-primary/20 cursor-pointer"
                                              [checked]="variable.enabled"
                                              (change)="toggleVariable(i, varIndex, $any($event.target).checked)"
                                            />
                                         </div>
                                         <div class="grid grid-cols-2 gap-2 flex-1">
                                             <input
                                              hlmInput
                                              type="text"
                                              class="h-7 text-[10px] font-mono"
                                              placeholder="KEY"
                                              [value]="variable.key"
                                              (input)="updateVariableKey(i, varIndex, $any($event.target).value)"
                                            />
                                             <input
                                              hlmInput
                                              type="text"
                                              class="h-7 text-[10px] font-mono"
                                              placeholder="VALUE"
                                              [value]="variable.value"
                                              (input)="updateVariableValue(i, varIndex, $any($event.target).value)"
                                            />
                                         </div>
                                         <button
                                          type="button"
                                          hlmBtn
                                          variant="ghost"
                                          size="sm"
                                          class="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                          (click)="removeVariable(i, varIndex)"
                                         >
                                           <ng-icon name="lucideTrash2" size="12"></ng-icon>
                                         </button>
                                     </div>
                                 }

                                 <div class="pt-1">
                                     <button
                                      type="button"
                                      hlmBtn
                                      size="sm"
                                      variant="ghost"
                                      class="h-6 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                                      (click)="addVariable(i)"
                                    >
                                      <ng-icon name="lucidePlus" size="10"></ng-icon> Add Variable
                                    </button>
                                 </div>
                            </div>
                        </div>
                     }
                </div>
            </article>

        </div>
      </div>
    </section>
  `,
  host: {
    class: "block h-full",
  },
})
export default class SettingsComponent {
  readonly uiPreferences = inject(UiPreferencesService);

  readonly settings = signal<WorkspaceSettings>(loadWorkspaceSettings());
  readonly timeoutInput = signal(String(this.settings().requestTimeoutMs));
  readonly notice = signal<string | null>(null);

  readonly environments = computed(() => this.settings().environments);
  readonly activeVariablesEntries = computed(() =>
    Object.entries(getActiveEnvironmentVariables(this.settings())),
  );

  saveTimeout(): void {
    const timeout = Number(this.timeoutInput());
    const sanitized = Number.isFinite(timeout)
      ? Math.max(1000, Math.min(120000, Math.round(timeout)))
      : 30000;

    this.settings.update((current) => ({
      ...current,
      requestTimeoutMs: sanitized,
    }));

    this.timeoutInput.set(String(sanitized));
    this.saveAll("Timeout updated.");
  }

  addEnvironment(): void {
    this.settings.update((current) => {
      const nextId =
        current.environments.reduce((max, env) => Math.max(max, env.id), 0) + 1;

      const nextEnvironment: WorkspaceEnvironment = {
        id: nextId,
        name: `Environment ${nextId}`,
        variables: [{ key: "", value: "", enabled: true }],
      };

      return {
        ...current,
        activeEnvironmentId: current.activeEnvironmentId ?? nextId,
        environments: [...current.environments, nextEnvironment],
      };
    });
  }

  removeEnvironment(environmentId: number): void {
    this.settings.update((current) => {
      if (current.environments.length <= 1) {
        return current;
      }

      const environments = current.environments.filter(
        (environment) => environment.id !== environmentId,
      );

      const activeEnvironmentId =
        current.activeEnvironmentId === environmentId
          ? (environments[0]?.id ?? null)
          : current.activeEnvironmentId;

      return {
        ...current,
        activeEnvironmentId,
        environments,
      };
    });
  }

  setActiveEnvironment(environmentId: number): void {
    this.settings.update((current) => ({
      ...current,
      activeEnvironmentId: environmentId,
    }));
    this.saveAll("Active environment updated.");
  }

  updateEnvironmentName(environmentIndex: number, name: string): void {
    this.settings.update((current) => {
      const environments = [...current.environments];
      environments[environmentIndex] = {
        ...environments[environmentIndex],
        name,
      };

      return {
        ...current,
        environments,
      };
    });
  }

  addVariable(environmentIndex: number): void {
    this.settings.update((current) => {
      const environments = [...current.environments];
      const environment = environments[environmentIndex];

      environments[environmentIndex] = {
        ...environment,
        variables: [
          ...environment.variables,
          { key: "", value: "", enabled: true },
        ],
      };

      return {
        ...current,
        environments,
      };
    });
  }

  removeVariable(environmentIndex: number, variableIndex: number): void {
    this.settings.update((current) => {
      const environments = [...current.environments];
      const environment = environments[environmentIndex];
      const variables = environment.variables.filter(
        (_, index) => index !== variableIndex,
      );

      environments[environmentIndex] = {
        ...environment,
        variables:
          variables.length > 0
            ? variables
            : [{ key: "", value: "", enabled: true }],
      };

      return {
        ...current,
        environments,
      };
    });
  }

  updateVariableKey(
    environmentIndex: number,
    variableIndex: number,
    key: string,
  ): void {
    this.patchVariable(environmentIndex, variableIndex, { key });
  }

  updateVariableValue(
    environmentIndex: number,
    variableIndex: number,
    value: string,
  ): void {
    this.patchVariable(environmentIndex, variableIndex, { value });
  }

  toggleVariable(
    environmentIndex: number,
    variableIndex: number,
    enabled: boolean,
  ): void {
    this.patchVariable(environmentIndex, variableIndex, { enabled });
  }

  saveAll(message = "Settings saved."): void {
    saveWorkspaceSettings(this.settings());
    this.notice.set(message);
    setTimeout(() => this.notice.set(null), 3000); // Clear message after 3s
  }

  resetDefaults(): void {
    const defaults = createDefaultWorkspaceSettings();
    this.settings.set(defaults);
    this.timeoutInput.set(String(defaults.requestTimeoutMs));
    saveWorkspaceSettings(defaults);
    this.notice.set("Reset to defaults.");
     setTimeout(() => this.notice.set(null), 3000);
  }

  private patchVariable(
    environmentIndex: number,
    variableIndex: number,
    patch: Partial<{ key: string; value: string; enabled: boolean }>,
  ): void {
    this.settings.update((current) => {
      const environments = [...current.environments];
      const environment = environments[environmentIndex];
      const variables = [...environment.variables];

      variables[variableIndex] = {
        ...variables[variableIndex],
        ...patch,
      };

      environments[environmentIndex] = {
        ...environment,
        variables,
      };

      return {
        ...current,
        environments,
      };
    });
  }
}
