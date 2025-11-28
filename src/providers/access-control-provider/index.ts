import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "../auth-provider";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = await authProvider.getIdentity();

    // Admin has full access
    if (user?.is_admin) {
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
  },
};
