import { Employee } from "./employee";

// Recipient types
export type RecipientType = "all" | "individual" | "group";

// Notification types
export interface Notification {
  id: string;
  title: string;
  body?: string | null;
  level?: "info" | "warning" | "error" | null;
  recipient_type: RecipientType;
  recipient_ids?: string[] | null; // Array of employee IDs or role IDs
  recipients?: Employee[] | null; // Populated employees
  sent_by?: string | null; // User ID who sent the notification
  sent_at?: string | null;
  created_at?: string | null;
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
