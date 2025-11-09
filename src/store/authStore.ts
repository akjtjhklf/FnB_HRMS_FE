import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Role, Permission, Policy } from "@/types";

interface AuthState {
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  policies: Policy[];
  token: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setRoles: (roles: Role[]) => void;
  setPermissions: (permissions: Permission[]) => void;
  setPolicies: (policies: Policy[]) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  
  // RBAC helper methods
  hasRole: (roleName: string) => boolean;
  hasPermission: (action: string, collection: string) => boolean;
  hasPolicy: (policyName: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      permissions: [],
      policies: [],
      token: null,

      setUser: (user) => set({ user }),
      
      setRoles: (roles) => set({ roles }),
      
      setPermissions: (permissions) => set({ permissions }),
      
      setPolicies: (policies) => set({ policies }),
      
      setToken: (token) => set({ token }),
      
      logout: () => 
        set({ 
          user: null, 
          roles: [], 
          permissions: [], 
          policies: [],
          token: null 
        }),

      // Check if user has a specific role
      hasRole: (roleName: string) => {
        const { roles } = get();
        return roles.some((role) => role.name === roleName);
      },

      // Check if user has a specific permission
      hasPermission: (action: string, collection: string) => {
        const { permissions } = get();
        return permissions.some(
          (perm) => perm.action === action && perm.collection === collection
        );
      },

      // Check if user has a specific policy
      hasPolicy: (policyName: string) => {
        const { policies } = get();
        return policies.some((policy) => policy.name === policyName);
      },

      // Generic access control check
      canAccess: (resource: string, action: string) => {
        const { permissions, roles } = get();
        
        // Admin role has full access
        if (roles.some((role) => role.name === "admin" || role.name === "Administrator")) {
          return true;
        }

        // Check direct permissions
        return permissions.some(
          (perm) => 
            perm.collection === resource && 
            (perm.action === action || perm.action === "*")
        );
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
