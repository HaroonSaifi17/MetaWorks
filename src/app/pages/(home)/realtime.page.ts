import { CommonModule } from "@angular/common";
import { Component, OnDestroy, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmInput } from "@spartan-ng/helm/input";
import {
  applyEnvironmentVariables,
  findUnresolvedEnvironmentVariables,
} from "../../features/rest-panel/utils/rest.utils";
import {
  getActiveEnvironmentVariables,
  loadWorkspaceSettings,
} from "../../core/workspace-settings";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucidePlug, lucidePlugZap, lucideSend, lucideTrash2, lucideHistory } from "@ng-icons/lucide";

@Component({
  selector: "reqquest-realtime",
  standalone: true,
  imports: [CommonModule, FormsModule, HlmButton, HlmInput, NgIconComponent],
  providers: [provideIcons({ lucidePlug, lucidePlugZap, lucideSend, lucideTrash2, lucideHistory })],
  template: `
    <section class="flex h-full min-h-0 flex-col gap-2 p-2">
      <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <div class="flex-1 grid gap-2 grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr]">
          
          <!-- Sidebar / Configuration & Send -->
          <aside class="flex flex-col gap-2 min-w-0 md:order-first order-last h-full">
            
            <!-- Connection Settings Card -->
            <div class="rounded-lg border bg-background shadow-sm p-3 space-y-3 shrink-0">
              <div class="space-y-1.5">
                <label class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Protocol</label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-muted/50 p-1 rounded-md">
                  <button
                    type="button"
                    class="text-[10px] font-medium py-1 rounded-sm transition-all duration-200"
                    [class.bg-background]="protocol() === 'websocket'"
                    [class.text-foreground]="protocol() === 'websocket'"
                    [class.shadow-sm]="protocol() === 'websocket'"
                    [class.text-muted-foreground]="protocol() !== 'websocket'"
                    (click)="setProtocol('websocket')"
                  >WS</button>
                  <button
                    type="button"
                    class="text-[10px] font-medium py-1 rounded-sm transition-all duration-200"
                    [class.bg-background]="protocol() === 'sse'"
                    [class.text-foreground]="protocol() === 'sse'"
                    [class.shadow-sm]="protocol() === 'sse'"
                    [class.text-muted-foreground]="protocol() !== 'sse'"
                    (click)="setProtocol('sse')"
                  >SSE</button>
                  <button
                    type="button"
                    class="text-[10px] font-medium py-1 rounded-sm transition-all duration-200"
                    [class.bg-background]="protocol() === 'socketio'"
                    [class.text-foreground]="protocol() === 'socketio'"
                    [class.shadow-sm]="protocol() === 'socketio'"
                    [class.text-muted-foreground]="protocol() !== 'socketio'"
                    (click)="setProtocol('socketio')"
                  >IO</button>
                  <button
                    type="button"
                    class="text-[10px] font-medium py-1 rounded-sm transition-all duration-200"
                    [class.bg-background]="protocol() === 'mqtt'"
                    [class.text-foreground]="protocol() === 'mqtt'"
                    [class.shadow-sm]="protocol() === 'mqtt'"
                    [class.text-muted-foreground]="protocol() !== 'mqtt'"
                    (click)="setProtocol('mqtt')"
                  >MQTT</button>
                </div>
              </div>

              <div class="space-y-1.5">
                 <label class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Connection</label>
                 <div class="flex flex-col sm:flex-row gap-2">
                    <input
                      hlmInput
                      type="text"
                      class="h-8 flex-1 font-mono text-xs w-full"
                      [placeholder]="
                        protocol() === 'websocket'
                          ? 'wss://echo.websocket.events'
                          : protocol() === 'sse'
                            ? 'https://example.com/events'
                            : protocol() === 'socketio'
                              ? 'ws://localhost:3000'
                              : 'wss://test.mosquitto.org:8081'
                      "
                      [ngModel]="socketUrl()"
                      (ngModelChange)="socketUrl.set($event)"
                    />
                    @if (connected()) {
                      <button hlmBtn size="sm" variant="destructive" class="h-8 w-full sm:w-20 shrink-0 text-xs" (click)="disconnect()">
                        Disconnect
                      </button>
                    } @else {
                      <button hlmBtn size="sm" class="h-8 w-full sm:w-20 shrink-0 text-xs bg-primary text-primary-foreground hover:bg-primary/90" (click)="connect()">
                        Connect
                      </button>
                    }
                 </div>
                 
                 @if (error(); as message) {
                   <div class="text-[10px] text-destructive bg-destructive/10 p-1.5 rounded border border-destructive/20 mt-1 break-all">
                     {{ message }}
                   </div>
                 }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 <div class="space-y-1">
                    <label class="text-[10px] font-medium text-muted-foreground uppercase">
                      {{ protocol() === 'mqtt' ? 'Topic' : 'Path' }}
                    </label>
                    <input
                      hlmInput
                      type="text"
                      class="h-7 text-xs font-mono"
                      [placeholder]="protocol() === 'mqtt' ? 'Topic' : '/path'"
                      [ngModel]="socketPath()"
                      (ngModelChange)="socketPath.set($event)"
                    />
                 </div>
                 <div class="space-y-1">
                    <label class="text-[10px] font-medium text-muted-foreground uppercase">
                      {{ protocol() === 'mqtt' ? 'Pub Topic' : 'Event' }}
                    </label>
                    <input
                      hlmInput
                      type="text"
                      class="h-7 text-xs font-mono"
                      [placeholder]="protocol() === 'mqtt' ? 'Publish topic' : 'Event name'"
                      [ngModel]="eventName()"
                      (ngModelChange)="eventName.set($event)"
                    />
                 </div>
              </div>
            </div>

            <!-- Message Composer -->
            <div class="flex-1 flex flex-col rounded-lg border bg-background shadow-sm overflow-hidden min-h-[200px] shrink-0">
              <div class="px-3 py-2 border-b bg-muted/20 flex items-center justify-between shrink-0">
                <h2 class="text-xs font-semibold flex items-center gap-1.5">
                  <ng-icon name="lucideSend" class="text-muted-foreground" size="12"></ng-icon>
                  Message
                </h2>
                <button hlmBtn size="sm" variant="ghost" class="h-5 px-1.5 text-[10px]" (click)="loadSample()">
                  Sample
                </button>
              </div>
              
              <div class="flex-1 p-0 relative min-h-0">
                <textarea
                  class="w-full h-full resize-none bg-transparent p-3 font-mono text-xs focus:outline-none focus:ring-0"
                  [placeholder]="messagePlaceholder()"
                  [ngModel]="outgoingMessage()"
                  (ngModelChange)="outgoingMessage.set($event)"
                ></textarea>
              </div>

              <div class="p-2 border-t bg-muted/10 shrink-0">
                <button
                  hlmBtn
                  [disabled]="!canSend()"
                  class="w-full h-8 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs"
                  (click)="sendMessage()"
                >
                  {{ sendButtonLabel() }} <ng-icon name="lucideSend" size="12"></ng-icon>
                </button>
              </div>
            </div>
          </aside>

          <!-- Main Content / Events Log -->
          <main class="flex flex-col h-full overflow-hidden rounded-lg border bg-background shadow-sm min-h-[300px] md:order-last order-first">
            <div class="px-3 py-2 border-b bg-muted/20 flex items-center justify-between shrink-0">
               <div class="flex items-center gap-2">
                 <h2 class="text-xs font-semibold flex items-center gap-1.5">
                   <ng-icon name="lucideHistory" class="text-muted-foreground" size="12"></ng-icon>
                   Event Stream
                 </h2>
                 <span class="px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground border">
                   {{ events().length }}
                 </span>
                 
                 <!-- Status Indicator moved here -->
                 <div class="ml-2 flex items-center gap-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                    <span class="relative flex h-1.5 w-1.5">
                      <span *ngIf="connected()" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-1.5 w-1.5" [class.bg-emerald-500]="connected()" [class.bg-destructive]="!connected()"></span>
                    </span>
                    <span [class.text-emerald-600]="connected()" [class.text-muted-foreground]="!connected()">{{ statusText() }}</span>
                  </div>
               </div>
               
               <button hlmBtn size="sm" variant="ghost" class="h-6 px-1.5 text-[10px] hover:text-destructive hover:bg-destructive/10 gap-1" (click)="clearEvents()">
                 <ng-icon name="lucideTrash2" size="12"></ng-icon> Clear
               </button>
            </div>

            <div class="flex-1 overflow-y-auto p-0 scroll-smooth bg-background min-h-0">
               @if (events().length === 0) {
                  <div class="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center opacity-60">
                    <ng-icon name="lucidePlug" size="32" class="mb-3 opacity-20"></ng-icon>
                    <p class="text-xs">No events captured yet.</p>
                    <p class="text-[10px] mt-1">Connect to a server to start monitoring.</p>
                  </div>
               } @else {
                 <div class="flex flex-col divide-y divide-border/50">
                   @for (event of events(); track event.id) {
                     <div class="group px-3 py-2 hover:bg-muted/40 transition-colors text-xs font-mono border-l-2"
                          [class.border-l-blue-500]="event.direction === 'sent'"
                          [class.border-l-emerald-500]="event.direction === 'received'"
                          [class.border-l-muted-foreground]="event.direction === 'system'"
                     >
                       <div class="flex items-center justify-between mb-1 opacity-80 group-hover:opacity-100">
                         <span class="uppercase font-bold tracking-wider text-[9px]" 
                           [class.text-blue-600]="event.direction === 'sent'" 
                           [class.text-emerald-600]="event.direction === 'received'"
                           [class.text-muted-foreground]="event.direction === 'system'"
                         >
                           {{ event.direction }}
                         </span>
                         <span class="text-muted-foreground text-[9px]">{{ event.time }}</span>
                       </div>
                       <pre class="whitespace-pre-wrap break-all text-foreground/90 leading-relaxed">{{ event.payload }}</pre>
                     </div>
                   }
                 </div>
               }
            </div>
          </main>

        </div>
      </div>
    </section>
  `,
  host: {
    class: "block h-full",
  },
})
export default class RealtimeComponent implements OnDestroy {
  readonly websocketMessagePlaceholder =
    '{"message":"hello from reqquest"}';
  readonly mqttMessagePlaceholder =
    '{"topic":"reqquest/topic","message":"hello"}';

