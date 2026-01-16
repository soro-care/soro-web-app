// Create a new file: hooks/useIOSFix.js
import { useEffect } from 'react';

export const useIOSFix = () => {
  useEffect(() => {
    // Fix for iOS double-tap issue
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // Remove 300ms delay on buttons
      document.addEventListener('touchstart', () => {}, { passive: true });
      
      // Add touch-action: manipulation to all buttons
      const style = document.createElement('style');
      style.textContent = `
        button, [role="button"] {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
};