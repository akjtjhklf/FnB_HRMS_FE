import { Popover, Button, Space } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { ReactNode } from "react";

export interface ActionItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

interface ActionPopoverProps {
  actions: ActionItem[];
  trigger?: "click" | "hover";
  placement?: "bottom" | "bottomLeft" | "bottomRight" | "top" | "topLeft" | "topRight";
}

export const ActionPopover = ({
  actions,
  trigger = "click",
  placement = "bottomRight",
}: ActionPopoverProps) => {
  const visibleActions = actions.filter((action) => !action.hidden);

  if (visibleActions.length === 0) {
    return null;
  }

  const content = (
    <div className="flex flex-col gap-1" style={{ minWidth: 120 }}>
      {visibleActions.map((action) => (
        <Button
          key={action.key}
          type="text"
          icon={action.icon}
          onClick={action.onClick}
          danger={action.danger}
          disabled={action.disabled}
          className="w-full justify-start"
          style={{ textAlign: "left" }}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger={trigger}
      placement={placement}
      overlayClassName="action-popover"
    >
      <Button
        type="text"
        icon={<MoreOutlined />}
        className="hover:bg-gray-100"
      />
    </Popover>
  );
};
