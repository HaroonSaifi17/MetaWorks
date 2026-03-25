import { Injectable, computed, effect, signal } from "@angular/core";

export type RestLayoutMode = "vertical" | "horizontal";

interface UiPreferences {
  sidebarExpanded: boolean;
  darkMode: boolean;
  restLayout: RestLayoutMode;
  interceptorEnabled: boolean;
}

const UI_PREFERENCES_STORAGE_KEY = "reqquest.ui.preferences.v1";

const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const getDefaultPreferences = (): UiPreferences => ({
  sidebarExpanded: true,
  darkMode: true,
  restLayout: "vertical",
  interceptorEnabled: false,
});

const sanitizePreferences = (
  value: Partial<UiPreferences> | null | undefined,
): UiPreferences => {
  const defaults = getDefaultPreferences();

  return {
    sidebarExpanded:
      typeof value?.sidebarExpanded === "boolean"
        ? value.sidebarExpanded
        : defaults.sidebarExpanded,
    darkMode:
      typeof value?.darkMode === "boolean" ? value.darkMode : defaults.darkMode,
    restLayout:
      value?.restLayout === "horizontal" || value?.restLayout === "vertical"
        ? value.restLayout
        : defaults.restLayout,
    interceptorEnabled:
      typeof value?.interceptorEnabled === "boolean"
        ? value.interceptorEnabled
        : defaults.interceptorEnabled,
  };
};

const loadPreferences = (): UiPreferences => {
  if (!isBrowser) {
    return getDefaultPreferences();
  }

  try {
    const rawValue = localStorage.getItem(UI_PREFERENCES_STORAGE_KEY);
    if (!rawValue) {
      return getDefaultPreferences();
    }

    return sanitizePreferences(JSON.parse(rawValue));
  } catch {
    return getDefaultPreferences();
  }
};

export const loadUiPreferencesSnapshot = (): UiPreferences => loadPreferences();

@Injectable({
  providedIn: "root",
})
export class UiPreferencesService {
  private readonly state = signal<UiPreferences>(loadPreferences());

  readonly sidebarExpanded = computed(() => this.state().sidebarExpanded);
  readonly darkMode = computed(() => this.state().darkMode);
  readonly restLayout = computed(() => this.state().restLayout);
  readonly interceptorEnabled = computed(() => this.state().interceptorEnabled);

  constructor() {
    effect(() => {
      const current = this.state();

      if (isBrowser) {
        localStorage.setItem(
          UI_PREFERENCES_STORAGE_KEY,
          JSON.stringify(current),
        );
      }

      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", current.darkMode);
        document.documentElement.dataset["theme"] = current.darkMode
          ? "dark"
          : "light";
        document.documentElement.style.colorScheme = current.darkMode
          ? "dark"
          : "light";
      }
    });
  }

  setSidebarExpanded(value: boolean): void {
    this.patchState({ sidebarExpanded: value });
  }

  toggleSidebarExpanded(): void {
    this.patchState({ sidebarExpanded: !this.sidebarExpanded() });
  }

  setDarkMode(value: boolean): void {
    this.patchState({ darkMode: value });
  }

  toggleDarkMode(): void {
    this.patchState({ darkMode: !this.darkMode() });
  }

  setRestLayout(value: RestLayoutMode): void {
    this.patchState({ restLayout: value });
  }

  toggleRestLayout(): void {
    this.patchState({
      restLayout: this.restLayout() === "vertical" ? "horizontal" : "vertical",
    });
  }

  setInterceptorEnabled(value: boolean): void {
    this.patchState({ interceptorEnabled: value });
  }

  toggleInterceptorEnabled(): void {
    this.patchState({ interceptorEnabled: !this.interceptorEnabled() });
  }

  private patchState(patch: Partial<UiPreferences>): void {
    this.state.update((current) => ({ ...current, ...patch }));
  }
}
