import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

export const planTrip    = (data) => API.post('/plan-trip/', data)
export const fetchTrips  = ()     => API.get('/trips/')
export const fetchTrip   = (id)   => API.get(`/trips/${id}/`)
export const deleteTrip  = (id)   => API.delete(`/trips/${id}/`)