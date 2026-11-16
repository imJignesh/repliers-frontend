import { Link } from '@mui/material'
import { formatPhoneNumber } from 'utils/phone'


const PhoneLink = ({ phone }: { phone: string }) => {
  return (
    <Link href={`tel:${phone}`} underline="hover">
      {formatPhoneNumber(phone)}
    </Link>
  )
}
export default PhoneLink
