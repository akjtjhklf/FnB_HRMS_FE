import { authProvider } from "@providers";
import { AccessControlProvider } from "@refinedev/core";
import { UserIdentity } from "@types";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    try {
      const user = await authProvider.getIdentity?.() as UserIdentity | undefined;

      // Admin has full access
      if (user?.is_admin || user?.role?.name === 'Administrator') {
        return { can: true };
      }

      // Restrict access to permissions resource
      if (resource === "permissions" || resource === "roles" || resource === "policies") {
        return {
          can: false,
          reason: "Chỉ quản trị viên mới có quyền truy cập",
        };
      }

      // Default allow for other resources (or implement granular checks here)
      // For now, we assume other resources are handled by backend or other logic
      return { can: true };
    } catch (error) {
      // On error, allow access (backend will handle authorization)
      return { can: true };
    }
  },
};
