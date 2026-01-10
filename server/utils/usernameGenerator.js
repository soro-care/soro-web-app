// utils/usernameGenerator.js
export const generateRandomUsername = (name) => {
    const randomNumber = Math.floor(Math.random() * 10000);
    const cleanName = name.replace(/\s+/g, '').toLowerCase();
    return `${cleanName}${randomNumber}`;
  };