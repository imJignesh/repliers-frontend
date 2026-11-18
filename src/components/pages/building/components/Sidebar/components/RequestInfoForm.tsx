'use client'

import React, { useRef, useState } from 'react'

import { Button, Stack, TextField } from '@mui/material'
import Grid from '@mui/material/Grid2'

import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

import { APIContact } from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'
import { extractErrorMessage } from 'utils/errors'
import { formatFullAddress } from 'utils/properties'
import { joinNonEmpty } from 'utils/strings'
import { validateEmail, validatePhone } from 'utils/validators'

import AgreementText from './AgreementText'
import { formatPhoneNumber, formatPhoneNumberAsYouType, sanitizePhoneNumber } from 'utils/phone'

const getFormData = (form: any, message: string) => {
  const { phone, email, fname, lname } = form
  return {
    message,
    name: joinNonEmpty([fname, lname], ' '),
    email: email || '',
    phone: formatPhoneNumber(phone),
    askFinancing: false
  }
}

const RequestInfoForm = () => {
  const { profile } = useUser()
  const router = useRouter()
  const { showSnackbar } = useSnackbar()
  const {
    property: { address, mlsNumber, listPrice }
  } = useProperty()
  const [loading, setLoading] = useState(false)
  const [formTouched, setFormTouched] = useState(false)
  const messageText = `I want to talk about ${formatFullAddress(address, true)}`

  const [values, setValues] = useState(getFormData(profile, messageText))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = formatPhoneNumberAsYouType(e.target.value, values.phone)
    setValues({ ...values, phone })
  }

  const validName = values.name && values.name.length <= 70
  const validPhone = validatePhone(values.phone)
  const validEmail = validateEmail(values.email)

  const formValid = validName && validPhone && validEmail

  // Audit 4 T13: after a failed submit, move focus to the first invalid field.
  const formRef = useRef<HTMLFormElement>(null)
  const focusFirstInvalid = () =>
    setTimeout(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus()
    }, 0)

  const handleSubmit = (event?: React.SyntheticEvent) => {
    event?.preventDefault()
    setFormTouched(true)
    if (!formValid) {
      focusFirstInvalid()
      return
    }
    setLoading(true)

    const { name, email, phone, message } = values

    APIContact.requestInfo({
      name,
      email,
      phone: sanitizePhoneNumber(phone),
      message,
      mlsNumber,
      listing_price: listPrice,
      price: listPrice,
      listing_neighbourhood: address?.neighborhood,
      listing_city: address?.city
    })
      .then(() => {
        Cookies.set('rauthenticated', 'true', { expires: 365 })
        showSnackbar('You can view all prices and sales history now.', 'success')
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
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="price" value={listPrice || ''} />
      <Stack spacing={2}>
        <Grid container columns={2} spacing={2}>
          <Grid size={2}>
            <TextField
              fullWidth
              name="name"
              autoComplete="name"
              label="Name"
              value={values.name}
              onChange={handleInputChange}
              error={formTouched && (!values.name || values.name.length > 70)}
              helperText={
                formTouched && !values.name
                  ? 'Required field '
                  : values.name.length > 70
                    ? 'Max 70 chars for this field'
                    : ''
              }
            />
          </Grid>
          <Grid size={{ xs: 2, sm: 1, md: 2 }}>
            <TextField
              fullWidth
              name="email"
              autoComplete="email"
              type="email"
              label="Email"
              value={values.email}
              onChange={handleInputChange}
              error={formTouched && !validEmail}
              helperText={formTouched && !validEmail ? (values.email ? 'Enter a valid email' : 'Required field') : ''}
            />
          </Grid>
          <Grid size={{ xs: 2, sm: 1, md: 2 }}>
            <TextField
              fullWidth
              type="tel"
              name="phone"
              autoComplete="tel"
              label="Phone"
              placeholder="+1 (555) 555-1234"
              value={values.phone}
              onChange={handlePhoneChange}
              error={formTouched && !validPhone}
              helperText={formTouched && !validPhone ? 'Required field ' : ''}
            />
          </Grid>

        </Grid>

        <Button
          fullWidth
          size="large"
          loading={loading}
          variant="contained"
          onClick={handleSubmit}
        >
          Request info
        </Button>

        <AgreementText />
      </Stack>
    </form>
  )
}

export default RequestInfoForm
