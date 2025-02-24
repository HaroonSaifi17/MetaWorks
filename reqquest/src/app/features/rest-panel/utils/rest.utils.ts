import { HttpMethod, Header, TabState } from "./rest.interface";

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

function calculateNewActiveIndex(state: TabState, deletedIndex: number): number {
  if (deletedIndex === state.activeTabIndex) {
    return Math.max(0, deletedIndex - 1);
  }

  if (deletedIndex < state.activeTabIndex) {
    return state.activeTabIndex - 1;
  }

  return state.activeTabIndex;
}

function convertHeadersToObject(headers?: Header[]): Record<string, string> {
  if (!headers || !Array.isArray(headers)) {
    console.warn("Expected headers to be an array, received:", headers);
    return {};
  }

  return headers.reduce<Record<string, string>>((acc, header) => {
    if (header && header.key) {
      acc[header.key] = header.value ?? "";
    }
    return acc;
  }, {});
}

export { convertHeadersToObject, calculateNewActiveIndex, methodColor };

