// Same rules as the backend, so the user sees mistakes before a request is sent
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegisterForm({ name, email, password }) {
  const errors = {}

  if (!name.trim()) {
    errors.name = 'Name is required'
  }

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Email must be valid'
  }

  if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}
