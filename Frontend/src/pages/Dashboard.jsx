// import { useNavigate } from 'react-router-dom'
// import {useState,useEffect } from 'react'

// import { Map, Clock, Activity, PlusCircle, Eye } from 'lucide-react'
// //import { STATIC_TRIPS } from '../data/staticData'
// import { fetchTrips } from '../api/tripService'
// const statuses = {
//   Planned:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
//   Completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
//   Active:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
// }

// export default function Dashboard() {
//   const navigate = useNavigate()
//   //const trips = STATIC_TRIPS
// const [trips, setTrips] = useState([])
// const [loading, setLoading] = useState(true)
// useEffect(() => {
//   fetchTrips()
//     .then(res => setTrips(res.data))
//     .catch(() => setTrips([]))
//     .finally(() => setLoading(false))
// }, [])
// // if (loading) {
// //   return (
// //     <div className="p-6 text-center text-gray-500">
// //       Loading dashboard...
// //     </div>
// //   )
// // }

//  // const totalMiles = trips.reduce((s, t) => s + t.distance, 0)
//   //const totalHours = trips.reduce((s, t) => s + parseInt(t.duration), 0)
// const totalHours = trips.reduce((s, t) => {
//   return s + (t.result?.eldLogs?.length || 0) * 10
// }, 0)
// const totalMiles = trips.reduce((s, t) => s + (t.distance || 0), 0)

