export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const { isAuthenticated, initialized, restoreSession } = useAuth();

  if (!initialized.value) {
    await restoreSession();
  }

  if (!isAuthenticated.value) {
    return navigateTo("/login");
  }
});
