import queryString from 'query-string'

import { type StatsParams } from '@shared/Stats'

import APIBase from './APIBase'
import { type ApiStatisticResponse } from './types'

class APIWidgets extends APIBase {
  fetchStats({
    area = '',
    city = '',
    neighborhood = '',
    propertyClass = 'residential'
  }: StatsParams) {
    const params = queryString.stringify(
      {
        area,
        city,
        neighborhood,
        class: propertyClass,
        historyMonthsCount: 4
      },
      {
        skipEmptyString: true,
        skipNull: true
      }
    )

    return this.fetchJSON(
      `/stats/widgets?${params}`
    ) as Promise<ApiStatisticResponse>
  }

  /**
   * Monthly sold statistics for the Insights chart. Served by the backend
   * from Repliers; the public listings search cannot answer statistics
   * queries because it only knows our own active inventory.
   */
  fetchHistory({
    area = '',
    city = '',
    neighborhood = '',
    propertyClass = 'condo',
    months = 12,
    statistics
  }: StatsParams & { months: number; statistics: string }) {
    const params = queryString.stringify(
      {
        area,
        city,
        neighborhood,
        class: propertyClass,
        months,
        statistics
      },
      {
        arrayFormat: 'none',
        skipEmptyString: true,
        skipNull: true
      }
    )

    return this.fetchJSON(`/stats/history?${params}`) as Promise<{
      count: number
      statistics: Record<string, any>
    }>
  }
}

const apiWidgetsInstance = new APIWidgets()
export default apiWidgetsInstance