  readonly protocol = signal<"websocket" | "sse" | "socketio" | "mqtt">(
    "websocket",
  );
  readonly socketUrl = signal("wss://echo.websocket.events");
  readonly socketPath = signal("/");
  readonly eventName = signal("message");
  readonly statusText = signal("Disconnected");
  readonly outgoingMessage = signal('{"message":"hello from reqquest"}');
  readonly connected = signal(false);
  readonly error = signal<string | null>(null);
  readonly messagePlaceholder = computed(() =>
    this.protocol() === "mqtt"
      ? this.mqttMessagePlaceholder
      : this.websocketMessagePlaceholder,
  );
  readonly canSend = computed(
    () => this.protocol() === "websocket" && this.connected(),
  );
  readonly sendButtonLabel = computed(() =>
    this.protocol() === "sse" ? "Receive Only" : "Send Message",
  );
  readonly events = signal<
    Array<{
      id: number;
      direction: "sent" | "received" | "system";
      payload: string;
      time: string;
    }>
  >([]);

  private ws: WebSocket | null = null;
  private sse: EventSource | null = null;
  private nextId = 1;

  setProtocol(protocol: "websocket" | "sse" | "socketio" | "mqtt"): void {
    if (this.protocol() === protocol) {
      return;
    }

    this.disconnect();
    this.protocol.set(protocol);
    this.error.set(null);
    this.statusText.set("Disconnected");
  }

