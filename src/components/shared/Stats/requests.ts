import { APIWidgets } from 'services/API'

import { type ChartStatsParams } from './types'
import { extractArrays } from './utils'

export const fetchStatistics = async (
  statistics: string,
  params: ChartStatsParams
) => {
  const { timeRange, propertyClass, ...location } = params

  try {
    const response = await APIWidgets.fetchHistory({
      ...location,
      propertyClass,
      months: timeRange,
      statistics
    })
    return response?.statistics || {}
  } catch (error) {
    console.error('[Statistics] error fetching data', error)
    return {}
  }
}

export const fetchSalePrice = async (params: ChartStatsParams) => {
  const { soldPrice } = await fetchStatistics(
    'med-soldPrice,avg-soldPrice,grp-mth',
    params
  )

  if (!soldPrice) return null

  return extractArrays(soldPrice.mth, params.timeRange, ['avg', 'med'])
}

export const fetchSold = async (params: ChartStatsParams) => {
  const { soldPrice } = await fetchStatistics('sum-soldPrice,grp-mth', params)

  if (!soldPrice) return null

  return extractArrays(soldPrice.mth, params.timeRange, ['count'])
}

export const fetchDaysOnMarket = async (params: ChartStatsParams) => {
  const { daysOnMarket } = await fetchStatistics(
    'avg-daysOnMarket,med-daysOnMarket,grp-mth',
    params
  )

  if (!daysOnMarket) return null

  return extractArrays(daysOnMarket.mth, params.timeRange, ['avg', 'med'])
}

export const fetchSalesVolume = async (params: ChartStatsParams) => {
  const { soldPrice } = await fetchStatistics('sum-soldPrice,grp-mth', params)

  if (!soldPrice) return null

  return extractArrays(soldPrice.mth, params.timeRange, ['sum'])
}
