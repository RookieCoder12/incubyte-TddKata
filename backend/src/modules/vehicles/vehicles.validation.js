const TEXT_FIELDS = { make: 'Make', model: 'Model', category: 'Category' }

function validateText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    return `${label} is required`
  }

  return null
}

function validatePrice(price) {
  if (price === undefined || price === null) {
    return 'Price is required'
  }

  if (typeof price !== 'number' || Number.isNaN(price)) {
    return 'Price must be a number'
  }

  if (price <= 0) {
    return 'Price must be greater than 0'
  }

  return null
}

function validateQuantity(quantity) {
  if (quantity === undefined || quantity === null) {
    return 'Quantity is required'
  }

  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    return 'Quantity must be a number'
  }

  if (!Number.isInteger(quantity)) {
    return 'Quantity must be an integer'
  }

  if (quantity < 0) {
    return 'Quantity cannot be negative'
  }

  return null
}

export function validateVehicleInput(data) {
  const errors = {}

  for (const [field, label] of Object.entries(TEXT_FIELDS)) {
    const textError = validateText(data?.[field], label)
    if (textError) {
      errors[field] = textError
    }
  }

  const priceError = validatePrice(data?.price)
  if (priceError) {
    errors.price = priceError
  }

  const quantityError = validateQuantity(data?.quantity)
  if (quantityError) {
    errors.quantity = quantityError
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