  connect(): void {
    const environmentVariables = getActiveEnvironmentVariables(
      loadWorkspaceSettings(),
    );
    const baseUrl = applyEnvironmentVariables(
      this.socketUrl().trim(),
      environmentVariables,
    );
    const path = applyEnvironmentVariables(
      this.socketPath().trim(),
      environmentVariables,
    );
    const eventName = applyEnvironmentVariables(
      this.eventName().trim(),
      environmentVariables,
    );

    const unresolved = findUnresolvedEnvironmentVariables(
      `${baseUrl}\n${path}\n${eventName}`,
    );
    if (unresolved.length > 0) {
      this.error.set(`Unresolved variables: ${unresolved.join(", ")}`);
      return;
    }

    if (!baseUrl) {
      this.error.set("Connection URL is required.");
      return;
    }

    this.disconnect();
    this.error.set(null);
    this.statusText.set("Connecting...");

    if (this.protocol() === "websocket") {
      const websocketUrl = this.buildWebSocketUrl(baseUrl, path);
      if (!/^wss?:\/\//i.test(websocketUrl)) {
        this.error.set("WebSocket URL must start with ws:// or wss://");
        this.statusText.set("Disconnected");
        return;
      }

      this.connectWebSocket(websocketUrl);
      return;
    }

    if (this.protocol() === "sse") {
      const sseUrl = this.buildSseUrl(baseUrl, path);
      if (!/^https?:\/\//i.test(sseUrl)) {
        this.error.set("SSE URL must start with http:// or https://");
        this.statusText.set("Disconnected");
        return;
      }

      this.connectSse(sseUrl, eventName);
      return;
    }

    this.error.set(
      `${this.protocol().toUpperCase()} transport is not implemented yet.`,
    );
    this.statusText.set("Idle");
  }

