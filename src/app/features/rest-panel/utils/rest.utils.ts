import { HttpMethod, KeyValueEntry, TabState } from "./rest.interface";

const ENV_VARIABLE_PATTERN = /{{\s*([A-Z0-9_]+)\s*}}/gi;

function methodColor(method: HttpMethod): string {
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

function calculateNewActiveIndex(
  state: TabState,
  deletedIndex: number,
): number {
  if (deletedIndex === state.activeTabIndex) {
    return Math.max(0, deletedIndex - 1);
  }

  if (deletedIndex < state.activeTabIndex) {
    return state.activeTabIndex - 1;
  }

  return state.activeTabIndex;
}

function convertEntriesToObject(
  entries?: KeyValueEntry[],
): Record<string, string> {
  if (!entries || !Array.isArray(entries)) {
    return {};
  }

  return entries.reduce<Record<string, string>>((acc, entry) => {
    if (!entry?.enabled) {
      return acc;
    }

    const key = entry.key.trim();
    if (key) {
      acc[key] = entry.value;
    }

    return acc;
  }, {});
}

function parseJsonBody(rawBody: string): unknown {
  const normalized = rawBody.trim();
  if (!normalized) {
    return undefined;
  }

  if (/^[\[{]/.test(normalized)) {
    return JSON.parse(normalized);
  }

  try {
    return JSON.parse(normalized);
  } catch {
    return normalized;
  }
}

function findUnresolvedEnvironmentVariables(value: string): string[] {
  if (!value.trim()) {
    return [];
  }

  const unresolved = new Set<string>();
  let match: RegExpExecArray | null;

  ENV_VARIABLE_PATTERN.lastIndex = 0;
  while ((match = ENV_VARIABLE_PATTERN.exec(value)) !== null) {
    unresolved.add(match[1]);
  }

  ENV_VARIABLE_PATTERN.lastIndex = 0;
  return [...unresolved];
}

function estimatePayloadSize(payload: unknown): number {
  if (payload == null) {
    return 0;
  }

  try {
    const text =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    return new TextEncoder().encode(text).length;
  } catch {
    return 0;
  }
}

function serializeErrorDetails(details: unknown): unknown {
  if (details == null) {
    return undefined;
  }

  if (typeof details === "string") {
    return details;
  }

  try {
    return JSON.parse(JSON.stringify(details));
  } catch {
    return String(details);
  }
}

function buildUrlWithParams(url: string, params: KeyValueEntry[]): string {
  const target = new URL(resolveRequestUrl(url));

  for (const param of params) {
    if (!param.enabled) {
      continue;
    }

    const key = param.key.trim();
    if (!key) {
      continue;
    }

    target.searchParams.set(key, param.value);
  }

  return target.toString();
}

function resolveRequestUrl(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw new TypeError("Invalid URL");
  }

  if (trimmedValue.startsWith("/")) {
    if (typeof window === "undefined") {
      throw new TypeError("Invalid URL");
    }

    return new URL(trimmedValue, window.location.origin).toString();
  }

  return new URL(trimmedValue).toString();
}

function applyEnvironmentVariables(
  value: string,
  variables: Record<string, string>,
): string {
  return value.replace(ENV_VARIABLE_PATTERN, (_segment, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(variables, key)) {
      return `{{${key}}}`;
    }

    return variables[key] ?? "";
  });
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "0 B";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  const units = ["KB", "MB", "GB"];
  let amount = value / 1024;
  let unitIndex = 0;

  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  return `${amount.toFixed(1)} ${units[unitIndex]}`;
}

function formatDuration(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return "0 ms";
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(2)} s`;
}

export {
  applyEnvironmentVariables,
  buildUrlWithParams,
  calculateNewActiveIndex,
  convertEntriesToObject,
  estimatePayloadSize,
  findUnresolvedEnvironmentVariables,
  formatBytes,
  formatDuration,
  methodColor,
  parseJsonBody,
  resolveRequestUrl,
  serializeErrorDetails,
};
