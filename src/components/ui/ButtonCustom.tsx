import { cn } from "@lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

interface ButtonCustomProps {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  tootip?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const ButtonCustom: React.FC<ButtonCustomProps> = ({
  title,
  icon,
  onClick,
  tootip,
  disabled,
  loading,
  className,
}) => {
  return (
    <button onClick={onClick} className={cn("", className)} disabled={disabled}>
      {loading ? <Loader2 className="animate-spin mr-2" /> : null}
      {title}
      {icon}
    </button>
  );
};

export default ButtonCustom;
