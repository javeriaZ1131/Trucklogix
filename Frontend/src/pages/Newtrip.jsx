// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Navigation, Info, CheckCircle } from 'lucide-react'
// //import { STATIC_TRIPS } from '../data/staticData'
// import { planTrip } from '../api/tripService'
// //import LocationInput from '../components/LocationInput'
  
// const ASSUMPTIONS = [
//   { label: 'Cycle Rule',       value: '70hr / 8-day' },
//   { label: 'Driving Limit',    value: '11hr per shift' },
//   { label: 'Shift Limit',      value: '14hr total' },
//   { label: 'Rest Break',       value: '30min / 8hrs' },
//   { label: 'Reset',            value: '10hr minimum' },
//   { label: 'Avg Speed',        value: '55 mph' },
//   { label: 'Fuel Range',       value: '1,000 miles' },
//   { label: 'Pickup/Dropoff',   value: '1hr duration' },
// ]

// export default function NewTrip() {
//   const navigate = useNavigate()
//   const [form, setForm] = useState({
//     currentLocation: '',
//     pickupLocation: '',
//     dropoffLocation: '',
//     cycleUsed: 0,
//     driverName: 'John Doe',
//     carrierName: 'Logistics Inc',
//     truckNumber: 'T-100',
//     trailerNumber: 'TR-500',
//   })
//   const [loading, setLoading] = useState(false)

//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

//  const handleSubmit=async (e) => {
//     e.preventDefault()   
//     setLoading(true)   
    
//     try {
   
//     const res=await planTrip({
//         currentLocation:form.currentLocation,
//         pickupLocation: form.pickupLocation,  
//         dropoffLocation: form.dropoffLocation,
//         cycleUsed: form.cycleUsed,
//         driverName: form.driverName,
//         carrierName: form.carrierName,
//         truckNumber: form.truckNumber, 
//         trailerNumber: form.trailerNumber,
//     })
//     console.log('Trip planned successfully:', res.data)
//     navigate(`/trips/${res.data.id}`)
//     // You can navigate to the trip overview page or show a success message here
//   } 
//   catch (error) {
//     alert(error.response?.data?.error || 'Planning failed. Check locations.')

//     // Handle error (e.g., show an error message to the user)
//   } finally {
//     setLoading(false)
//   }       
// }
//   const filled = form.currentLocation && form.pickupLocation && form.dropoffLocation

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plan New Trip</h1>
//         <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Enter your trip details to generate compliant ELD logs and routing.</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Form */}
//         <div className="lg:col-span-2">
//           <form onSubmit={handleSubmit}>
//             <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
//               <div>
//                 <h2 className="font-semibold text-gray-900 dark:text-white mb-0.5">Trip Details</h2>
//                 <p className="text-xs text-gray-400 dark:text-gray-500">Enter the starting point, pickup, and dropoff locations.</p>
//               </div>

//               {[
//                 { label: 'Current Location (Start)', key: 'currentLocation', placeholder: 'e.g., Dallas, TX' },
//                 { label: 'Pickup Location',          key: 'pickupLocation',  placeholder: 'e.g., Austin, TX' },
//                 { label: 'Dropoff Location',         key: 'dropoffLocation', placeholder: 'e.g., Chicago, IL' },
//               ].map(({ label, key, placeholder }) => (
//                 <div key={key}>
//                   {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label> */}
//                   <input
//                     type="text"
//                     label={label}
//                     placeholder={placeholder}
//                     value={form[key]}
//                    onChange={(e) => set(key, e.target.value)}
//                     className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   />
//                 </div>
//               ))}

//               <hr className="border-gray-100 dark:border-gray-700" />

//               <div>
//                 <h3 className="font-medium text-gray-900 dark:text-white mb-0.5">Hours of Service</h3>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 mt-3">Current Cycle Used (Hours)</label>
//                 <input
//                   type="number"
//                   min={0}
//                   max={70}
//                   value={form.cycleUsed}
//                   onChange={e => set('cycleUsed', Number(e.target.value))}
//                   className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                 />
//                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Hours already used in your current 70hr/8-day cycle.</p>
//               </div>

//               <hr className="border-gray-100 dark:border-gray-700" />

