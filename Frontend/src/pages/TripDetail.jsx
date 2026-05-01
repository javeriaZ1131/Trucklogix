import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Map, FileText, List, Ruler, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { STATIC_TRIPS, STOP_COLORS } from '../data/staticData'
import RouteMap from '../components/RouteMap'
import ELDLogSheet from '../components/ELDLogSheet'
import { fetchTrip } from '../api/tripService'

const TABS = [
  { key: 'route',    label: 'Route & Stops', icon: Map },
  { key: 'eld',      label: 'ELD Logs',      icon: FileText },
  { key: 'instructions', label: 'Instructions', icon: List },
]

const statusBg = {
  Planned:   'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Active:    'bg-amber-100 text-amber-700',
}

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('route')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [expandedDay, setExpandedDay] = useState(null)
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)

  useEffect(() => { 
    fetchTrip(id)
      .then(res => {
        setTrip(res.data.trip)
        setResult(res.data.result)
      })
      .catch(() =>{ navigate('/trips')})

      .finally(() => setLoading(false))
  }, [id])     

    

  //const trip = STATIC_TRIPS.find(t => t.id === Number(id))

  // Leaflet CSS + JS
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => setMapLoaded(true)
      document.body.appendChild(script)
    } else {
        Promise.resolve().then(() => {
        setMapLoaded(true)
      })    }
  }, [])


  if (!trip) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Trip not found.</p>
        <button onClick={() => navigate('/trips')} className="mt-3 text-blue-600 hover:underline text-sm">
          ← Back to My Trips
        </button>
      </div>
    )
  }
   if (loading || !trip || !result) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading trip...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/trips')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to My Trips
      </button>

      {/* Title */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trip #{trip.id}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBg[trip.status] || statusBg.Planned}`}>
              {trip.status}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">{trip.pickupLocation}</span>
            <span className="mx-2 text-gray-400">to</span>
            <span className="font-medium">{trip.dropoffLocation}</span>
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Distance</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{trip.distance.toLocaleString()} mi</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Duration</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{trip.duration}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Distance',  value: `${trip.distance.toLocaleString()} mi` },
          { label: 'Driving Time',    value: trip.drivingTime },
          { label: 'Total Stops',     value: trip.stops },
          { label: 'Fuel Stops',      value: trip.fuelStops },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Route & Stops Tab */}
      {tab === 'route' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ minHeight: 380 }}>
            {mapLoaded ? (
              <RouteMap trip={{ ...trip, routeCoords: result?.routeCoords }} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[320px] text-gray-400 dark:text-gray-600 text-sm">
                Loading map...
              </div>
            )}
          </div>

          {/* Stops Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Stops Summary</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Scheduled points along the route.</p>

            <div className="space-y-4">
              {result?.stopsSummary?.map((stop, i) => {
                const col = STOP_COLORS[stop.type]
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: col.dot }} />
                      {i < result.stopsSummary.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1 mb-0" style={{ minHeight: 20 }} />
                      )}
                    </div>
                    <div className="pb-3 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{stop.location}</p>
                        {stop.miles > 0 && (
                          <span className="text-xs text-gray-400 shrink-0">{stop.miles.toLocaleString()} mi</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{stop.label}</p>
                      {stop.note && <p className="text-xs text-blue-500 italic mt-0.5">{stop.note}</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Total Distance</span>
              <span className="font-bold text-gray-900 dark:text-white">{trip.distance.toLocaleString()} mi</span>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(STOP_COLORS).map(([type, { dot, label }]) => (
                <div key={type} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ELD Logs Tab */}
      {tab === 'eld' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {result?.eldLogs.length} day{result?.eldLogs.length > 1 ? 's' : ''} of ELD logs — FMCSA compliant
            </p>
          </div>
          {result?.eldLogs?.map(log => (
            <ELDLogSheet key={log.day} log={log} trip={trip} />
          ))}
        </div>
      )}

      {/* Instructions Tab */}
      {tab === 'instructions' && (
        <div className="space-y-3">
          {result?.eldLogs?.map((log, di) => {
            const isOpen = expandedDay === di
            return (
              <div key={di} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setExpandedDay(isOpen ? null : di)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      Day {log.day} — {new Date(log.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Driving: {log.drivingTime} · On Duty: {log.totalOnDuty}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
                    {log.entries.map((entry, ei) => (
                      <div key={ei} className="flex items-start gap-3 px-5 py-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{
                          background: Object.values(STOP_COLORS).find(c => c.label === entry.status)?.dot
                            || ['#94a3b8','#818cf8','#22c55e','#f59e0b'][Object.values({0:'Off Duty',1:'Sleeper Berth',2:'Driving',3:'On Duty (Not Driving)'}).indexOf(entry.status)] || '#94a3b8'
                        }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">{entry.start}</span>
                            <span className="text-xs text-gray-400 font-mono">{entry.duration}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{entry.status} — {entry.location}</p>
                          {entry.notes && <p className="text-xs text-blue-500 italic mt-0.5">{entry.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}