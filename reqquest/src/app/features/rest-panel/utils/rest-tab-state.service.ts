import { computed, effect, Injectable, signal } from "@angular/core";

interface TabSate {
  activeTab: number;
  tabs: Tab[];
  isLoading: boolean;
  error: string | null;
}

interface Tab {
  id: string;
  name: string;
  url: string;
  method: RequestMethod;
  response?: any;
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

@Injectable({
  providedIn: "root",
})
export class RestTabStateService {
  constructor() {
    if (typeof localStorage !== "undefined") {
      const tabState = localStorage.getItem("tabSate");
      if (tabState) {
        this.state.set(JSON.parse(tabState));
      }
    }

    effect(() => {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("tabSate", JSON.stringify(this.state()));
      }
    });
  }

  private state = signal<TabSate>({
    isLoading: false,
    activeTab: 0,
    tabs: [
      {
        id: "0",
        name: "Untitled",
        url: "https://jsonplaceholder.typicode.com/todos/1",
        method: "GET",
      },
      {
        id: "1",
        name: "Untitled",
        url: "https://jsonplaceholder.typicode.com/todos/1",
        method: "GET",
      },
    ],
    error: null,
  });

  isLoading = computed(() => this.state().isLoading);
  activeTab = computed(() => this.state().activeTab);
  tabs = computed(() => this.state().tabs);
  error = computed(() => this.state().error);

  setActiveTab(index: number) {
    this.state.set({ ...this.state(), activeTab: index });
  }

  addTab() {
    const tabs = this.state().tabs;
    const newTab: Tab = {
      id: tabs.length.toString(),
      name: "Untitled",
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "GET",
    };
    this.state.set({ ...this.state(), tabs: [...tabs, newTab] });
    this.setActiveTab(tabs.length);
  }

  deleteTab(index: number) {
    const tabs = this.state().tabs;
    const newTabs = tabs.filter((_, i) => i !== index);
    this.state.set({ ...this.state(), tabs: newTabs });
    if (index === this.state().activeTab) {
      this.setActiveTab(index - 1);
    }
  }

  modifyTab(data: { name?: string; url?: string; method?: RequestMethod }) {
    const tabs = this.state().tabs;
    tabs[this.state().activeTab].name =
      data.name || tabs[this.state().activeTab].name;
    tabs[this.state().activeTab].url =
      data.url || tabs[this.state().activeTab].url;
    tabs[this.state().activeTab].method =
      data.method || tabs[this.state().activeTab].method;
    this.state.set({ ...this.state(), tabs });
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
}
