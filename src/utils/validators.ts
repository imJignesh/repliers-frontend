'use client'

import Joi from 'joi'
import { isValidPhoneNumber } from 'libphonenumber-js'

import i18nConfig from '@configs/i18n'

export const validateEmail = (email: string, maxLen = 70): boolean => {
  // Check if email is empty or exceeds the maximum length
  if (!email || email.length > maxLen) {
    return false
  }

  // Define the allowed characters in the local part and domain part
  const localPartRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/
  const domainPartRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Split the email address into local part and domain part
  const [localPart, domainPart] = email.split('@')

  // Ensure both local part and domain part exist
  if (!localPart || !domainPart) {
    return false
  }

  // Validate the local part and domain part using regular expressions
  if (!localPartRegex.test(localPart) || !domainPartRegex.test(domainPart)) {
    return false
  }

  // Ensure the domain part doesn't start or end with a hyphen
  if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
    return false
  }

  return true
}

export const validatePhone = (value: string) => {
  if (!value) return false
  
  // Basic check: should have at least 7 digits
  const digits = value.replace(/[^\d]/g, '')
  if (digits.length < 7) return false

  try {
    // 1. Check with default country (CA)
    if (isValidPhoneNumber(value, i18nConfig.phoneNumberLocale)) return true
    // 2. Check as international (requires +)
    if (isValidPhoneNumber(value)) return true
    
    // 3. Fallback: if it starts with + and has enough digits, consider it valid enough 
    // for "various combinations" if the library is too strict
    if (value.startsWith('+') && digits.length >= 7) return true
    
    // 4. Fallback for non-+ numbers that might be valid elsewhere but we don't know the country
    // Since the user wants "various combinations", let's be more permissive if it looks like a full number
    return digits.length >= 10
  } catch (e) {
    return digits.length >= 7
  }
}

export const validatePhoneSchema = Joi.string()
  .trim()
  .custom((value, helpers) => {
    if (!value) return ''
    if (!isValidPhoneNumber(value, i18nConfig.phoneNumberLocale))
      return helpers.error('libphonenumber.invalid')
    return value
  })
  .messages({
    'libphonenumber.invalid': 'Incorrect phone format',
    'string.empty': 'Phone number should not be empty',
    'any.required': 'Phone number is required'
  })
