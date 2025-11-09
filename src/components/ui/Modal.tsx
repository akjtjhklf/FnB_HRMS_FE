import React from "react";
import { Modal as AntModal, ModalProps as AntModalProps } from "antd";
import { cn } from "@/lib/utils";

export interface ModalProps extends AntModalProps {
  animated?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  className,
  animated = true,
  ...props 
}) => {
  return (
    <AntModal
      className={cn(
        animated && "transition-all duration-300",
        className
      )}
      transitionName={animated ? "ant-zoom" : ""}
      maskTransitionName={animated ? "ant-fade" : ""}
      {...props}
    />
  );
};
