import { List, ListItem, Typography } from '@mui/material'

import { ScrubbedText } from 'components/atoms'

import { type DetailsItemType } from 'utils/dataMapper'
import { capitalize } from 'utils/strings'

const DetailsItem = ({
  item,
  scrubbedLabel = '*********',
  scrubbedValue = '*********'
}: {
  item: DetailsItemType
  scrubbedLabel?: string
  scrubbedValue?: string
}) => {
  const { value, label } = item
  const lengthyValue = String(value).length > 25

  return (
    <List
      sx={{
        py: 0,
        my: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        '& li': { my: 0, py: 0.75, px: 0 }
      }}
    >
      <ListItem sx={{ flex: '0 0 50%' }}>
        <Typography variant="body2">
          <ScrubbedText replace={scrubbedLabel}>{label}</ScrubbedText>
        </Typography>
      </ListItem>
      <ListItem sx={{ flex: lengthyValue ? '0 0 100%' : '0 0 50%' }}>
        <Typography variant="body2" fontWeight={600}>
          <ScrubbedText replace={scrubbedValue}>
            {/* Keep the metre unit lowercase ("3.05 × 4.39 m"); capitalize() would make it "M". */}
            {capitalize(String(value)).replace(/(\d) M$/, '$1 m')}
          </ScrubbedText>
        </Typography>
      </ListItem>
    </List>
  )
}

export default DetailsItem
