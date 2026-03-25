import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { RestTabStore } from "./utils/rest-tab.store";
import { AuthType, HttpMethod } from "./utils/rest.interface";
import {
  findUnresolvedEnvironmentVariables,
  formatBytes,
  formatDuration,
  methodColor,
  resolveRequestUrl,
} from "./utils/rest.utils";
import { UiPreferencesService } from "../../core/ui-preferences.service";
import { RestWorkbenchService } from "../../core/rest-workbench.service";
import { NotificationsService } from "../../core/notifications.service";
import { CodeHighlightPipe } from "../../core/code-highlight.pipe";

// Components
import { RequestToolbarComponent } from "./components/request-toolbar/request-toolbar.component";
import { RequestOptionsComponent, RequestTab } from "./components/request-options/request-options.component";
import { ResponseViewerComponent, ResponseSection } from "./components/response-viewer/response-viewer.component";

@Component({
  selector: "reqquest-rest-panel",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CodeHighlightPipe,
    RequestToolbarComponent,
    RequestOptionsComponent,
    ResponseViewerComponent,
  ],
  templateUrl: "./rest-panel.component.html",
  styleUrl: "./rest-panel.component.css",
  host: {
    class: "block h-full",
  },
})
export class RestPanelComponent {
  @ViewChild(RequestToolbarComponent) private toolbar?: RequestToolbarComponent;

  readonly tabStore = inject(RestTabStore);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly uiPreferences = inject(UiPreferencesService);
  private readonly restWorkbench = inject(RestWorkbenchService);
  private readonly notifications = inject(NotificationsService);

  readonly methodColor = methodColor;
  readonly formatBytes = formatBytes;
  readonly formatDuration = formatDuration;

  readonly requestMethods: HttpMethod[] = [
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
  
  readonly activeRequestTab = signal<RequestTab>("params");
  readonly responseSection = signal<ResponseSection>("body");
  readonly validationMessage = signal<string | null>(null);
  readonly activeTab = computed(() => this.tabStore.activeTab());
  readonly selectedAuthType = computed(() => this.activeTab().auth.type);
  readonly testResultSummary = computed(() => {
    const results = this.activeTab().testResults;
    if (!results.length) {
      return "No tests";
    }

    const passed = results.filter((result) => result.passed).length;
    return `${passed}/${results.length} passed`;
  });
  readonly canSendBody = computed(() => {
    const method = this.activeTab().method;
    return method !== "GET" && method !== "HEAD";
  });
  readonly unresolvedVariables = computed(() => {
    const tab = this.activeTab();
    const values = [
      tab.url,
      tab.body,
      ...tab.headers.flatMap((header) => [header.key, header.value]),
      ...tab.params.flatMap((param) => [param.key, param.value]),
    ];

    const unresolved = new Set<string>();
    for (const value of values) {
      for (const variable of findUnresolvedEnvironmentVariables(value)) {
        unresolved.add(variable);
      }
    }

    return [...unresolved];
  });

  readonly requestForm = this.fb.group({
    method: this.fb.control<HttpMethod>(
      this.tabStore.activeTab().method || "GET",
    ),
    url: this.fb.control(this.tabStore.activeTab().url || ""),
    body: this.fb.control(this.tabStore.activeTab().body || ""),
  });

  constructor() {
    effect(() => {
      const activeTab = this.tabStore.activeTab();

      this.requestForm.setValue(
        {
          method: activeTab.method,
          url: activeTab.url,
          body: activeTab.body,
        },
        { emitEvent: false },
      );
    });

    this.requestForm.valueChanges.subscribe((value) => {
      this.tabStore.updateTab({
        method: value.method || "GET",
        url: value.url || "",
        body: value.body || "",
      });
      this.validationMessage.set(null);
    });

    effect(() => {
      const token = this.restWorkbench.urlFocusRequests();
      if (token === 0) {
        return;
      }

      queueMicrotask(() => {
        untracked(() => {
          this.focusUrlInput();
        });
      });
    });
  }

  @HostListener("window:keydown", ["$event"])
  handleShortcuts(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && key === "enter") {
      event.preventDefault();
      this.submitRequest();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && key === "k") {
      event.preventDefault();
      this.focusUrlInput();
      return;
    }

    if (event.altKey && key === "n") {
      event.preventDefault();
      this.tabStore.addTab();
      queueMicrotask(() => this.focusUrlInput());
      return;
    }

    if (event.key === "Escape") {
      this.cancelRequest();
    }
  }

