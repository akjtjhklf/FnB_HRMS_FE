import { format, parseISO, isValid } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Format date string to Vietnamese format
 */
export const formatDate = (date: string | Date, formatStr: string = "dd/MM/yyyy"): string => {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";
    
    return format(dateObj, formatStr, { locale: vi });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, "dd/MM/yyyy HH:mm");
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date): string => {
  return formatDate(date, "HH:mm");
};

/**
 * Format date for input field (yyyy-MM-dd)
 */
export const formatDateForInput = (date: string | Date): string => {
  return formatDate(date, "yyyy-MM-dd");
};

/**
 * Get current date in yyyy-MM-dd format
 */
export const getCurrentDate = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return dateObj < new Date();
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: string | Date): number => {
  const birthDate = typeof dateOfBirth === "string" ? parseISO(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get day of week in Vietnamese
 */
export const getDayOfWeek = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "EEEE", { locale: vi });
};
