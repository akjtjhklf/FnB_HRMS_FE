export { cn } from "./cn";

// Re-export all HRMS utilities
export * from "./date-utils";
export * from "./validation-utils";

// Export format-utils explicitly to avoid conflicts
export {
  formatCurrency,
  formatNumber,
  formatPhoneNumber,
  truncateText,
  capitalizeFirst,
  toTitleCase,
  getInitials,
  formatFileSize,
  formatPercentage,
  generateRandomColor,
  getStatusColor,
} from "./format-utils";
