import React from "react";
import * as AntdIcons from "@ant-design/icons";
import { cn } from "@/lib/utils";

export interface IconProps {
  name: keyof typeof AntdIcons;
  className?: string;
  size?: number;
  spin?: boolean;
  [key: string]: any;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className, 
  size, 
  spin,
  ...props 
}) => {
  const IconComponent = AntdIcons[name] as any;
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Ant Design icons`);
    return null;
  }

  return (
    <IconComponent
      className={cn(className)}
      style={{ fontSize: size }}
      spin={spin}
      {...props}
    />
  );
};
