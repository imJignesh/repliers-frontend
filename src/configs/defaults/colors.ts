import { darken, lighten } from '@mui/material'

export const white = '#FFFFFF'
export const light = '#7B7B7B'
export const medium = '#3E494B'
export const dark = '#363636'
export const black = '#130F26'

export const background = '#F4F4F4'

// main green
export const primary = '#2c6b9b'
// main coral
export const secondary = '#f75a39'
// markers color, normally the same as secondary
export const marker = secondary
export const soldMarker = darken(marker, 0.2)
export const rentMarker = marker

// Hint and placeholder text must stay readable: #6B6B6B is 5.4:1 on white
// and 4.9:1 on the page background (WCAG 1.4.3 needs 4.5:1, audit RT06).
export const hint = '#6B6B6B'
export const placeholder = hint
export const disabled = light
export const divider = '#E9E9E9'

// alert / toast / snackbar colors

export const info = '#2c6b9b'
export const error = '#F44336'
export const success = '#4CAF50'
export const warning = '#FFC107'

// Chart colors

export const chartColors = [secondary, lighten(primary, 0.5), success]
export const inventoryColors = [success, warning, error]
