import dayjs from 'dayjs'

import { type Property } from 'services/API'

import { toSafeNumber } from 'utils/formatters'

/**
 * Creates property utility functions with translation context using ICU Message Format
 * Usage: const { getDaysSinceListed, getUpdatedDays } = createPropertyI18nUtils(t)
 */

export const createPropertyI18nUtils = (
  t: (key: string, values?: Record<string, any>) => string
) => {
  return {
    getDaysSinceListed: (property: Property) => {
      const daysNumber = property.daysOnMarket !== undefined && property.daysOnMarket !== null
        ? toSafeNumber(property.daysOnMarket)
        : (property.listDate ? Math.abs(dayjs(property.listDate).diff(dayjs(), 'day')) : NaN)

      return {
        count: daysNumber,
        label: !Number.isFinite(daysNumber)
          ? ''
          : t('property.daysOnMarket', { count: daysNumber })
      }
    },


    getUpdatedDays: (days: string) => {
      const updatedDays = dayjs().diff(dayjs(days), 'day')

      return {
        count: updatedDays,
        label: t('property.updatedDaysAgo', { count: updatedDays })
      }
    }
  }
}
