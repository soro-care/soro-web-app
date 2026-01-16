// utils/cookieManager.js
export class CookieManager {
  static ANON_USER_ID_KEY = 'soro_anon_user_id';
  static ANON_USERNAME_KEY = 'soro_anon_username';
  static USER_ID_EXPIRY_DAYS = 365; // 1 year
  static USERNAME_EXPIRY_DAYS = 365; // 30 days

  // Get or create anonymous user ID
  static getOrCreateUserId() {
    const existingId = this.getCookie(this.ANON_USER_ID_KEY);
    
    if (existingId) {
      return existingId;
    }
    
    // Create a new unique ID
    const newId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.setCookie(this.ANON_USER_ID_KEY, newId, this.USER_ID_EXPIRY_DAYS);
    return newId;
  }

  // Get stored username (if any)
  static getStoredUsername() {
    return this.getCookie(this.ANON_USERNAME_KEY) || null;
  }

  // Store username for future use
  static storeUsername(username) {
    if (username && username.trim()) {
      this.setCookie(this.ANON_USERNAME_KEY, username.trim(), this.USERNAME_EXPIRY_DAYS);
    }
  }

  // Clear all user data
  static clearUserData() {
    this.deleteCookie(this.ANON_USER_ID_KEY);
    this.deleteCookie(this.ANON_USERNAME_KEY);
  }

  // Helper methods for cookie operations
  static setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Strict`;
  }

  static getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  }

  static deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}