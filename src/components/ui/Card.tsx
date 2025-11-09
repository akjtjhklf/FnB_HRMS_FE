import React from "react";
import { Card as AntCard, CardProps as AntCardProps } from "antd";
import { cn } from "@/lib/utils";

export interface CardProps extends AntCardProps {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  className,
  hover = false,
  children,
  ...props 
}) => {
  return (
    <AntCard
      className={cn(
        "transition-all duration-200",
        hover && "hover:shadow-lg hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </AntCard>
  );
};
