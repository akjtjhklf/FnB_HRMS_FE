import { Popover, Button, Space } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { ReactNode, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const visibleActions = actions.filter((action) => !action.hidden);

  if (visibleActions.length === 0) {
    return null;
  }

  const handleActionClick = (action: ActionItem) => {
    setOpen(false);
    action.onClick();
  };

  const content = (
    <div className="flex flex-col gap-1" style={{ minWidth: 120 }}>
      {visibleActions.map((action) => (
        <Button
          key={action.key}
          type="text"
          icon={action.icon}
          onClick={() => handleActionClick(action)}
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
      placement="bottomRight"
      overlayClassName="action-popover"
      open={open}
      onOpenChange={setOpen}
      align={{
        targetOffset: [0, 0],
        offset: [-8, 4],
      }}
    >
      <Button
        type="text"
        icon={<MoreOutlined />}
        className="hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      />
    </Popover>
  );
};
