export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const {
    initialized,
    restoreSession,
    isAuthenticated,
    hasRole,
    getRoleHomeRoute,
  } = useAuth();

  if (!initialized.value) {
    await restoreSession();
  }

  if (!isAuthenticated.value) {
    return navigateTo("/login");
  }

  if (!hasRole(["LGU", "Administrator"])) {
    return navigateTo(getRoleHomeRoute());
  }
});