  private connectWebSocket(url: string): void {

    try {
      this.ws = new WebSocket(url);
    } catch (error) {
      this.error.set(String(error));
      this.statusText.set("Connection failed");
      return;
    }

    this.ws.onopen = () => {
      this.connected.set(true);
      this.statusText.set("Connected");
      this.pushEvent("system", "Connected");
    };

    this.ws.onmessage = (event) => {
      this.pushEvent("received", String(event.data));
    };

    this.ws.onerror = () => {
      this.error.set("Socket error.");
      this.statusText.set("Socket error");
    };

    this.ws.onclose = () => {
      this.connected.set(false);
      this.statusText.set("Disconnected");
      this.pushEvent("system", "Disconnected");
      this.ws = null;
    };
  }

  private connectSse(url: string, eventName: string): void {
    try {
      this.sse = new EventSource(url);
    } catch (error) {
      this.error.set(String(error));
      this.statusText.set("Connection failed");
      return;
    }

    this.sse.onopen = () => {
      this.connected.set(true);
      this.statusText.set("Connected");
      this.pushEvent("system", "Connected");
    };

    this.sse.onmessage = (event) => {
      this.pushEvent("received", String(event.data));
    };

    if (eventName && eventName !== "message") {
      this.sse.addEventListener(eventName, (event: Event) => {
        const customEvent = event as MessageEvent;
        this.pushEvent("received", String(customEvent.data));
      });
    }

    this.sse.onerror = () => {
      const isClosed = this.sse?.readyState === EventSource.CLOSED;
      this.connected.set(false);
      this.statusText.set(isClosed ? "Disconnected" : "Reconnecting...");
      if (isClosed) {
        this.pushEvent("system", "Disconnected");
      }
    };
  }

  disconnect(): void {
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected.set(false);
    this.statusText.set("Disconnected");
  }

  sendMessage(): void {
    if (this.protocol() === "sse") {
      this.error.set("SSE is receive-only and cannot send messages.");
      return;
    }

    if (this.protocol() !== "websocket") {
      this.error.set(
        `Send action is available when protocol is WebSocket. Current: ${this.protocol()}.`,
      );
      return;
    }

    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.error.set("Connect to websocket first.");
      return;
    }

    const payload = applyEnvironmentVariables(
      this.outgoingMessage(),
      getActiveEnvironmentVariables(loadWorkspaceSettings()),
    );
    const unresolved = findUnresolvedEnvironmentVariables(payload);
    if (unresolved.length > 0) {
      this.error.set(`Unresolved variables in payload: ${unresolved.join(", ")}`);
      return;
    }

    ws.send(payload);
    this.pushEvent("sent", payload);
  }

  clearEvents(): void {
    this.events.set([]);
  }

  loadSample(): void {
    this.outgoingMessage.set(
      JSON.stringify(
        {
          event: this.eventName(),
          path: this.socketPath(),
          timestamp: new Date().toISOString(),
          source: "reqquest",
        },
        null,
        2,
      ),
    );
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private pushEvent(
    direction: "sent" | "received" | "system",
    payload: string,
  ): void {
    this.events.update((current) => [
      {
        id: this.nextId++,
        direction,
        payload,
        time: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);
  }

  private buildWebSocketUrl(baseUrl: string, path: string): string {
    const normalizedBase = baseUrl
      .replace(/^https:\/\//i, "wss://")
      .replace(/^http:\/\//i, "ws://");
    return this.withPath(normalizedBase, path);
  }

  private buildSseUrl(baseUrl: string, path: string): string {
    const normalizedBase = baseUrl
      .replace(/^wss:\/\//i, "https://")
      .replace(/^ws:\/\//i, "http://");
    return this.withPath(normalizedBase, path);
  }

  private withPath(baseUrl: string, path: string): string {
    const trimmedPath = path.trim();
    if (!trimmedPath || trimmedPath === "/") {
      return baseUrl;
    }

    try {
      const url = new URL(baseUrl);
      url.pathname = trimmedPath.startsWith("/")
        ? trimmedPath
        : `/${trimmedPath}`;
      return url.toString();
    } catch {
      return baseUrl;
    }
  }
}