  submitRequest(): void {
    const url = this.requestForm.controls.url.value.trim();
    if (!url) {
      this.validationMessage.set("Request URL is required.");
      this.focusUrlInput();
      return;
    }

    if (!this.isUrlLike(url)) {
      this.validationMessage.set(
        "Request URL must be absolute or start with /api (example: /api/v1/hello).",
      );
      this.focusUrlInput();
      return;
    }

    this.validationMessage.set(null);
    void this.tabStore.makeRequest();
  }

  cancelRequest(): void {
    this.tabStore.cancelRequest(this.tabStore.activeTabIndex());
  }

  saveRequestSnapshot(): void {
    if (typeof document === "undefined") {
      return;
    }

    const tab = this.tabStore.activeTab();
    const exportPayload = {
      ...tab,
      abortController: undefined,
      isLoading: false,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tab.name.replace(/\s+/g, "-").toLowerCase()}.reqquest.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    this.notifications.show("Request snapshot downloaded.", "success");
  }

  duplicateActiveTab(): void {
    this.tabStore.duplicateTab(this.tabStore.activeTabIndex());
    queueMicrotask(() => this.focusUrlInput());
    this.notifications.show("Request duplicated.", "info");
  }

  clearActiveTab(): void {
    this.tabStore.resetActiveTabRequest();
    this.activeRequestTab.set("params");
    this.responseSection.set("body");

    this.notifications.show("Request cleared.", "warning");
    queueMicrotask(() => this.focusUrlInput());
  }

  applyUsersExample(): void {
    this.tabStore.addParams([
      { key: "page", value: "1", enabled: true },
      { key: "limit", value: "10", enabled: true },
    ]);
    this.requestForm.patchValue({ method: "GET", url: "/api/v1/users" });
    this.activeRequestTab.set("params");
    this.notifications.show("Loaded users list example.", "info");
  }

  applyCreatePostExample(): void {
     this.requestForm.patchValue({
        method: "POST",
        url: "/api/v1/posts",
        body: JSON.stringify({ title: "ReqQuest sample", body: "Request created from sample template.", userId: 1 }, null, 2)
     });
    this.activeRequestTab.set("body");
    this.notifications.show("Loaded create resource example.", "info");
  }

  async copyResponseBody(): Promise<void> {
    const payload = this.activeTab().response?.data;
    if (payload == null) {
      this.notifications.show("No response body to copy.", "warning");
      return;
    }

    const text = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      this.notifications.show("Clipboard is unavailable.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.notifications.show("Response body copied.", "success");
    } catch {
      this.notifications.show("Unable to copy response body.", "error");
    }
  }

  selectRequestTab(tab: RequestTab): void {
    this.activeRequestTab.set(tab);
  }

  selectResponseSection(section: ResponseSection): void {
    this.responseSection.set(section);
  }

  addHeader(): void {
    this.tabStore.addHeader();
  }

  addParam(): void {
    this.tabStore.addParam();
  }

  updateHeaderKey(index: number, key: string): void {
    this.tabStore.updateHeader(index, { key });
  }

  updateHeaderValue(index: number, value: string): void {
    this.tabStore.updateHeader(index, { value });
  }

  toggleHeader(index: number, enabled: boolean): void {
    this.tabStore.updateHeader(index, { enabled });
  }

  removeHeader(index: number): void {
    this.tabStore.removeHeader(index);
  }

  updateParamKey(index: number, key: string): void {
    this.tabStore.updateParam(index, { key });
  }

  updateParamValue(index: number, value: string): void {
    this.tabStore.updateParam(index, { value });
  }

