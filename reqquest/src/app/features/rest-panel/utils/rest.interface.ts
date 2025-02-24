import { CancelTokenSource } from "axios";

interface TabState {
  tabs: Tab[];
  activeTabIndex: number;
}

interface Tab {
  id: number;
  name: string;
  url: string;
  method: HttpMethod;
  headers: Header[];
  body: string;
  response: unknown | null;
  isLoading: boolean;
  error: Error | null;
  cancelToken?: CancelTokenSource;
}

interface Header {
  key: string;
  value: string;
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

export { TabState, Tab, Header, HttpMethod };
