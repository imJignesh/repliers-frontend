import { alpha, Button } from '@mui/material'

import { primary } from '@configs/colors'

// Height of GridMobileDrawer; keep the toggle just above the open drawer.
const DRAWER_HEIGHT = 368

/**
 * Audit R05: the toggle used to sit at the top of the map, where the filter
 * row (Condo / For Sale / Filters) overlaps it at phone and tablet widths, so
 * taps opened "For Sale" instead. It now sits at the bottom centre, above the
 * map style switch, and rides above the results drawer as a "Map" close action
 * while the drawer is open.
 */
const OpenDrawerButton = ({
  open = false,
  onClick
}: {
  open?: boolean
  onClick: () => void
}) => {
  return (
    <Button
      size="small"
      variant="contained"
      aria-expanded={open}
      aria-label={open ? 'Hide listing results' : 'Show listing results'}
      sx={{
        width: 120,
        bottom: open ? `${DRAWER_HEIGHT + 12}px` : '72px',
        left: '50%',
        ml: '-60px',
        boxShadow: 1,
        zIndex: 'tooltip',
        position: 'absolute',
        backdropFilter: 'blur(4px)',
        bgcolor: alpha(primary, 0.8),
        transition: 'bottom 0.3s ease-in-out',
        display: { xs: 'block', md: 'none' }
      }}
      onClick={onClick}
    >
      {open ? 'Map' : 'Gallery'}
    </Button>
  )
}

export default OpenDrawerButton
