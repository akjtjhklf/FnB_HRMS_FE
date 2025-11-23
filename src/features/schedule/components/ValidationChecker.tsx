/**
 * ValidationChecker Component
 * Kiểm tra validation trước khi publish schedule
 */

import { useEffect } from "react";
import { Button, Alert, Spin, Space, List, Tag } from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useScheduleValidation } from "@/hooks/useScheduleWorkflow";

interface ValidationCheckerProps {
  scheduleId: string;
  onValidated: () => void;
  onCancel?: () => void;
}

export function ValidationChecker({ scheduleId, onValidated, onCancel }: ValidationCheckerProps) {
  const { validation, isLoading, canPublish, errors, warnings } = useScheduleValidation(scheduleId);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <p className="mt-4 text-gray-600">Đang kiểm tra lịch...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      {canPublish ? (
        <Alert
          message="Lịch hợp lệ"
          description="Lịch tuần này đã sẵn sàng để công bố. Nhân viên sẽ có thể đăng ký ca sau khi công bố."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      ) : (
        <Alert
          message="Lịch chưa hợp lệ"
          description="Vui lòng kiểm tra và sửa các lỗi bên dưới trước khi công bố."
          type="error"
          showIcon
          icon={<CloseCircleOutlined />}
        />
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div>
          <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
            <CloseCircleOutlined />
            Lỗi cần sửa ({errors.length})
          </h4>
          <List
            size="small"
            bordered
            dataSource={errors}
            renderItem={(error) => (
              <List.Item>
                <Tag color="error">LỖI</Tag>
                {error}
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div>
          <h4 className="font-medium text-yellow-600 mb-2 flex items-center gap-2">
            <WarningOutlined />
            Cảnh báo ({warnings.length})
          </h4>
          <List
            size="small"
            bordered
            dataSource={warnings}
            renderItem={(warning) => (
              <List.Item>
                <Tag color="warning">CẢNH BÁO</Tag>
                {warning}
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Summary */}
      {validation && validation.totalShifts > 0 && (
        <Alert
          message="Tổng quan"
          description={
            <Space direction="vertical">
              <div>✅ Tổng số ca làm việc: <strong>{validation.totalShifts}</strong></div>
              {validation.warnings.length === 0 && validation.errors.length === 0 && (
                <div style={{ color: "#52c41a" }}>✓ Tất cả các ca đã có yêu cầu vị trí</div>
              )}
            </Space>
          }
          type="info"
        />
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
        <Button onClick={() => onCancel?.()}>Hủy</Button>
        <Button
          type="primary"
          disabled={!canPublish}
          onClick={onValidated}
          icon={<CheckCircleOutlined />}
        >
          Xác nhận công bố
        </Button>
      </div>
    </div>
  );
}
