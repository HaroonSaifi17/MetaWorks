import { computed, effect } from "@angular/core";
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import axios, { AxiosError } from "axios";
import {
  AuthType,
  HttpMethod,
  KeyValueEntry,
  ScriptTestResult,
  Tab,
  TabAuth,
  TabError,
  TabResponse,
  TabState,
} from "./rest.interface";
import {
  applyEnvironmentVariables,
  buildUrlWithParams,
  calculateNewActiveIndex,
  convertEntriesToObject,
  estimatePayloadSize,
  findUnresolvedEnvironmentVariables,
  methodColor,
  parseJsonBody,
  serializeErrorDetails,
} from "./rest.utils";
import {
  getActiveEnvironmentVariables,
  loadWorkspaceSettings,
} from "../../../core/workspace-settings";
import { loadUiPreferencesSnapshot } from "../../../core/ui-preferences.service";

const DEFAULT_API_URL = "https://jsonplaceholder.typicode.com/todos/1";
const LOCAL_STORAGE_KEY = "reqquest.tabs.v2";
const DEFAULT_REQUEST_TIMEOUT = 30000;

const defaultEntry = (): KeyValueEntry => ({
  key: "",
  value: "",
  enabled: true,
});

const defaultAuth = (): TabAuth => ({
  type: "none",
  bearerToken: "",
  basicUsername: "",
  basicPassword: "",
  apiKeyKey: "X-API-Key",
  apiKeyValue: "",
  apiKeyIn: "header",
});

const encodeBase64 = (value: string): string => {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  const table =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes = new TextEncoder().encode(value);
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];

    const chunk = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);

    output += table[(chunk >> 18) & 63];
    output += table[(chunk >> 12) & 63];
    output += second == null ? "=" : table[(chunk >> 6) & 63];
    output += third == null ? "=" : table[chunk & 63];
  }

  return output;
};

const sanitizeAuth = (auth: Partial<TabAuth> | undefined): TabAuth => ({
  type:
    auth?.type === "bearer" ||
    auth?.type === "basic" ||
    auth?.type === "apikey" ||
    auth?.type === "none"
      ? auth.type
      : "none",
  bearerToken: auth?.bearerToken ?? "",
  basicUsername: auth?.basicUsername ?? "",
  basicPassword: auth?.basicPassword ?? "",
  apiKeyKey: auth?.apiKeyKey || "X-API-Key",
  apiKeyValue: auth?.apiKeyValue ?? "",
  apiKeyIn: auth?.apiKeyIn === "query" ? "query" : "header",
});

const runPreRequestScript = (
  script: string,
  context: {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    params: KeyValueEntry[];
    body: string;
    variables: Record<string, string>;
  },
): {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  params: KeyValueEntry[];
  body: string;
  scriptError: string | null;
} => {
  if (!script.trim()) {
    return {
      url: context.url,
      method: context.method,
      headers: context.headers,
      params: context.params,
      body: context.body,
      scriptError: null,
    };
  }

  const runtime = {
    url: context.url,
    method: context.method,
    headers: { ...context.headers },
    params: [...context.params],
    body: context.body,
  };

  const pw = {
    env: {
      get: (key: string) => context.variables[key] ?? null,
      set: (_key: string, _value: string) => undefined,
    },
    request: {
      setUrl: (url: string) => {
        runtime.url = String(url);
      },
      setMethod: (method: HttpMethod) => {
        runtime.method = method;
      },
      setHeader: (key: string, value: string) => {
        runtime.headers[String(key)] = String(value);
      },
      setParam: (key: string, value: string) => {
        runtime.params = [
          ...runtime.params.filter((entry) => entry.key !== key),
          { key, value, enabled: true },
        ];
      },
      setBody: (body: string) => {
        runtime.body = String(body);
      },
    },
  };

  try {
    const execute = new Function("pw", script);
    execute(pw);

    return {
      url: runtime.url,
      method: runtime.method,
      headers: runtime.headers,
      params: runtime.params,
      body: runtime.body,
      scriptError: null,
    };
  } catch (error) {
    return {
      url: context.url,
      method: context.method,
      headers: context.headers,
      params: context.params,
      body: context.body,
      scriptError: String(error),
    };
  }
};

