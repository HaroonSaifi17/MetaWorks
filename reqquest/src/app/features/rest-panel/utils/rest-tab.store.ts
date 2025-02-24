import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { computed, effect } from "@angular/core";
import axios, { AxiosError } from "axios";
import { HttpMethod, Tab, TabState } from "./rest.interface";
import { calculateNewActiveIndex, convertHeadersToObject } from "./rest.utils";

const DEFAULT_API_URL = "https://jsonplaceholder.typicode.com/todos/1";
const LOCAL_STORAGE_KEY = "tabState";
const REQUEST_TIMEOUT = 30000;

const createDefaultTab = (index: number): Tab => ({
  id: index,
  name: "Untitled",
  url: DEFAULT_API_URL,
  method: "GET",
  headers: [],
  body: "",
  response: null,
  isLoading: false,
  error: null,
});

const initialState: TabState = {
  tabs: [createDefaultTab(0)],
  activeTabIndex: 0,
};

export const RestTabStore = signalStore(
  { providedIn: "root" },
  withState<TabState>(initialState),
  withComputed(({tabs,activeTabIndex}) => ({
    activeTab: computed(() => {
      return tabs()[activeTabIndex()];
    }),
  })),
  withMethods((store) => ({
    addTab: () => {
      patchState(store, (state) => ({
        tabs: [...state.tabs, createDefaultTab(state.tabs.length)],
        activeTabIndex: state.tabs.length,
      }));
      const state = getState(store);
      console.log(state);
    },

    deleteTab: (indexToDelete: number) => {
      patchState(store, (state) => {
        const updatedTabs = state.tabs.filter(
          (_, index) => index !== indexToDelete,
        );
        const newActiveIndex = calculateNewActiveIndex(state, indexToDelete);

        return {
          tabs: updatedTabs,
          activeTabIndex: newActiveIndex,
        };
      });
    },

    setActiveTab: (index: number) => {
      const state = getState(store);
      if (index >= 0 && index < state.tabs.length) {
        patchState(store, { activeTabIndex: index });
      }
    },

    updateTab: (updates: {
      name?: string;
      url?: string;
      method?: HttpMethod;
    }) => {
      patchState(store, (state) => {
        const updatedTabs = [...state.tabs];
        const currentTabIndex = state.activeTabIndex;

        updatedTabs[currentTabIndex] = {
          ...updatedTabs[currentTabIndex],
          ...updates,
        };

        return {
          ...state,
          tabs: updatedTabs,
        };
      });
    },

    async makeRequest() {
      const state = getState(store);
      const tab = state.tabs[state.activeTabIndex];

      if (tab.isLoading) {
        tab.cancelToken?.cancel("Request cancelled due to new request");
      }

      const cancelToken = axios.CancelToken.source();
      const headers = convertHeadersToObject(tab.headers);

      patchState(store, (state) => ({
        tabs: state.tabs.map((t, i) =>
          i === state.activeTabIndex
            ? { ...t, isLoading: true, error: null, cancelToken }
            : t,
        ),
      }));

      try {
        const response = await axios({
          url: tab.url,
          method: tab.method,
          headers,
          data: tab.method !== "GET" ? JSON.parse(tab.body || "{}") : undefined,
          timeout: REQUEST_TIMEOUT,
          cancelToken: cancelToken.token,
          validateStatus: null,
        });

        patchState(store, (state) => ({
          tabs: state.tabs.map((t, i) =>
            i === state.activeTabIndex
              ? {
                  ...t,
                  response: {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    data: response.data,
                  },
                  isLoading: false,
                  error: null,
                  cancelToken: undefined,
                }
              : t,
          ),
        }));
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        const axiosError = error as AxiosError;
        patchState(store, (state) => ({
          tabs: state.tabs.map((t, i) =>
            i === state.activeTabIndex
              ? {
                  ...t,
                  response: null,
                  isLoading: false,
                  error: {
                    name: axiosError.name,
                    message: axiosError.message,
                    code: axiosError.code,
                    stack: axiosError.stack,
                  },
                  cancelToken: undefined,
                }
              : t,
          ),
        }));
      }
    },

    cancelRequest(tabIndex: number) {
      const state = getState(store);
      const tab = state.tabs[tabIndex];

      if (tab.isLoading && tab.cancelToken) {
        tab.cancelToken.cancel("Request cancelled by user");
        patchState(store, (state) => ({
          tabs: state.tabs.map((t, i) =>
            i === tabIndex
              ? {
                  ...t,
                  isLoading: false,
                  cancelToken: undefined,
                }
              : t,
          ),
        }));
      }
    },
  })),
  withHooks({
    onInit(store) {
      if (typeof localStorage !== "undefined") {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
          patchState(store, JSON.parse(savedState) as TabState);
        }
        effect(() => {
          const stateForStorage = {
            ...getState(store),
            tabs: getState(store).tabs.map((tab) => ({
              ...tab,
              response: null,
              isLoading: false,
              error: null,
              cancelToken: undefined,
            })),
          };

          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(stateForStorage),
          );
        });
      }
    },
  }),
);
