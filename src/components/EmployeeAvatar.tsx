"use client";

import React from "react";
import { Avatar, AvatarProps } from "antd";
import { generateColorFromString } from "@/lib/utils";

interface EmployeeAvatarProps extends Omit<AvatarProps, "style"> {
  name?: string | null;
  photoUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A consistent Avatar component for employees
 * - Shows photo if available
 * - Falls back to colored initials based on name
 */
export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  name,
  photoUrl,
  firstName,
  lastName,
  size = 40,
  className,
  style,
  ...props
}) => {
  // Get display name
  const displayName = name || `${firstName || ""} ${lastName || ""}`.trim() || "User";
  
  // Get initials
  const getInitials = (): string => {
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (displayName && displayName !== "User") {
      const parts = displayName.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return displayName[0].toUpperCase();
    }
    return "?";
  };

  // Get background color
  const backgroundColor = generateColorFromString(displayName);

  // If we have a valid photo URL, use it
  if (photoUrl) {
    return (
      <Avatar
        src={photoUrl}
        size={size}
        className={className}
        style={style}
        {...props}
      >
        {getInitials()}
      </Avatar>
    );
  }

  // Otherwise show colored initials
  return (
    <Avatar
      size={size}
      className={className}
      style={{
        backgroundColor,
        color: "#fff",
        fontWeight: 600,
        ...style,
      }}
      {...props}
    >
      {getInitials()}
    </Avatar>
  );
};

export default EmployeeAvatar;
