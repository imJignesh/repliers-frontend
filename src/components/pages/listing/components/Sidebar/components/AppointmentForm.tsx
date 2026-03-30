'use client'

import React, { useState } from 'react'
import dayjs, { type Dayjs } from 'dayjs'

import {
    Button,
    Stack,
    TextField,
    Box,
    MenuItem
} from '@mui/material'
import {
    DatePicker,
    LocalizationProvider,
    TimePicker
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import { APIContact } from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'
import { extractErrorMessage } from 'utils/errors'
import { formatPhoneNumber, formatPhoneNumberAsYouType } from 'utils/formatters'
import { sanitizePhoneNumber } from 'utils/properties/sanitizers'
import { validateEmail, validatePhone } from 'utils/validators'

import AgreementText from './AgreementText'

const getFormData = (profile: any) => {
    return {
        first_name: profile?.fname || '',
        last_name: profile?.lname || '',
        email: profile?.email || '',
        phone: profile?.phone ? formatPhoneNumber(profile.phone) : '',
        date: dayjs().add(1, 'day'),
        time: dayjs().hour(12).minute(0),
        is_open: false
    }
}

const AppointmentForm = () => {
    const { profile } = useUser()
    const { showSnackbar } = useSnackbar()
    const [loading, setLoading] = useState(false)
    const [formTouched, setFormTouched] = useState(false)
    const [values, setValues] = useState(getFormData(profile))

    const {
        property: { address, mlsNumber, listPrice }
    } = useProperty()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setValues({ ...values, [name]: value })
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const phone = formatPhoneNumberAsYouType(e.target.value, values.phone)
        setValues({ ...values, phone })
    }

    const toggleIsOpen = () => {
        setValues({ ...values, is_open: !values.is_open })
    }

    const validFirstName = values.first_name && values.first_name.length <= 70
    const validLastName = values.last_name && values.last_name.length <= 70
    const validPhone = validatePhone(values.phone)
    const validEmail = validateEmail(values.email)

    const validDate = values.is_open || (values.date && (values.date.isAfter(dayjs(), 'day') || values.date.isSame(dayjs().add(1, 'day'), 'day')))
    const validTime = values.is_open || (values.time && values.time.hour() >= 9 && values.time.hour() <= 19)

    const formValid = validFirstName && validLastName && validPhone && validEmail && validDate && validTime;

    const handleSubmit = () => {
        setFormTouched(true)
        if (!formValid) return
        setLoading(true)

        const { first_name, last_name, email, phone, date, time, is_open } = values
        const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

        const appointmentDate = is_open ? "I'm Open" : date.format('YYYY-MM-DD')
        const appointmentTime = is_open ? "I'm Open" : time.format('HH:mm')

        APIContact.captureAppointment({
            first_name,
            last_name,
            email,
            phone: sanitizePhoneNumber(phone),
            url: currentUrl,
            mls_number: mlsNumber,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            listing_price: listPrice,
            listing_neighbourhood: address?.neighborhood,
            listing_city: address?.city
        })
            .then(() => {
                showSnackbar('Appointment booked successfully!', 'success')
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {!values.is_open && (
                            <Stack direction="column" spacing={2}>
                                <DatePicker
                                    label="Date"
                                    minDate={dayjs().add(1, 'day')}
                                    value={values.date}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    onChange={(newValue) => setValues({ ...values, date: newValue as Dayjs })}
                                />
                                <TextField
                                    select
                                    label="Time"
                                    size="small"
                                    fullWidth
                                    value={values.time.format('HH:mm')}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number)
                                        setValues({ ...values, time: dayjs().hour(hours).minute(minutes) })
                                    }}
                                >
                                    {Array.from({ length: 21 }).map((_, i) => {
                                        const hour = 9 + Math.floor(i / 2)
                                        const minute = (i % 2) * 30
                                        const timeLabel = dayjs().hour(hour).minute(minute).format('hh:mm A')
                                        const timeValue = dayjs().hour(hour).minute(minute).format('HH:mm')
                                        return (
                                            <MenuItem key={timeValue} value={timeValue}>
                                                {timeLabel}
                                            </MenuItem>
                                        )
                                    })}
                                </TextField>
                            </Stack>
                        )}
                        {values.is_open && (
                            <TextField
                                fullWidth
                                size="small"
                                disabled
                                value="I'm Open"
                                label="Time-Date Selection"
                            />
                        )}
                        <Button
                            fullWidth
                            variant={values.is_open ? 'contained' : 'outlined'}
                            size="small"
                            color="primary"
                            onClick={toggleIsOpen}
                        >
                            {values.is_open ? "Change Date/Time" : "I'm Open"}
                        </Button>
                    </Box>

                    <TextField
                        fullWidth
                        name="first_name"
                        label="First Name"
                        value={values.first_name}
                        onChange={handleInputChange}
                        error={formTouched && !validFirstName}
                        helperText={formTouched && !validFirstName ? 'Required' : ''}
                    />
                    <TextField
                        fullWidth
                        name="last_name"
                        label="Last Name"
                        value={values.last_name}
                        onChange={handleInputChange}
                        error={formTouched && !validLastName}
                        helperText={formTouched && !validLastName ? 'Required' : ''}
                    />
                    <TextField
                        fullWidth
                        name="email"
                        type="email"
                        label="Email"
                        value={values.email}
                        onChange={handleInputChange}
                        error={formTouched && !validEmail}
                        helperText={formTouched && !validEmail ? 'Invalid email' : ''}
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
                        helperText={formTouched && !validPhone ? 'Required' : ''}
                    />

                    <Button
                        fullWidth
                        size="large"
                        loading={loading}
                        variant="contained"
                        onClick={handleSubmit}
                    >
                        Book a Viewing
                    </Button>

                    <AgreementText />
                </Stack>
            </LocalizationProvider>
        </form>
    )
}

export default AppointmentForm
