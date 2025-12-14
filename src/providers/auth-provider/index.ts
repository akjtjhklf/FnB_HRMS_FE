// Re-export auth providers
export { authProviderClient } from "./auth-provider.client";
export { authProviderServer } from "./auth-provider.server";

// For convenience, export a common authProvider (client version for browser usage)
export { authProviderClient as authProvider } from "./auth-provider.client";
