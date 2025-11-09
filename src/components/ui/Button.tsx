import React from "react";
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import { cn } from "@/lib/utils";

export interface ButtonProps extends Omit<AntButtonProps, "variant"> {
  customVariant?: "primary" | "secondary" | "ghost" | "text" | "link" | "default";
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  customVariant = "default",
  type,
  ...props 
}) => {
  // Map customVariant to Ant Design type
  const antType = customVariant === "secondary" ? "default" : customVariant === "ghost" ? "dashed" : type;
  
  return (
    <AntButton
      type={antType}
      className={cn(
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  );
};
