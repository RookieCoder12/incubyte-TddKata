export function validateRestockInput(data) {
  const errors = {}
  const quantity = data?.quantity

  if (quantity === undefined || quantity === null) {
    errors.quantity = 'Quantity is required'
  } else if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    errors.quantity = 'Quantity must be a number'
  } else if (!Number.isInteger(quantity)) {
    errors.quantity = 'Quantity must be an integer'
  } else if (quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
