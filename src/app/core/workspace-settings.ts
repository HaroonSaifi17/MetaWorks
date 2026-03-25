export interface WorkspaceEntry {
  key: string;
  value: string;
  enabled: boolean;
}

export interface WorkspaceEnvironment {
  id: number;
  name: string;
  variables: WorkspaceEntry[];
}

export interface WorkspaceSettings {
  requestTimeoutMs: number;
  activeEnvironmentId: number | null;
  environments: WorkspaceEnvironment[];
}

export const WORKSPACE_SETTINGS_STORAGE_KEY = "reqquest.workspace.settings.v1";

const DEFAULT_TIMEOUT_MS = 30000;

const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const createDefaultEnvironment = (): WorkspaceEnvironment => ({
  id: 1,
  name: "Local",
  variables: [
    {
      key: "BASE_URL",
      value: "https://jsonplaceholder.typicode.com",
      enabled: true,
    },
  ],
});

export const createDefaultWorkspaceSettings = (): WorkspaceSettings => ({
  requestTimeoutMs: DEFAULT_TIMEOUT_MS,
  activeEnvironmentId: 1,
  environments: [createDefaultEnvironment()],
});

export const sanitizeWorkspaceSettings = (
  value: Partial<WorkspaceSettings> | null | undefined,
): WorkspaceSettings => {
  const defaults = createDefaultWorkspaceSettings();

  const mappedEnvironments =
    value?.environments?.map((environment, index) => ({
      id: typeof environment?.id === "number" ? environment.id : index + 1,
      name: environment?.name?.trim() || `Environment ${index + 1}`,
      variables:
        environment?.variables?.map((entry) => ({
          key: entry?.key ?? "",
          value: entry?.value ?? "",
          enabled: entry?.enabled ?? true,
        })) ?? [],
    })) ?? [];

  const environments =
    mappedEnvironments.length > 0 ? mappedEnvironments : defaults.environments;

  const activeEnvironmentId =
    typeof value?.activeEnvironmentId === "number"
      ? value.activeEnvironmentId
      : defaults.activeEnvironmentId;

  const hasActiveEnvironment = environments.some(
    (environment) => environment.id === activeEnvironmentId,
  );

  return {
    requestTimeoutMs:
      typeof value?.requestTimeoutMs === "number" &&
      Number.isFinite(value.requestTimeoutMs)
        ? Math.max(1000, Math.min(120000, Math.round(value.requestTimeoutMs)))
        : defaults.requestTimeoutMs,
    activeEnvironmentId:
      hasActiveEnvironment || environments.length === 0
        ? activeEnvironmentId
        : environments[0].id,
    environments,
  };
};

export const loadWorkspaceSettings = (): WorkspaceSettings => {
  if (!isBrowser) {
    return createDefaultWorkspaceSettings();
  }

  try {
    const rawValue = localStorage.getItem(WORKSPACE_SETTINGS_STORAGE_KEY);
    if (!rawValue) {
      return createDefaultWorkspaceSettings();
    }

    return sanitizeWorkspaceSettings(JSON.parse(rawValue));
  } catch {
    return createDefaultWorkspaceSettings();
  }
};

export const saveWorkspaceSettings = (settings: WorkspaceSettings): void => {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(
    WORKSPACE_SETTINGS_STORAGE_KEY,
    JSON.stringify(sanitizeWorkspaceSettings(settings)),
  );
};

export const getActiveEnvironmentVariables = (
  settings: WorkspaceSettings,
): Record<string, string> => {
  if (!settings.activeEnvironmentId) {
    return {};
  }

  const activeEnvironment = settings.environments.find(
    (environment) => environment.id === settings.activeEnvironmentId,
  );

  if (!activeEnvironment) {
    return {};
  }

  return activeEnvironment.variables.reduce<Record<string, string>>(
    (acc, variable) => {
      if (!variable.enabled) {
        return acc;
      }

      const key = variable.key.trim();
      if (!key) {
        return acc;
      }

      acc[key] = variable.value;
      return acc;
    },
    {},
  );
};
