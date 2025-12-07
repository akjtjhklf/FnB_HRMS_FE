import Cookies from "js-cookie";

export const CookieUtil = {
  set: (name: string, value: string, days?: number) => {
    // Tự động phát hiện xem đang chạy trên HTTP hay HTTPS
    // - Nếu chạy trên IP Azure (http://57.159...) -> isSecure = false -> Cookie ĐƯỢC LƯU
    // - Nếu chạy trên Domain thật (https://...) -> isSecure = true -> BẢO MẬT
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

    Cookies.set(name, value, {
      expires: days || 365 * 100, // Default 100 năm nếu không truyền days
      path: "/",
      
      // 🔴 ĐIỂM SỬA QUAN TRỌNG NHẤT:
      secure: isSecure, 
      
      // Dùng Lax để tránh bị trình duyệt chặn khi redirect login
      sameSite: "Lax", 
    });
  },

  get: (name: string): string | undefined => {
    return Cookies.get(name);
  },

  remove: (name: string) => {
    Cookies.remove(name, { path: "/" });
  },

  exists: (name: string): boolean => {
    return !!Cookies.get(name);
  },
};