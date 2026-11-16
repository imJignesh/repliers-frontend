// Phone helpers live apart from utils/formatters and utils/properties/sanitizers
// so that pages without a phone field don't download libphonenumber-js
// (about 150 KB). Import them from here only in forms and views that show or
// edit a phone number.
import parsePhoneNumber, { AsYouType } from 'libphonenumber-js'

import i18nConfig from '@configs/i18n'

export const formatPhoneNumber = (value: string | null | undefined) => {
  if (!value) return ''
  try {
    const phoneNumber = parsePhoneNumber(value, i18nConfig.phoneNumberLocale) || parsePhoneNumber(value)
    if (!phoneNumber) return value

    // If it's international or not the default country, use international format
    if (phoneNumber.country !== i18nConfig.phoneNumberLocale || value.startsWith('+')) {
      return phoneNumber.formatInternational()
    }

    return phoneNumber.formatNational()
  } catch (e) {
    return value
  }
}

export const formatPhoneNumberAsYouType = (
  newVal: string,
  currentVal: string | null = ''
) => {
  // backspace handling
  if (newVal.length < (currentVal || '').length) return newVal
  
  // If it starts with +, use generic international formatting
  // Otherwise use default locale
  const asYouType = newVal.startsWith('+') 
    ? new AsYouType() 
    : new AsYouType(i18nConfig.phoneNumberLocale)
    
  return asYouType.input(newVal)
}

export const sanitizePhoneNumber = (value: string | null | undefined) => {
  if (!value) return ''
  try {
    const phoneNumber =
      parsePhoneNumber(value, i18nConfig.phoneNumberLocale) ||
      parsePhoneNumber(value)

    if (phoneNumber) {
      // If it's the default country, we might want to strip the + as per original logic,
      // but if it's international, we MUST keep it.
      if (
        phoneNumber.country === i18nConfig.phoneNumberLocale &&
        !value.startsWith('+')
      ) {
        return phoneNumber.number.replace('+', '')
      }
      return phoneNumber.number // Keep + for international or if user explicitly typed it
    }
  } catch (e) {
    // ignore error
  }

  // Fallback: just return the value with only digits and +
  return value.replace(/[^\d+]/g, '')
}