//   const stats = [
//     { label: 'Total Trips',   value: trips.length,              sub: `${trips.filter(t=>t.status==='Completed').length} completed, ${trips.filter(t=>t.status==='Planned').length} planned`, icon: Map,      color: 'text-blue-600' },
//     { label: 'Total Miles',   value: totalMiles.toLocaleString(), sub: `Avg ${trips.length ? Math.round(totalMiles / trips.length).toLocaleString() : 0} mi / trip`, icon: Map,   color: 'text-purple-600' },
//     { label: 'Driving Hours', value: `${totalHours}h`,          sub: 'Logged driving time',      icon: Clock,     color: 'text-orange-600' },
//     { label: 'ELD Status',    value: 'Compliant',               sub: 'All logs up to date',      icon: Activity,  color: 'text-green-600', valueClass: 'text-green-600' },
//   ]

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Overview of your trips and ELD compliance.</p>
//         </div>
//         {/* <button
//           onClick={() => navigate('/new-trip')}
//           className="flex items-center gap-2 bg-gray-900 dark:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors"
//         >
//           <PlusCircle size={16} />
//           Plan Trip
//         </button> */}
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         {stats.map(({ label, value, sub, icon: Icon, color, valueClass }) => (
//           <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
//             <div className="flex items-start justify-between mb-3">
//               <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
//               <Icon size={16} className={color} />
//             </div>
//             <p className={`text-2xl font-bold ${valueClass || 'text-gray-900 dark:text-white'}`}>{value}</p>
//             <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
//           </div>
//         ))}
//       </div>

//       {/* Recent Trips */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
//         <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
//           <h2 className="font-semibold text-gray-900 dark:text-white">Recent Trips</h2>
//           <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Your {trips.length} most recent trips.</p>
//         </div>

//         <div className="overflow-x-auto">
//              {trips.length === 0 ? (
//     <div className="py-10 text-center">
//       <p className="text-gray-500 text-sm">No recent trips yet</p>
//       {/* <button
//         onClick={() => navigate('/new-trip')}
//         className="mt-3 flex items-center gap-2 mx-auto bg-gray-900 text-white px-4 py-2 rounded-lg text-sm"
//       >
//         <PlusCircle size={16} />
//         Plan your first trip
//       </button> */}
//       <button
//   onClick={() => navigate('/new-trip')}
//   className="mt-3 flex items-center gap-2 mx-auto bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 px-4 py-2 rounded-lg text-sm transition-colors"
// >
//   <PlusCircle size={16} />
//   <span className="dark:text-gray-100">Plan your first trip</span>
// </button>
//     </div>
//   ) : (
//           <table className="w-full text-sm">
            
//             <thead>
//               <tr className="border-b border-gray-100 dark:border-gray-700">
//                 {['Route', 'Date', 'Distance', 'Status', ''].map(h => (
//                   <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
//               {[...trips].reverse().map(trip => (
//                 <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
//                   <td className="px-5 py-4">
//                     <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-0.5">
//                       <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
//                       {trip.currentLocation}
//                     </p>
//                     <button
//                       onClick={() => navigate(`/trips/${trip.id}`)}
//                       className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
//                     >
//                       {trip.pickupLocation} → {trip.dropoffLocation}
//                     </button>
//                   </td>
//                   <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
//                     {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                   </td>
//                   <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{trip?.distance.toLocaleString()} mi</td>
//                   <td className="px-5 py-4">
//                     <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statuses[trip.status] || statuses.Planned}`}>
//                       {trip.status}
//                     </span>
//                   </td>
//                   <td className="px-5 py-4">
//                     <button
//                       onClick={() => navigate(`/trips/${trip.id}`)}
//                       className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded"
//                     >
//                       <Eye size={15} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//   )}
  
//         </div>

//       </div>
//     </div>
//   )
// }
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Map, Clock, Activity, PlusCircle, Eye } from 'lucide-react'
import { fetchTrips } from '../api/tripService'

const statusStyle = {
  Planned:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Active:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

export default function Dashboard() {
  const navigate          = useNavigate()
  const [trips,   setTrips]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips()
      .then(res => setTrips(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false))
  }, [])

  const totalMiles = trips.reduce((s, t) => s + Number(t.result?.distance || 0), 0)
  const totalDays  = trips.reduce((s, t) => s + Number(t.result?.totalDays || 0), 0)
  const completed  = trips.filter(t => t.status === 'Completed').length
  const planned    = trips.filter(t => t.status === 'Planned').length
  const avgMiles   = trips.length > 0 ? Math.round(totalMiles / trips.length) : 0

  const stats = [
    { label: 'Total Trips', value: trips.length, sub: `${completed} completed, ${planned} planned`, icon: Map, color: 'text-blue-600' },
    { label: 'Total Miles', value: totalMiles.toLocaleString(), sub: trips.length > 0 ? `Avg ${avgMiles.toLocaleString()} mi / trip` : 'No trips yet', icon: Map, color: 'text-purple-600' },
    { label: 'Total Days',  value: `${totalDays}d`, sub: 'Logged driving days', icon: Clock, color: 'text-orange-600' },
    { label: 'ELD Status',  value: 'Compliant', sub: 'All logs up to date', icon: Activity, color: 'text-green-600', valueClass: 'text-green-600' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Overview of your trips and ELD compliance.</p>
        </div>
        <button
          onClick={() => navigate('/new-trip')}
          className="flex items-center gap-2 bg-gray-900 dark:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <PlusCircle size={16} /> Plan Trip
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, sub, icon: Icon, color, valueClass }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
              <Icon size={16} className={color} />
            </div>
            {loading ? (
              <div className="h-8 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <p className={`text-2xl font-bold ${valueClass || 'text-gray-900 dark:text-white'}`}>{value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Recent Trips */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Trips</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Your most recent trips.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm mb-3">No trips planned yet.</p>
            <button
              onClick={() => navigate('/new-trip')}
              className="inline-flex items-center gap-2 bg-gray-900 dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              <PlusCircle size={16} /> Plan your first trip
            </button>
          </div>
        )}

        {!loading && trips.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {['Route', 'Date', 'Distance', 'Duration', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {[...trips].reverse().map(trip => {
                  const dist = Number(trip.result?.distance || 0)
                  const dur  = trip.result?.duration || '—'
                  return (
                    <tr
                      key={trip.id}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                          {trip.current_location || '—'}
                        </p>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {trip.pickup_location} → {trip.dropoff_location}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {trip.date ? new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        {dist > 0 ? `${dist.toLocaleString()} mi` : '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{dur}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[trip.status] || statusStyle.Planned}`}>
                          {trip.status || 'Planned'}
                        </span>
                      </td>
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/trips/${trip.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}