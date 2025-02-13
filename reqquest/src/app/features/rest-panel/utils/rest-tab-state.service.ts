import { HttpClient, HttpResponse } from "@angular/common/http";
import { computed, effect, inject, Injectable, signal } from "@angular/core";
import {
  catchError,
  EMPTY,
  from,
  Subject,
  switchMap,
  tap,
  throwError,
} from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: "root",
})
export class RestTabStateService {
  http = inject(HttpClient);

  constructor() {
    if (typeof localStorage !== "undefined") {
      const tabState = localStorage.getItem("tabState");
      if (tabState) {
        this.state.set(JSON.parse(tabState) as TabState);
      }
    }

    effect(() => {
      if (typeof localStorage !== "undefined") {
        const withoutresponse = {
          ...this.state(),
          tabs: this.state().tabs.map((tab) => {
            const tabCopy = { ...tab };
            tabCopy.response = null;
            return tabCopy;
          }),
        };
        localStorage.setItem("tabState", JSON.stringify(withoutresponse));
      }
    });

    this.requestTriggerSubject
      .pipe(
        tap(() =>
          this.state.update((state) => ({ ...state, isLoading: true })),
        ),
        switchMap(() =>
          from(
            fetch(this.activeTab().url, { method: this.activeTab().method }),
          ).pipe(
            switchMap((response) =>
              response.ok
                ? from(response.json())
                : throwError(() => new Error("Network response was not ok")),
            ),
            catchError((error) => {
              this.state.update((state) => ({
                ...state,
                isLoading: false,
                error: error.message,
              }));
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (data: any) => {
          const tabs = this.tabs();
          tabs[this.activeTabIndex()].response = data;
          this.state.set({
            activeTabIndex: this.activeTabIndex(),
            tabs,
            isLoading: false,
            error: null,
          });
        },
      });
  }

  private state = signal<TabState>({
    activeTabIndex: 0,
    tabs: [this.newTab(0), this.newTab(1)],
    isLoading: false,
    error: null,
  });

  activeTabIndex = computed(() => this.state().activeTabIndex);
  tabs = computed(() => this.state().tabs);
  activeTab = computed(() => this.state().tabs[this.state().activeTabIndex]);
  response = computed(
    () => this.state().tabs[this.state().activeTabIndex].response,
  );
  error = computed(() => this.state().error);
  isLoading = computed(() => this.state().isLoading);

  requestTriggerSubject = new Subject<null>();
  tabChangeSubject = new Subject<null>();

  submitRequest() {
    this.requestTriggerSubject.next(null);
  }

  setActiveTab(index: number) {
    if (index >= 0 && index < this.tabs().length) {
      this.state.update((state) => ({ ...state, activeTabIndex: index }));
      this.tabChangeSubject.next(null);
    }
  }

  addTab() {
    this.state.update((state) => ({
      ...state,
      tabs: [...state.tabs, this.newTab(state.tabs.length)],
    }));
    this.setActiveTab(this.tabs().length - 1);
  }

  deleteTab(index: number) {
    if (this.tabs().length <= 1) {
      return;
    }

    this.state.update((state) => {
      const newTabs = state.tabs.filter((_, i) => i !== index);
      const newActiveTabIndex =
        index === state.activeTabIndex
          ? Math.max(0, index - 1)
          : index < state.activeTabIndex
            ? state.activeTabIndex - 1
            : state.activeTabIndex;

      return {
        ...state,
        tabs: newTabs,
        activeTabIndex: newActiveTabIndex,
      };
    });
    this.tabChangeSubject.next(null);
  }

  modifyTab(data: { name?: string; url?: string; method?: RequestMethod }) {
    this.state.update((state) => {
      const tabs = [...state.tabs];
      const currentTab = { ...tabs[state.activeTabIndex] };

      if (data.name) currentTab.name = data.name;
      if (data.url) currentTab.url = data.url;
      if (data.method) currentTab.method = data.method;

      tabs[state.activeTabIndex] = currentTab;
      return { ...state, tabs };
    });
  }

  methodColor(method: RequestMethod): string {
    switch (method) {
      case "GET":
        return "text-green-400";
      case "POST":
        return "text-blue-400";
      case "PUT":
        return "text-yellow-400";
      case "DELETE":
        return "text-red-400";
      case "PATCH":
        return "text-purple-400";
      case "OPTIONS":
        return "text-orange-400";
      case "HEAD":
        return "text-pink-400";
      case "CONNECT":
        return "text-amber-600";
      case "TRACE":
        return "text-gray-400";
      default:
        return "text-white";
    }
  }
  private newTab(index: number): Tab {
    return {
      id: index,
      name: "Untitled",
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "GET",
      response: null,
    };
  }
}

interface TabState {
  activeTabIndex: number;
  tabs: Tab[];
  isLoading: boolean;
  error: string | null;
}

interface Tab {
  id: number;
  name: string;
  url: string;
  method: RequestMethod;
  response: HttpResponse<any> | null;
}

export type RequestMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "CONNECT"
  | "TRACE";
