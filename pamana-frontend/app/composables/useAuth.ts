import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  PamanaRole,
} from "~/types/auth";

import { PAMANA_ROLES, ROLE_HOME_ROUTES } from "~/utils/constants";

export const useAuth = () => {
  const { apiFetch } = useApi();

  /*
   * ---------------------------------------------------------
   * GLOBAL AUTH STATE
   * ---------------------------------------------------------
   */

  const user = useState<AuthUser | null>("auth-user", () => null);

  const token = useState<string | null>("auth-token", () => null);

  const loading = useState<boolean>("auth-loading", () => false);

  const initialized = useState<boolean>("auth-initialized", () => false);

  /*
   * ---------------------------------------------------------
   * COMPUTED VALUES
   * ---------------------------------------------------------
   */

  const role = computed(() => {
    return user.value?.role?.name ?? null;
  });

  const isAuthenticated = computed(() => {
    return Boolean(token.value && user.value);
  });

  const isPassenger = computed(() => {
    return role.value === PAMANA_ROLES.PASSENGER;
  });

  const isDriver = computed(() => {
    return role.value === PAMANA_ROLES.DRIVER;
  });

  const isLGU = computed(() => {
    return role.value === PAMANA_ROLES.LGU;
  });

  const isAdministrator = computed(() => {
    return role.value === PAMANA_ROLES.ADMINISTRATOR;
  });

  /*
   * ---------------------------------------------------------
   * LOCAL STORAGE
   * ---------------------------------------------------------
   */

  const saveToken = (jwt: string) => {
    token.value = jwt;

    if (import.meta.client) {
      localStorage.setItem("pamana_token", jwt);
    }
  };

  const removeStoredAuth = () => {
    token.value = null;
    user.value = null;

    if (import.meta.client) {
      localStorage.removeItem("pamana_token");
    }
  };

  /*
   * ---------------------------------------------------------
   * GET CURRENT USER
   * ---------------------------------------------------------
   */

  const fetchMe = async () => {
    if (!token.value) {
      return null;
    }

    try {
      const currentUser = await apiFetch<AuthUser>(
        "/api/users/me?populate=role",
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
      );

      user.value = currentUser;

      return currentUser;
    } catch (error) {
      removeStoredAuth();

      throw error;
    }
  };

  /*
   * ---------------------------------------------------------
   * LOGIN
   * ---------------------------------------------------------
   */

  const login = async (credentials: LoginCredentials) => {
    loading.value = true;

    try {
      const response = await apiFetch<LoginResponse>("/api/auth/local", {
        method: "POST",

        body: {
          identifier: credentials.identifier,

          password: credentials.password,
        },
      });

      saveToken(response.jwt);

      await fetchMe();

      return user.value;
    } catch (error) {
      removeStoredAuth();

      throw error;
    } finally {
      loading.value = false;
    }
  };

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  const logout = async () => {
    removeStoredAuth();

    await navigateTo("/login");
  };

  /*
   * ---------------------------------------------------------
   * RESTORE SESSION
   * ---------------------------------------------------------
   */

  const restoreSession = async () => {
    if (initialized.value) {
      return;
    }

    initialized.value = true;

    if (!import.meta.client) {
      return;
    }

    const savedToken = localStorage.getItem("pamana_token");

    if (!savedToken) {
      return;
    }

    token.value = savedToken;

    try {
      await fetchMe();
    } catch {
      removeStoredAuth();
    }
  };

  /*
   * ---------------------------------------------------------
   * ROLE CHECK
   * ---------------------------------------------------------
   */

  const hasRole = (allowedRoles: PamanaRole | PamanaRole[]) => {
    if (!role.value) {
      return false;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return roles.includes(role.value as PamanaRole);
  };

  /*
   * ---------------------------------------------------------
   * ROLE HOME ROUTE
   * ---------------------------------------------------------
   */

  const getRoleHomeRoute = () => {
    switch (role.value) {
      case PAMANA_ROLES.PASSENGER:
        return ROLE_HOME_ROUTES.Passenger;

      case PAMANA_ROLES.DRIVER:
        return ROLE_HOME_ROUTES.Driver;

      case PAMANA_ROLES.LGU:
        return ROLE_HOME_ROUTES.LGU;

      case PAMANA_ROLES.ADMINISTRATOR:
        return ROLE_HOME_ROUTES.Administrator;

      default:
        return "/";
    }
  };

  /*
   * ---------------------------------------------------------
   * REDIRECT USER BASED ON ROLE
   * ---------------------------------------------------------
   */

  const redirectByRole = async () => {
    const destination = getRoleHomeRoute();

    await navigateTo(destination);
  };

  /*
   * ---------------------------------------------------------
   * RETURN
   * ---------------------------------------------------------
   */

  return {
    user,
    token,
    role,

    loading,
    initialized,

    isAuthenticated,

    isPassenger,
    isDriver,
    isLGU,
    isAdministrator,

    login,
    logout,

    fetchMe,
    restoreSession,

    hasRole,

    getRoleHomeRoute,
    redirectByRole,
  };
};
