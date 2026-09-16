// TODO: rename SCREAMING_SNAKE_CASE
export const CLASS_RESIDENTIAL = 'residential'
export const CLASS_CONDO = 'condo'
export const CLASS_COMMERCIAL = 'commercial'

export const LAST_STATUS_SOLD = 'Sld'
export const LAST_STATUS_NEW = 'New'
export const LAST_STATUS_SC = 'Sc'
// Still-active MLS statuses: price change, extension, sold conditional with escape
export const LAST_STATUS_PC = 'Pc'
export const LAST_STATUS_EXT = 'Ext'
export const LAST_STATUS_SCE = 'Sce'
export const LAST_STATUSES_ACTIVE = [
  LAST_STATUS_NEW,
  LAST_STATUS_SC,
  LAST_STATUS_PC,
  LAST_STATUS_EXT,
  LAST_STATUS_SCE
]

// ListingsStatus
export const STATUS_UNAVAILABLE = 'U'
export const STATUS_AVAILABLE = 'A'

// Statistics
export const STATISTICS_SOLD =
  'avg-soldPrice,med-soldPrice,min-soldPrice,max-soldPrice'
export const STATISTICS_ACTIVE =
  'avg-listPrice,med-listPrice,min-listPrice,max-listPrice'