const runTests = (
  script: string,
  context: {
    status: number;
    headers: Record<string, string>;
    data: unknown;
    durationMs: number;
    variables: Record<string, string>;
  },
): { results: ScriptTestResult[]; scriptError: string | null } => {
  if (!script.trim()) {
    return { results: [], scriptError: null };
  }

  const results: ScriptTestResult[] = [];

  const expectImpl = (value: unknown) => {
    const api = {
      toBe: (expected: unknown) => {
        if (value !== expected) {
          throw new Error(
            `Expected ${String(value)} to be ${String(expected)}`,
          );
        }
      },
      toBeType: (expectedType: string) => {
        if (typeof value !== expectedType) {
          throw new Error(
            `Expected type ${expectedType} but got ${typeof value}`,
          );
        }
      },
      toInclude: (entry: unknown) => {
        if (typeof value === "string") {
          if (!value.includes(String(entry))) {
            throw new Error(`Expected string to include ${String(entry)}`);
          }
          return;
        }

        if (Array.isArray(value)) {
          if (!value.includes(entry)) {
            throw new Error(`Expected array to include ${String(entry)}`);
          }
          return;
        }

        throw new Error("toInclude supports only string and array values");
      },
      toBeLevel2xx: () => {
        const code = Number(value);
        if (code < 200 || code > 299) {
          throw new Error(`Expected ${code} to be in 2xx range`);
        }
      },
      toBeLevel3xx: () => {
        const code = Number(value);
        if (code < 300 || code > 399) {
          throw new Error(`Expected ${code} to be in 3xx range`);
        }
      },
      toBeLevel4xx: () => {
        const code = Number(value);
        if (code < 400 || code > 499) {
          throw new Error(`Expected ${code} to be in 4xx range`);
        }
      },
      toBeLevel5xx: () => {
        const code = Number(value);
        if (code < 500 || code > 599) {
          throw new Error(`Expected ${code} to be in 5xx range`);
        }
      },
    };

    return {
      ...api,
      not: {
        toBe: (expected: unknown) => {
          if (value === expected) {
            throw new Error(
              `Expected ${String(value)} not to be ${String(expected)}`,
            );
          }
        },
      },
    };
  };

  const pw = {
    env: {
      get: (key: string) => context.variables[key] ?? null,
      set: (_key: string, _value: string) => undefined,
    },
    response: {
      status: context.status,
      headers: context.headers,
      body: context.data,
      responseTime: context.durationMs,
    },
    expect: expectImpl,
    test: (name: string, callback: () => void) => {
      try {
        callback();
        results.push({ name, passed: true });
      } catch (error) {
        results.push({ name, passed: false, details: String(error) });
      }
    },
  };

  try {
    const execute = new Function("pw", script);
    execute(pw);
    return { results, scriptError: null };
  } catch (error) {
    return { results, scriptError: String(error) };
  }
};

const defaultTab = (id: number): Tab => ({
  id,
  name: `Request ${id + 1}`,
  url: DEFAULT_API_URL,
  method: "GET",
  auth: defaultAuth(),
  headers: [defaultEntry()],
  params: [defaultEntry()],
  body: "",
  preRequestScript: "",
  testScript: "",
  testResults: [],
  response: null,
  isLoading: false,
  error: null,
  updatedAt: new Date().toISOString(),
});

const initialState: TabState = {
  tabs: [defaultTab(0)],
  activeTabIndex: 0,
  nextTabId: 1,
};

