import { useGetIdentity } from "@refinedev/core";
import { UserIdentity } from "@/types/auth";
import React from "react";

interface AccessControlProps {
    allowedRoles: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const AccessControl: React.FC<AccessControlProps> = ({
    allowedRoles,
    children,
    fallback = null
}) => {
    const { data: user, isLoading } = useGetIdentity<UserIdentity>();

    if (isLoading) {
        return null; // Or a loading spinner if preferred
    }

    const userRole = user?.role?.name;

    if (!userRole || !allowedRoles.includes(userRole)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
