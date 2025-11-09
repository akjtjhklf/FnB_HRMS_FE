/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Vietnamese phone number
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Vietnamese phone number: starts with 0, followed by 9-10 digits
  const phoneRegex = /^0[0-9]{9,10}$/;
  const cleaned = phone.replace(/\D/g, "");
  return phoneRegex.test(cleaned);
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

/**
 * Validate minimum length
 */
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

/**
 * Validate maximum length
 */
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

/**
 * Validate number range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate positive number
 */
export const isPositive = (value: number): boolean => {
  return value > 0;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate date format (yyyy-MM-dd)
 */
export const isValidDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

/**
 * Validate time format (HH:mm)
 */
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

/**
 * Validation error messages
 */
export const validationMessages = {
  required: "Trường này là bắt buộc",
  email: "Email không hợp lệ",
  phone: "Số điện thoại không hợp lệ",
  minLength: (min: number) => `Tối thiểu ${min} ký tự`,
  maxLength: (max: number) => `Tối đa ${max} ký tự`,
  positive: "Giá trị phải lớn hơn 0",
  range: (min: number, max: number) => `Giá trị phải từ ${min} đến ${max}`,
  url: "URL không hợp lệ",
  date: "Định dạng ngày không hợp lệ",
  time: "Định dạng giờ không hợp lệ",
};

/**
 * Form validator helper
 */
export const createValidator = (rules: {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  positive?: boolean;
  url?: boolean;
  custom?: (value: any) => boolean;
  customMessage?: string;
}) => {
  return (value: any): string | null => {
    if (rules.required && !isRequired(value)) {
      return validationMessages.required;
    }

    if (value) {
      if (rules.email && !isValidEmail(value)) {
        return validationMessages.email;
      }

      if (rules.phone && !isValidPhoneNumber(value)) {
        return validationMessages.phone;
      }

      if (rules.minLength && !minLength(value, rules.minLength)) {
        return validationMessages.minLength(rules.minLength);
      }

      if (rules.maxLength && !maxLength(value, rules.maxLength)) {
        return validationMessages.maxLength(rules.maxLength);
      }

      if (rules.min !== undefined && rules.max !== undefined && !isInRange(value, rules.min, rules.max)) {
        return validationMessages.range(rules.min, rules.max);
      }

      if (rules.positive && !isPositive(value)) {
        return validationMessages.positive;
      }

      if (rules.url && !isValidUrl(value)) {
        return validationMessages.url;
      }

      if (rules.custom && !rules.custom(value)) {
        return rules.customMessage || "Giá trị không hợp lệ";
      }
    }

    return null;
  };
};
