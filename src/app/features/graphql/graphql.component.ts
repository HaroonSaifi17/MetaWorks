import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import axios from 'axios';
import { GraphqlToolbarComponent } from './components/toolbar/toolbar.component';
import { GraphqlRequestPaneComponent } from './components/request-pane/request-pane.component';
import { ResponseViewerComponent } from '../rest-panel/components/response-viewer/response-viewer.component';
import { TabResponse } from '../rest-panel/utils/rest.interface';
import { UiPreferencesService } from '../../core/ui-preferences.service';
import { 
  getActiveEnvironmentVariables, 
  loadWorkspaceSettings 
} from '../../core/workspace-settings';
import { 
  applyEnvironmentVariables, 
  findUnresolvedEnvironmentVariables 
} from '../rest-panel/utils/rest.utils';

@Component({
  selector: 'app-graphql-feature',
  standalone: true,
  imports: [
    CommonModule,
    GraphqlToolbarComponent,
    GraphqlRequestPaneComponent,
    ResponseViewerComponent
  ],
  template: `
    <section class="flex h-full min-h-0 flex-col gap-2 p-2">
      <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <!-- Toolbar -->
        <app-graphql-toolbar
          [endpoint]="endpoint()"
          [isLoading]="loading()"
          (endpointChange)="endpoint.set($event)"
          (send)="runQuery()"
          (format)="formatQuery()"
          (loadExample)="resetExample()"
        />

        <!-- Main Content (Grid View) -->
        <div 
          class="grid gap-2"
          [ngClass]="
            uiPreferences.restLayout() === 'vertical'
              ? 'grid-cols-1 grid-rows-2 min-h-0 flex-1'
              : 'grid-cols-1 auto-rows-[minmax(400px,1fr)] lg:grid-cols-2 lg:grid-rows-1 lg:min-h-0 lg:flex-1'
          "
        >
          
          <!-- Request Pane (Left) -->
          <div class="flex flex-col min-h-0 overflow-hidden rounded-md border bg-background">
            <app-graphql-request-pane
              class="flex-1 min-h-0"
              [query]="query()"
              [variables]="variables()"
              [headers]="headersJson()"
              [authType]="authType()"
              [authToken]="authToken()"
              (queryChange)="query.set($event)"
              (variablesChange)="variables.set($event)"
              (headersChange)="headersJson.set($event)"
              (authTypeChange)="authType.set($event)"
              (authTokenChange)="authToken.set($event)"
            />
            
            <!-- Unresolved Variables Warning -->
            @if (hasUnresolvedVariables()) {
              <div class="bg-amber-50 p-2 text-xs text-amber-800 border-t border-amber-200">
                Unresolved variables detected. Check your environment settings.
              </div>
            }
          </div>

          <!-- Response Pane (Right) -->
          <div class="flex min-h-0 flex-col overflow-hidden rounded-md border bg-background">
            <reqquest-response-viewer
              class="h-full w-full min-h-0"
              [response]="response()"
              [isLoading]="loading()"
              [error]="error()"
              [plain]="true"
            />
          </div>

        </div>
      </div>
    </section>
  `,
  host: {
    class: 'block h-full min-h-0'
  }
})
export class GraphqlComponent {
  readonly uiPreferences = inject(UiPreferencesService);
  readonly endpoint = signal("https://countries.trevorblades.com/graphql");
  readonly authType = signal<"none" | "bearer">("none");
  readonly authToken = signal("");
  readonly headersJson = signal("{}");
  readonly query = signal(
    `query Countries($code: ID!) {\n  country(code: $code) {\n    code\n    name\n    capital\n    currency\n  }\n}`
  );
  readonly variables = signal('{"code":"IN"}');
  
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly response = signal<TabResponse | null>(null);

  readonly hasUnresolvedVariables = computed(
    () =>
      findUnresolvedEnvironmentVariables(
        `${this.endpoint()} ${this.query()} ${this.variables()}`
      ).length > 0
  );

  formatQuery(): void {
    try {
      // Basic formatting (indentation)
      // For a proper formatter we'd need prettier/graphql, but let's do a simple one or keep the existing logic
      // The existing logic was just trimming lines.
      const normalized = this.query()
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
        .trim();
      this.query.set(`${normalized}\n`);
    } catch (e) {
      console.error("Format error", e);
    }
  }

  resetExample(): void {
    this.endpoint.set("https://countries.trevorblades.com/graphql");
    this.query.set(
      `query Countries($code: ID!) {\n  country(code: $code) {\n    code\n    name\n    capital\n    currency\n  }\n}`
    );
    this.variables.set('{"code":"US"}');
    this.error.set(null);
    this.response.set(null);
  }

  async runQuery(): Promise<void> {
    const environmentVariables = getActiveEnvironmentVariables(loadWorkspaceSettings());
    const endpoint = applyEnvironmentVariables(this.endpoint().trim(), environmentVariables);
    const query = applyEnvironmentVariables(this.query(), environmentVariables);
    const variablesRaw = applyEnvironmentVariables(this.variables(), environmentVariables);

    if (!endpoint) {
      this.error.set("Endpoint is required.");
      return;
    }

    let parsedVariables: Record<string, unknown>;
    let parsedHeaders: Record<string, string>;

    try {
      parsedVariables = variablesRaw.trim() ? JSON.parse(variablesRaw) : {};
    } catch {
      this.error.set("Variables must be valid JSON.");
      return;
    }

    try {
      parsedHeaders = this.headersJson().trim() ? JSON.parse(this.headersJson()) : {};
    } catch {
      this.error.set("Headers must be valid JSON.");
      return;
    }

    if (this.authType() === "bearer" && !this.authToken().trim()) {
      this.error.set("Bearer token is required when Authorization is Bearer.");
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const startsAt = performance.now();

    try {
      const res = await axios.post(
        endpoint,
        { query, variables: parsedVariables },
        {
          headers: {
            "content-type": "application/json",
            ...parsedHeaders,
            ...(this.authType() === "bearer" ? { Authorization: `Bearer ${this.authToken().trim()}` } : {})
          },
          validateStatus: () => true
        }
      );

      const durationMs = Math.round(performance.now() - startsAt);
      const sizeBytes = new TextEncoder().encode(JSON.stringify(res.data)).length; // Approx size

      this.response.set({
        requestUrl: endpoint,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers as Record<string, string>,
        data: res.data,
        durationMs,
        sizeBytes
      });

    } catch (err: any) {
      this.error.set(err.message || String(err));
      this.response.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
