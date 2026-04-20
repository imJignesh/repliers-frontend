'use client'

import React, { useState } from 'react'

import { Button, Stack, TextField } from '@mui/material'
import Grid from '@mui/material/Grid2'

import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

import { APIContact } from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'
import { extractErrorMessage } from 'utils/errors'
import { formatPhoneNumber, formatPhoneNumberAsYouType } from 'utils/formatters'
import { formatFullAddress } from 'utils/properties'
import { sanitizePhoneNumber } from 'utils/properties/sanitizers'
import { joinNonEmpty } from 'utils/strings'
import { validateEmail, validatePhone } from 'utils/validators'

import AgreementText from './AgreementText'

const getFormData = (profile: any) => {
  return {
    first_name: profile?.fname || '',
    last_name: profile?.lname || '',
    email: profile?.email || '',
    phone: profile?.phone ? formatPhoneNumber(profile.phone) : '',
    message: ''
  }
}

const RequestInfoForm = () => {
  const { profile } = useUser()
  const { showSnackbar } = useSnackbar()
  const { property } = useProperty()
  const { address, mlsNumber, listPrice } = property
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formTouched, setFormTouched] = useState(false)

  const [values, setValues] = useState(getFormData(profile))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = formatPhoneNumberAsYouType(e.target.value, values.phone)
    setValues({ ...values, phone })
  }

  const validFirstName = values.first_name && values.first_name.length <= 70
  const validLastName = values.last_name && values.last_name.length <= 70
  const validPhone = validatePhone(values.phone)
  const validEmail = validateEmail(values.email)

  const formValid = validFirstName && validLastName && validPhone && validEmail

  const handleSubmit = () => {
    setFormTouched(true)
    if (!formValid) return
    setLoading(true)

    const { first_name, last_name, email, phone, message } = values

    // Auto capture details
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

    APIContact.captureLead({
      first_name,
      last_name,
      email,
      phone: sanitizePhoneNumber(phone),
      message,
      mls_number: mlsNumber,
      url: currentUrl,
      listing_price: listPrice,
      price: listPrice,
      listing_neighbourhood: address?.neighborhood,
      listing_city: address?.city,
      mls_municipality: address?.district || address?.area,
      contact_source: joinNonEmpty([address?.streetNumber, address?.streetName]),
      beds: property?.details?.numBedrooms,
      baths: property?.details?.numBathrooms
    })
      .then(() => {
        Cookies.set('rauthenticated', 'true', { expires: 365 })
        showSnackbar('Thank you! Your request has been sent.', 'success')
        router.refresh()
      })
      .catch((e) => {
        showSnackbar(extractErrorMessage(e), 'error')
      })
      .finally(() => {
        setLoading(false)
        setFormTouched(false)
      })
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} autoComplete="off">
      <input type="hidden" name="price" value={listPrice || ''} />
      <input type="hidden" name="mls_municipality" value={address?.district || address?.area || ''} />
      <input type="hidden" name="contact_source" value={joinNonEmpty([address?.streetNumber, address?.streetName]) || ''} />
      <input type="hidden" name="beds" value={property?.details?.numBedrooms || ''} />
      <input type="hidden" name="baths" value={property?.details?.numBathrooms || ''} />
      <input type="hidden" name="neighbourhood" value={address?.neighborhood || ''} />
      <Stack spacing={2}>
        <TextField
          fullWidth
          name="first_name"
          label="First Name"
          value={values.first_name}
          onChange={handleInputChange}
          error={formTouched && !validFirstName}
          helperText={formTouched && !validFirstName ? 'Required field ' : ''}
        />
        <TextField
          fullWidth
          name="last_name"
          label="Last Name"
          value={values.last_name}
          onChange={handleInputChange}
          error={formTouched && !validLastName}
          helperText={formTouched && !validLastName ? 'Required field ' : ''}
        />
        <TextField
          fullWidth
          name="email"
          type="email"
          label="Email"
          value={values.email}
          onChange={handleInputChange}
          error={formTouched && !validEmail}
          helperText={formTouched && !validEmail ? 'Enter valid email' : ''}
        />
        <TextField
          fullWidth
          type="tel"
          name="phone"
          label="Phone"
          placeholder="+1 (555) 555-1234"
          value={values.phone}
          onChange={handlePhoneChange}
          error={formTouched && !validPhone}
          helperText={formTouched && !validPhone ? 'Required field ' : ''}
        />


        <Button
          fullWidth
          size="large"
          loading={loading}
          variant="contained"
          onClick={handleSubmit}
        >
          REGISTER TO VIEW PHOTOS
        </Button>

        <AgreementText />
      </Stack>
    </form>
  )
}

export default RequestInfoForm