const sanitizeEntries = (
  entries: KeyValueEntry[] | undefined,
): KeyValueEntry[] => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [defaultEntry()];
  }

  return entries.map((entry) => ({
    key: entry?.key ?? "",
    value: entry?.value ?? "",
    enabled: entry?.enabled ?? true,
  }));
};

const sanitizeTab = (tab: Partial<Tab>, fallbackId: number): Tab => ({
  id: typeof tab.id === "number" ? tab.id : fallbackId,
  name: tab.name || `Request ${fallbackId + 1}`,
  url: tab.url || DEFAULT_API_URL,
  method: (tab.method as HttpMethod) || "GET",
  auth: sanitizeAuth(tab.auth),
  headers: sanitizeEntries(tab.headers),
  params: sanitizeEntries(tab.params),
  body: tab.body || "",
  preRequestScript: tab.preRequestScript || "",
  testScript: tab.testScript || "",
  testResults: Array.isArray(tab.testResults)
    ? tab.testResults.map((entry) => ({
        name: entry?.name || "Test",
        passed: Boolean(entry?.passed),
        details: entry?.details,
      }))
    : [],
  response: sanitizeResponse(tab.response, tab.url || DEFAULT_API_URL),
  isLoading: false,
  error: null,
  updatedAt: tab.updatedAt || new Date().toISOString(),
});

const sanitizeResponse = (
  response: TabResponse | null | undefined,
  fallbackUrl: string,
): TabResponse | null => {
  if (!response) {
    return null;
  }

  return {
    requestUrl:
      typeof response.requestUrl === "string" && response.requestUrl
        ? response.requestUrl
        : fallbackUrl,
    status: Number(response.status) || 0,
    statusText: response.statusText || "",
    headers: response.headers || {},
    data: response.data,
    durationMs: Number(response.durationMs) || 0,
    sizeBytes: Number(response.sizeBytes) || 0,
  };
};

const sanitizeState = (state: Partial<TabState>): TabState => {
  const tabs = (state.tabs || []).map((tab, index) => sanitizeTab(tab, index));
  const normalizedTabs = tabs.length > 0 ? tabs : [defaultTab(0)];
  const activeTabIndex = Math.min(
    Math.max(state.activeTabIndex ?? 0, 0),
    normalizedTabs.length - 1,
  );

  const highestId = normalizedTabs.reduce(
    (acc, tab) => Math.max(acc, tab.id),
    0,
  );

  return {
    tabs: normalizedTabs,
    activeTabIndex,
    nextTabId: Math.max(state.nextTabId ?? highestId + 1, highestId + 1),
  };
};

const nowIso = () => new Date().toISOString();

const getRequestTimeout = (): number => {
  try {
    return loadWorkspaceSettings().requestTimeoutMs;
  } catch {
    return DEFAULT_REQUEST_TIMEOUT;
  }
};