//               <div>
//                 <h3 className="font-medium text-gray-900 dark:text-white mb-3">Optional Details</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   {[
//                     { label: 'Driver Name',    key: 'driverName'    },
//                     { label: 'Carrier Name',   key: 'carrierName'   },
//                     { label: 'Truck Number',   key: 'truckNumber'   },
//                     { label: 'Trailer Number', key: 'trailerNumber' },
//                   ].map(({ label, key }) => (
//                     <div key={key}>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
//                       <input
//                         type="text"
//                         value={form[key]}
//                         onChange={e => set(key, e.target.value)}
//                         className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={!filled || loading}
//                 className={`
//                   w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all
//                   ${filled && !loading
//                     ? 'bg-gray-900 dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700 cursor-pointer'
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
//                   }
//                 `}
//               >
//                 {loading ? (
//                   <>
//                     <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                     </svg>
//                     Planning Route...
//                   </>
//                 ) : (
//                   <>
//                     <Navigation size={16} />
//                     Plan My Trip →
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Right sidebar */}
//         <div className="space-y-4">
//           {/* Assumptions */}
//           <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
//             <div className="flex items-center gap-2 mb-4">
//               <Info size={15} className="text-blue-500" />
//               <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Trip Assumptions</h3>
//             </div>
//             <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Default parameters used for planning.</p>
//             <div className="space-y-2.5">
//               {ASSUMPTIONS.map(({ label, value }) => (
//                 <div key={label} className="flex justify-between items-center text-sm">
//                   <span className="text-gray-500 dark:text-gray-400">{label}</span>
//                   <span className="font-medium text-gray-900 dark:text-white">{value}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Smart Routing */}
//           <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-5">
//             <div className="flex items-start gap-2">
//               <Navigation size={15} className="text-blue-500 mt-0.5 shrink-0" />
//               <div>
//                 <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-1">Smart Routing</h3>
//                 <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
//                   Our algorithm automatically calculates required rest breaks, 10-hour sleeper berth periods, and fuel stops based on FMCSA regulations to ensure 100% compliant ELD logs.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Legal assumptions */}
//           <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
//             <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Compliance Checks</h3>
//             {[
//               'Property-carrying driver, 70hrs / 8 days',
//               'No adverse driving conditions',
//               'Fueling at least once every 1,000 miles',
//               '1 hour for pickup and drop-off',
//             ].map(item => (
//               <div key={item} className="flex items-start gap-2 mb-2.5 last:mb-0">
//                 <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
//                 <p className="text-xs text-gray-600 dark:text-gray-400">{item}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation, Info, CheckCircle } from 'lucide-react'
import { planTrip } from '../api/tripService'

const ASSUMPTIONS = [
  { label: 'Cycle Rule',      value: '70hr / 8-day' },
  { label: 'Driving Limit',   value: '11hr per shift' },
  { label: 'Shift Limit',     value: '14hr total' },
  { label: 'Rest Break',      value: '30min / 8hrs' },
  { label: 'Reset',           value: '10hr minimum' },
  { label: 'Avg Speed',       value: '55 mph' },
  { label: 'Fuel Range',      value: '1,000 miles' },
  { label: 'Pickup/Dropoff',  value: '1hr duration' },
]

export default function NewTrip() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    currentLocation: '',
    pickupLocation:  '',
    dropoffLocation: '',
    cycleUsed:       0,
    driverName:      'John Doe',
    carrierName:     'Logistics Inc',
    truckNumber:     'T-100',
    trailerNumber:   'TR-500',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const filled = form.currentLocation && form.pickupLocation && form.dropoffLocation

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await planTrip({
        currentLocation: form.currentLocation,
        pickupLocation:  form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        cycleUsed:       Number(form.cycleUsed),
        driverName:      form.driverName,
        carrierName:     form.carrierName,
        truckNumber:     form.truckNumber,
        trailerNumber:   form.trailerNumber,
      })
      navigate(`/trips/${res.data.id}`)
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.detail
        || err.message
        || 'Planning failed. Make sure the backend is running.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plan New Trip</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Enter your trip details to generate compliant ELD logs and routing.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Form ── */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Trip Details</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Enter the starting point, pickup, and dropoff locations.
                </p>
              </div>

              {[
                { label: 'Current Location (Start)', key: 'currentLocation', placeholder: 'e.g., Dallas, TX' },
                { label: 'Pickup Location',          key: 'pickupLocation',  placeholder: 'e.g., Houston, TX' },
                { label: 'Dropoff Location',         key: 'dropoffLocation', placeholder: 'e.g., Denver, CO' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              ))}

              <hr className="border-gray-100 dark:border-gray-700" />

              {/* Hours of Service */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Hours of Service</h3>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Cycle Used (Hours)
                </label>
                <input
                  type="number"
                  min={0}
                  max={70}
                  step={0.5}
                  value={form.cycleUsed}
                  onChange={e => set('cycleUsed', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Hours already used in your current 70hr/8-day cycle.
                </p>
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />

              {/* Optional Details */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Optional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Driver Name',    key: 'driverName'    },
                    { label: 'Carrier Name',   key: 'carrierName'   },
                    { label: 'Truck Number',   key: 'truckNumber'   },
                    { label: 'Trailer Number', key: 'trailerNumber' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={form[key]}
                        onChange={e => set(key, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!filled || loading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all
                  ${filled && !loading
                    ? 'bg-gray-900 dark:bg-blue-600 text-white hover:bg-gray-800 cursor-pointer'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Calculating route &amp; ELD logs...
                  </>
                ) : (
                  <>
                    <Navigation size={16} />
                    Plan My Trip →
                  </>
                )}
              </button>

            </div>
          </form>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">

          {/* Assumptions card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} className="text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Trip Assumptions</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Default parameters used for planning.</p>
            <div className="space-y-2.5">
              {ASSUMPTIONS.map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart routing card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-5">
            <div className="flex items-start gap-2">
              <Navigation size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-1">Smart Routing</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                  Automatically calculates rest breaks, 10-hour sleeper berth periods,
                  and fuel stops based on FMCSA regulations.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance checks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Compliance Checks
            </h3>
            {[
              'Property-carrying driver, 70hrs / 8 days',
              'No adverse driving conditions',
              'Fueling at least once every 1,000 miles',
              '1 hour for pickup and drop-off',
            ].map(item => (
              <div key={item} className="flex items-start gap-2 mb-2.5 last:mb-0">
                <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600 dark:text-gray-400">{item}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}