import { Employee } from "./employee";

// Recipient types
export type RecipientType = "ALL" | "SPECIFIC";

// Notification types
export interface Notification {
  id: string;
  title: string;
  body?: string | null;
  message?: string | null; // Alias for body (backend compatibility)
  level?: "info" | "warning" | "error" | "success" | null;
  recipient_type: RecipientType;
  recipient_ids?: string[] | null; // Array of employee IDs or role IDs
  recipients?: Employee[] | null; // Populated employees
  sent_by?: string | null; // User ID who sent the notification
  sent_at?: string | null;
  is_read?: boolean;
  read_at?: string | null;
  link?: string | null; // Optional link to related resource
  action_url?: string | null; // Alias for link (backend compatibility)
  metadata?: Record<string, any> | null; // Additional data
  created_at: string;
  updated_at?: string | null;
}

export interface CreateNotificationDto {
  title: string;
  body?: string | null;
  level?: "info" | "warning" | "error";
  recipient_type: RecipientType;
  recipient_ids?: string[] | null;
  sent_by?: string | null;
}

export interface UpdateNotificationDto extends Partial<CreateNotificationDto> {}