export const RestTabStore = signalStore(
  { providedIn: "root" },
  withState<TabState>(initialState),
  withComputed(({ tabs, activeTabIndex }) => ({
    activeTab: computed(() => tabs()[activeTabIndex()]),
    tabCount: computed(() => tabs().length),
  })),
  withMethods((store) => ({
    addTab: () => {
      patchState(store, (state) => {
        const nextTab = defaultTab(state.nextTabId);
        return {
          ...state,
          tabs: [...state.tabs, nextTab],
          activeTabIndex: state.tabs.length,
          nextTabId: state.nextTabId + 1,
        };
      });
    },

    deleteTab: (indexToDelete: number) => {
      const state = getState(store);
      if (state.tabs.length <= 1) {
        return;
      }

      patchState(store, (currentState) => {
        const removedTab = currentState.tabs[indexToDelete];
        removedTab?.abortController?.abort();

        const tabs = currentState.tabs.filter(
          (_, index) => index !== indexToDelete,
        );
        return {
          ...currentState,
          tabs,
          activeTabIndex: calculateNewActiveIndex(currentState, indexToDelete),
        };
      });
    },

    duplicateTab: (indexToDuplicate: number) => {
      patchState(store, (state) => {
        const source = state.tabs[indexToDuplicate];
        if (!source) {
          return state;
        }

        const copy: Tab = {
          ...source,
          id: state.nextTabId,
          name: `${source.name} Copy`,
          isLoading: false,
          error: null,
          abortController: undefined,
          updatedAt: nowIso(),
          headers: source.headers.map((entry) => ({ ...entry })),
          params: source.params.map((entry) => ({ ...entry })),
        };

        const insertIndex = indexToDuplicate + 1;
        const tabs = [...state.tabs];
        tabs.splice(insertIndex, 0, copy);

        return {
          ...state,
          tabs,
          activeTabIndex: insertIndex,
          nextTabId: state.nextTabId + 1,
        };
      });
    },

    setActiveTab: (index: number) => {
      const state = getState(store);
      if (index < 0 || index >= state.tabs.length) {
        return;
      }

      patchState(store, { activeTabIndex: index });
    },

    renameTab: (name: string) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        tabs[state.activeTabIndex] = {
          ...activeTab,
          name: name.trim() || `Request ${activeTab.id + 1}`,
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    updateTab: (updates: Partial<Pick<Tab, "url" | "method" | "body">>) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        tabs[state.activeTabIndex] = {
          ...tabs[state.activeTabIndex],
          ...updates,
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    updateTabAuth: (updates: Partial<TabAuth>) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];

        tabs[state.activeTabIndex] = {
          ...activeTab,
          auth: {
            ...activeTab.auth,
            ...updates,
          },
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    updatePreRequestScript: (script: string) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        tabs[state.activeTabIndex] = {
          ...activeTab,
          preRequestScript: script,
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    updateTestScript: (script: string) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        tabs[state.activeTabIndex] = {
          ...activeTab,
          testScript: script,
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    addHeader: (entry?: Partial<KeyValueEntry>) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        const newHeader = { ...defaultEntry(), ...entry };
        tabs[state.activeTabIndex] = {
          ...activeTab,
          headers: [...activeTab.headers, newHeader],
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    updateHeader: (headerIndex: number, updates: Partial<KeyValueEntry>) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        const headers = [...activeTab.headers];
        headers[headerIndex] = {
          ...headers[headerIndex],
          ...updates,
        };

        tabs[state.activeTabIndex] = {
          ...activeTab,
          headers,
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    removeHeader: (headerIndex: number) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        const headers = activeTab.headers.filter(
          (_, index) => index !== headerIndex,
        );

        tabs[state.activeTabIndex] = {
          ...activeTab,
          headers: headers.length > 0 ? headers : [defaultEntry()],
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    addParam: (entry?: Partial<KeyValueEntry>) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        const newParam = { ...defaultEntry(), ...entry };
        tabs[state.activeTabIndex] = {
          ...activeTab,
          params: [...activeTab.params, newParam],
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    addParams: (entries: Partial<KeyValueEntry>[]) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        const newParams = entries.map((e) => ({ ...defaultEntry(), ...e }));
        tabs[state.activeTabIndex] = {
          ...activeTab,
          params: [...activeTab.params, ...newParams],
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    updateParam: (paramIndex: number, updates: Partial<KeyValueEntry>) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        const params = [...activeTab.params];
        params[paramIndex] = {
          ...params[paramIndex],
          ...updates,
        };

        tabs[state.activeTabIndex] = {
          ...activeTab,
          params,
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    removeParam: (paramIndex: number) => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        const params = activeTab.params.filter(
          (_, index) => index !== paramIndex,
        );

        tabs[state.activeTabIndex] = {
          ...activeTab,
          params: params.length > 0 ? params : [defaultEntry()],
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    resetActiveTabRequest: () => {
      patchState(store, (state) => {
        const tabs = [...state.tabs];
        const activeTab = tabs[state.activeTabIndex];
        if (!activeTab) {
          return state;
        }

        tabs[state.activeTabIndex] = {
          ...activeTab,
          method: "GET",
          url: "",
          body: "",
          auth: defaultAuth(),
          headers: [defaultEntry()],
          params: [defaultEntry()],
          preRequestScript: "",
          testScript: "",
          testResults: [],
          response: null,
          error: null,
          isLoading: false,
          abortController: undefined,
          updatedAt: nowIso(),
        };

        return { ...state, tabs };
      });
    },

    cancelRequest: (tabIndex: number) => {
      const state = getState(store);
      const tab = state.tabs[tabIndex];

      if (!tab?.isLoading || !tab.abortController) {
        return;
      }

      tab.abortController.abort();

      patchState(store, (currentState) => ({
        ...currentState,
        tabs: currentState.tabs.map((currentTab, index) =>
          index === tabIndex
            ? {
                ...currentTab,
                isLoading: false,
                abortController: undefined,
              }
            : currentTab,
        ),
      }));
    },

    makeRequest: async () => {
      const state = getState(store);
      const tabIndex = state.activeTabIndex;
      const tab = state.tabs[tabIndex];

      if (!tab) {
        return;
      }

      if (tab.isLoading && tab.abortController) {
        tab.abortController.abort();
      }

      const abortController = new AbortController();
      patchState(store, (currentState) => ({
        ...currentState,
        tabs: currentState.tabs.map((currentTab, index) =>
          index === tabIndex
            ? {
                ...currentTab,
                isLoading: true,
                error: null,
                abortController,
              }
            : currentTab,
        ),
      }));

      const workspaceSettings = loadWorkspaceSettings();
      const environmentVariables =
        getActiveEnvironmentVariables(workspaceSettings);
      const uiPreferences = loadUiPreferencesSnapshot();

      let requestUrlWithEnvironment = "";
      let requestHeaders: Record<string, string> = {};
      let requestParams: KeyValueEntry[] = [];
      let requestBody: unknown;
      let requestMethod = tab.method;

      const canSendBody = tab.method !== "GET" && tab.method !== "HEAD";

      try {
        const resolvedUrl = applyEnvironmentVariables(
          tab.url,
          environmentVariables,
        );
        const resolvedParams = tab.params.map((param) => ({
          ...param,
          key: applyEnvironmentVariables(param.key, environmentVariables),
          value: applyEnvironmentVariables(param.value, environmentVariables),
        }));

        requestHeaders = Object.entries(
          convertEntriesToObject(tab.headers),
        ).reduce<Record<string, string>>((acc, [key, value]) => {
          const resolvedKey = applyEnvironmentVariables(
            key,
            environmentVariables,
          ).trim();
          if (!resolvedKey) {
            return acc;
          }

          acc[resolvedKey] = applyEnvironmentVariables(
            value,
            environmentVariables,
          );
          return acc;
        }, {});

        const resolvedAuth = {
          ...tab.auth,
          bearerToken: applyEnvironmentVariables(
            tab.auth.bearerToken,
            environmentVariables,
          ),
          basicUsername: applyEnvironmentVariables(
            tab.auth.basicUsername,
            environmentVariables,
          ),
          basicPassword: applyEnvironmentVariables(
            tab.auth.basicPassword,
            environmentVariables,
          ),
          apiKeyKey: applyEnvironmentVariables(
            tab.auth.apiKeyKey,
            environmentVariables,
          ),
          apiKeyValue: applyEnvironmentVariables(
            tab.auth.apiKeyValue,
            environmentVariables,
          ),
        };

        if (resolvedAuth.type === "bearer") {
          if (resolvedAuth.bearerToken.trim()) {
            requestHeaders["Authorization"] =
              `Bearer ${resolvedAuth.bearerToken.trim()}`;
          }
        } else if (resolvedAuth.type === "basic") {
          const username = resolvedAuth.basicUsername;
          const password = resolvedAuth.basicPassword;
          requestHeaders["Authorization"] =
            `Basic ${encodeBase64(`${username}:${password}`)}`;
        } else if (resolvedAuth.type === "apikey") {
          const key = resolvedAuth.apiKeyKey.trim();
          if (key) {
            if (resolvedAuth.apiKeyIn === "query") {
              resolvedParams.push({
                key,
                value: resolvedAuth.apiKeyValue,
                enabled: true,
              });
            } else {
              requestHeaders[key] = resolvedAuth.apiKeyValue;
            }
          }
        }

        const preScriptOutput = runPreRequestScript(tab.preRequestScript, {
          url: resolvedUrl,
          method: tab.method,
          headers: requestHeaders,
          params: resolvedParams,
          body: canSendBody
            ? applyEnvironmentVariables(tab.body, environmentVariables)
            : "",
          variables: environmentVariables,
        });

        if (preScriptOutput.scriptError) {
          throw new Error(
            `Pre-request script error: ${preScriptOutput.scriptError}`,
          );
        }

        requestHeaders = preScriptOutput.headers;
        requestParams = preScriptOutput.params;
        requestMethod = preScriptOutput.method;

        const canSendScriptBody =
          requestMethod !== "GET" && requestMethod !== "HEAD";
        const resolvedBody = canSendScriptBody ? preScriptOutput.body : "";

        const unresolvedVariables = new Set<string>([
          ...findUnresolvedEnvironmentVariables(resolvedUrl),
          ...requestParams.flatMap((param) =>
            findUnresolvedEnvironmentVariables(`${param.key} ${param.value}`),
          ),
          ...Object.keys(requestHeaders).flatMap((key) =>
            findUnresolvedEnvironmentVariables(key),
          ),
          ...Object.values(requestHeaders).flatMap((value) =>
            findUnresolvedEnvironmentVariables(value),
          ),
          ...findUnresolvedEnvironmentVariables(resolvedBody),
        ]);

        if (unresolvedVariables.size > 0) {
          patchState(store, (currentState) => ({
            ...currentState,
            tabs: currentState.tabs.map((currentTab, index) =>
              index === tabIndex
                ? {
                    ...currentTab,
                    isLoading: false,
                    abortController: undefined,
                    error: {
                      name: "EnvironmentVariableError",
                      message: `Unresolved variables: ${[...unresolvedVariables].join(", ")}`,
                    },
                  }
                : currentTab,
            ),
          }));
          return;
        }

        requestUrlWithEnvironment = buildUrlWithParams(
          preScriptOutput.url,
          requestParams,
        );
        requestBody = canSendScriptBody
          ? parseJsonBody(resolvedBody)
          : undefined;
      } catch (error) {
        const message =
          error instanceof SyntaxError
            ? "Request body must be valid JSON."
            : String(error).includes("Invalid URL")
              ? "Request URL is invalid."
              : "Request configuration is invalid.";

        patchState(store, (currentState) => ({
          ...currentState,
          tabs: currentState.tabs.map((currentTab, index) =>
            index === tabIndex
              ? {
                  ...currentTab,
                  isLoading: false,
                  abortController: undefined,
                  error: {
                    name: "RequestPreparationError",
                    message,
                  },
                }
              : currentTab,
          ),
        }));
        return;
      }

      const startsAt = performance.now();

      if (
        uiPreferences.interceptorEnabled &&
        requestUrlWithEnvironment.startsWith("mock://")
      ) {
        const mockUrl = new URL(requestUrlWithEnvironment);
        const status = Math.max(
          100,
          Math.min(599, Number(mockUrl.searchParams.get("__status") ?? 200)),
        );
        const durationMs = Math.max(
          1,
          Math.min(5000, Number(mockUrl.searchParams.get("__delay") ?? 80)),
        );

        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(() => resolve(), durationMs);
          abortController.signal.addEventListener(
            "abort",
            () => {
              window.clearTimeout(timer);
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        }).catch(() => undefined);

        if (abortController.signal.aborted) {
          return;
        }

        const payload = {
          mocked: true,
          method: tab.method,
          url: requestUrlWithEnvironment,
          headers: requestHeaders,
          body: requestBody,
          note: "Interceptor response from ReqQuest mock mode. Disable interceptor to send real requests.",
          timestamp: new Date().toISOString(),
        };

        patchState(store, (currentState) => ({
          ...currentState,
          tabs: currentState.tabs.map((currentTab, index) =>
            index === tabIndex
              ? {
                  ...currentTab,
                  response: {
                    requestUrl: requestUrlWithEnvironment,
                    status,
                    statusText: status === 200 ? "OK" : "MOCKED",
                    headers: {
                      "content-type": "application/json",
                      "x-reqquest-interceptor": "enabled",
                    },
                    data: payload,
                    durationMs,
                    sizeBytes: estimatePayloadSize(payload),
                  },
                  isLoading: false,
                  error: null,
                  testResults: [],
                  abortController: undefined,
                  updatedAt: nowIso(),
                }
              : currentTab,
          ),
        }));
        return;
      }

      try {
        const response = await axios({
          url: requestUrlWithEnvironment,
          method: tab.method,
          headers: requestHeaders,
          data: requestBody,
          timeout: getRequestTimeout(),
          signal: abortController.signal,
          validateStatus: () => true,
        });

        const durationMs = Math.round(performance.now() - startsAt);
        const responseHeaders = Object.fromEntries(
          Object.entries(response.headers ?? {}).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(", ") : String(value),
          ]),
        );

        const testExecution = runTests(tab.testScript, {
          status: response.status,
          headers: responseHeaders,
          data: response.data,
          durationMs,
          variables: environmentVariables,
        });

        const runtimeError = testExecution.scriptError
          ? {
              name: "TestScriptError",
              message: testExecution.scriptError,
            }
          : null;

        patchState(store, (currentState) => ({
          ...currentState,
          tabs: currentState.tabs.map((currentTab, index) =>
            index === tabIndex
              ? {
                  ...currentTab,
                  response: {
                    requestUrl: requestUrlWithEnvironment,
                    status: response.status,
                    statusText: response.statusText,
                    headers: responseHeaders,
                    data: response.data,
                    durationMs,
                    sizeBytes: estimatePayloadSize(response.data),
                  },
                  isLoading: false,
                  error: runtimeError,
                  testResults: testExecution.results,
                  abortController: undefined,
                  updatedAt: nowIso(),
                }
              : currentTab,
          ),
        }));
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const axiosError = error as AxiosError;
        const tabError: TabError = {
          name: axiosError.name,
          message: axiosError.message,
          code: axiosError.code,
          status: axiosError.response?.status,
          details: serializeErrorDetails(axiosError.response?.data),
        };

        patchState(store, (currentState) => ({
          ...currentState,
          tabs: currentState.tabs.map((currentTab, index) =>
            index === tabIndex
              ? {
                  ...currentTab,
                  response: null,
                  isLoading: false,
                  error: tabError,
                  testResults: [],
                  abortController: undefined,
                  updatedAt: nowIso(),
                }
              : currentTab,
          ),
        }));
      }
    },
  })),
  withHooks({
    onInit(store) {
      if (typeof localStorage === "undefined") {
        return;
      }

      const persistedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (persistedState) {
        try {
          const parsed = JSON.parse(persistedState) as Partial<TabState>;
          patchState(store, sanitizeState(parsed));
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }

      effect(() => {
        const state = getState(store);
        const stateForStorage: TabState = {
          ...state,
          tabs: state.tabs.map((tab) => ({
            ...tab,
            isLoading: false,
            error: null,
            abortController: undefined,
          })),
        };

        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(stateForStorage),
        );
      });
    },
  }),
);

export { methodColor };
