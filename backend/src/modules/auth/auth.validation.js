const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return 'Email is required'
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Email must be valid'
  }

  return null
}

export function validateRegisterInput(data) {
  const errors = {}

  if (!data?.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.name = 'Name is required'
  }

  const emailError = validateEmail(data?.email)
  if (emailError) {
    errors.email = emailError
  }

  if (!data?.password) {
    errors.password = 'Password is required'
  } else if (typeof data.password !== 'string' || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
