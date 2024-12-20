export const validatePassword = (password) => ({
  length: password.length > 8,
  uppercase: /[A-Z]/.test(password),
  number: /\d/.test(password),
  specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

export const validateUsername = (username) => ({
  length: username.length >= 8 && username.length <= 15,
});

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  return phone.length === 10;
};