interface KeyValueEntry {
  key: string;
  value: string;
  enabled: boolean;
}

type AuthType = "none" | "bearer" | "basic" | "apikey";

interface TabAuth {
  type: AuthType;
  bearerToken: string;
  basicUsername: string;
  basicPassword: string;
  apiKeyKey: string;
  apiKeyValue: string;
  apiKeyIn: "header" | "query";
}

interface ScriptTestResult {
  name: string;
  passed: boolean;
  details?: string;
}

interface TabResponse {
  requestUrl: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  durationMs: number;
  sizeBytes: number;
}

interface TabError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

interface TabState {
  tabs: Tab[];
  activeTabIndex: number;
  nextTabId: number;
}

interface Tab {
  id: number;
  name: string;
  url: string;
  method: HttpMethod;
  auth: TabAuth;
  headers: KeyValueEntry[];
  params: KeyValueEntry[];
  body: string;
  preRequestScript: string;
  testScript: string;
  testResults: ScriptTestResult[];
  response: TabResponse | null;
  isLoading: boolean;
  error: TabError | null;
  updatedAt: string;
  abortController?: AbortController;
}

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "CONNECT"
  | "TRACE";

export type {
  AuthType,
  HttpMethod,
  KeyValueEntry,
  ScriptTestResult,
  Tab,
  TabAuth,
  TabError,
  TabResponse,
  TabState,
};
