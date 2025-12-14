/**
 * Format currency to Vietnamese Dong
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

/**
 * Format phone number (Vietnamese format)
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format as: 0xxx xxx xxx or 0xxx xxxx xxxx
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{3})/, "$1 $2 $3");
  }
  
  return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convert to title case
 */
export const toTitleCase = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return "";
  
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Generate random color
 */
export const generateRandomColor = (): string => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: "green",
    inactive: "gray",
    pending: "yellow",
    approved: "blue",
    rejected: "red",
    cancelled: "orange",
    completed: "green",
    draft: "gray",
    published: "green",
  };
  
  return statusColors[status.toLowerCase()] || "gray";
};

/**
 * Format time from ISO string to HH:mm format
 */
export const formatTime = (isoString: string): string => {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  
  return `${hours}:${minutes}`;
};
