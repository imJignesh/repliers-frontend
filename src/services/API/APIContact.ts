import APIBase from './APIBase'

type ContactFormRequest = {
  name: string
  email: string
  phone?: string
  message: string
}

type ContactRequestInfo = {
  name: string
  email: string
  phone: string
  message: string
  mlsNumber: string
  listing_price?: string
  listing_neighbourhood?: string
  listing_city?: string
  price?: string
}

export type LeadRequest = {
  first_name?: string
  last_name?: string
  name?: string
  email?: string
  phone?: string
  url?: string
  mls_number?: string
  listing_price?: string
  listing_neighbourhood?: string
  listing_city?: string
  message?: string
  price?: string
  beds?: string
  baths?: string
  mls_municipality?: string
  contact_source?: string
  neighbourhood?: string
}

export type AppointmentRequest = {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  url?: string
  mls_number?: string
  appointment_date?: string
  appointment_time?: string
  listing_price?: string
  listing_neighbourhood?: string
  listing_city?: string
  price?: string
  beds?: string
  baths?: string
  mls_municipality?: string
  contact_source?: string
  neighbourhood?: string
}

export type ContactScheduleMethod = 'InPerson' | 'LiveVideo'

type HomeTourRequest = {
  name: string
  email: string
  phone: string
  method: ContactScheduleMethod
  date: string
  time: string
  mlsNumber: string
  price?: string
  listing_price?: string
}

type MeetingRequest = {
  name: string
  email: string
  phone: string
  date: string
  time: string
  estimateId: number
}

class APIContact extends APIBase {
  addComment(body: ContactFormRequest) {
    return this.fetchRaw('/contact/contactus', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  requestInfo(body: ContactRequestInfo) {
    return this.fetchJSON('/contact/requestinfo', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  homeTourRequest(body: HomeTourRequest) {
    return this.fetchJSON('/contact/schedule', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  meetingRequest(body: MeetingRequest) {
    return this.fetchRaw('/contact/schedule/estimate', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  // New methods for sync backend
  // Note: These might need a different base URL eventually
  captureLead(body: LeadRequest) {
    return this.fetchJSON('/contact/leads', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  captureAppointment(body: AppointmentRequest) {
    return this.fetchJSON('/contact/appointments', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }
}

const apiContactInstance = new APIContact()
export default apiContactInstance