  selectAuthType(authType: AuthType): void {
    this.tabStore.updateTabAuth({ type: authType });
  }

  updateBearerToken(value: string): void {
    this.tabStore.updateTabAuth({ bearerToken: value });
  }

  updateBasicUsername(value: string): void {
    this.tabStore.updateTabAuth({ basicUsername: value });
  }

  updateBasicPassword(value: string): void {
    this.tabStore.updateTabAuth({ basicPassword: value });
  }

  updateApiKeyKey(value: string): void {
    this.tabStore.updateTabAuth({ apiKeyKey: value });
  }

  updateApiKeyValue(value: string): void {
    this.tabStore.updateTabAuth({ apiKeyValue: value });
  }

  updateApiKeyIn(target: "header" | "query"): void {
    this.tabStore.updateTabAuth({ apiKeyIn: target });
  }

  updatePreRequestScript(value: string): void {
    this.tabStore.updatePreRequestScript(value);
  }

  updateTestScript(value: string): void {
    this.tabStore.updateTestScript(value);
  }

  updateBody(value: string): void {
     this.tabStore.updateTab({ body: value });
  }

  applyPreRequestScriptExample(): void {
    this.tabStore.updatePreRequestScript(
      [
        "// Runs before sending the request",
        "pw.request.setHeader('X-Request-Source', 'reqquest');",
        "pw.request.setParam('timestamp', String(Date.now()));",
      ].join("\\n"),
    );
    this.activeRequestTab.set("pre");
    this.notifications.show("Loaded pre-request script example.", "info");
  }

  applyTestScriptExample(): void {
    this.tabStore.updateTestScript(
      [
        "pw.test('Status is success', () => {",
        "  pw.expect(pw.response.status).toBeLevel2xx();",
        "});",
        "",
        "pw.test('Response has data', () => {",
        "  pw.expect(pw.response.body).toBeType('object');",
        "});",
      ].join("\\n"),
    );
    this.activeRequestTab.set("tests");
    this.notifications.show("Loaded test script example.", "info");
  }

  copyCurlCommand(): void {
    const tab = this.activeTab();
    const lines: string[] = [`curl -X ${tab.method}`];

    const headers = tab.headers
      .filter((entry) => entry.enabled && entry.key.trim())
      .map((entry) => `-H \\"${entry.key}: ${entry.value}\\"`);
    lines.push(...headers);

    if (tab.auth.type === "bearer" && tab.auth.bearerToken.trim()) {
      lines.push(`-H \\"Authorization: Bearer ${tab.auth.bearerToken.trim()}\\"`);
    }

    if (tab.method !== "GET" && tab.method !== "HEAD" && tab.body.trim()) {
      lines.push(`--data '${tab.body.replace(/'/g, "'\\''")}'`);
    }

    lines.push(`\\"${tab.url}\\"`);
    const command = lines.join(" ");

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard
        .writeText(command)
        .then(() => this.notifications.show("cURL command copied.", "success"))
        .catch(() => this.notifications.show("Unable to copy cURL.", "error"));
      return;
    }

    this.notifications.show("Clipboard is unavailable.", "error");
  }

  toggleParam(index: number, enabled: boolean): void {
    this.tabStore.updateParam(index, { enabled });
  }

  removeParam(index: number): void {
    this.tabStore.removeParam(index);
  }

  getStatusTone(status: number): string {
    if (status >= 200 && status < 300) {
      return "text-emerald-600";
    }

    if (status >= 300 && status < 400) {
      return "text-blue-600";
    }

    if (status >= 400 && status < 500) {
      return "text-amber-600";
    }

    if (status >= 500) {
      return "text-red-600";
    }

    return "text-muted-foreground";
  }

  private focusUrlInput(): void {
    this.toolbar?.focusUrlInput();
  }

  private isUrlLike(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("/api")) {
      return false;
    }

    try {
      const parsed = new URL(resolveRequestUrl(trimmed));
      return Boolean(parsed.protocol && parsed.host);
    } catch {
      return false;
    }
  }

  protected readonly Object = Object;
  
  // TrackBy methods are no longer needed here as they are inside components
}
