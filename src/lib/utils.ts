import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a consistent color based on a string (like name)
 * This ensures the same color is generated on both server and client (no hydration error)
 */
export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a pleasant color (avoiding too dark or too light)
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = 45 + (Math.abs(hash >> 8) % 15); // 45-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Format phone number for display
 * Example: 0901234567 -> 090 123 4567
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format Vietnamese phone numbers (10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  // Format with country code (+84)
  if (cleaned.length === 11 && cleaned.startsWith("84")) {
    return `+84 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  // Return as-is if doesn't match expected format
  return phone;
};

/**
 * Format date for display
 * Example: 2024-01-15 -> 15/01/2024
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return "-";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if valid date
  if (isNaN(d.getTime())) return "-";
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};
