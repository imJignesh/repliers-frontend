/**
 * Room sizes from the TRREB feed carry no unit field. Nearly all are metres
 * (2-7), but some brokerages type feet (Abell #1001: 17.85 x 16.57). Label
 * metres only when every room in the listing is a plausible metric size, so a
 * feet-entered listing is never mislabelled.
 */
export const MAX_ROOM_METRES = 12

type RoomLike = {
  length?: string | number | null
  width?: string | number | null
}

const toNumber = (v: unknown) => {
  if (v === null || v === undefined) return NaN
  const s = String(v).trim()
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN
}

export const roomUnitSuffix = (
  rooms: RoomLike[] | null | undefined
): string => {
  const values = (rooms || [])
    .flatMap((r) => [r?.length, r?.width])
    .map(toNumber)
    .filter((n) => !Number.isNaN(n) && n > 0)
  if (!values.length) return ''
  return values.every((n) => n <= MAX_ROOM_METRES) ? ' m' : ''
}
