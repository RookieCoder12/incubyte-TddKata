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

export function validateVehicleForm({ make, model, category, price, quantity }) {
  const errors = {}

  if (!make.trim()) errors.make = 'Make is required'
  if (!model.trim()) errors.model = 'Model is required'
  if (!category.trim()) errors.category = 'Category is required'

  if (price === '') {
    errors.price = 'Price is required'
  } else if (!(Number(price) > 0)) {
    errors.price = 'Price must be greater than 0'
  }

  if (quantity === '' || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    errors.quantity = 'Units must be a whole number, 0 or more'
  }

  return errors
}
