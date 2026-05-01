import { useNavigate } from 'react-router-dom'
import { PlusCircle, Eye, Trash2, MapPin } from 'lucide-react'
//import { STATIC_TRIPS } from '../data/staticData'
import {useState, useEffect} from 'react' 
import {fetchTrips,deleteTrip} from '../api/tripService'

const statuses = {
  Planned:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Active:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

export default function MyTrips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])    
    const [loading, setLoading] = useState(true)

    useEffect(() => {   
        fetchTrips()
            .then(res => setTrips(res.data))
            .catch(()=>setTrips([]))
            .finally(() => setLoading(false))

    }, [])

    const handleDelete = (id,e) => {
        e.stopPropagation()
        
        if (window.confirm('Are you sure you want to delete this trip?')) {
            deleteTrip(id)
                .then(() => setTrips(trips.filter(t => t.id !== id)))
                .catch(err => console.error('Error deleting trip:', err))
        }
    } 
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Trips</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and view all your planned and historical trips.</p>
        </div>
        <button
          onClick={() => navigate('/new-trip')}
          className="flex items-center gap-2 bg-gray-900 dark:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={16} />
          Plan New Trip
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">All Trips</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">A complete list of your trips.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {['Trip ID', 'Route', 'Date', 'Distance', 'Duration', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {trips.map(trip => (
                <tr
                  key={trip.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">#{trip.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                      <MapPin size={11} />
                      {trip.currentLocation}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {trip.pickupLocation} → {trip.dropoffLocation}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{trip.distance.toLocaleString()} mi</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{trip.duration}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statuses[trip.status] || statuses.Planned}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(trip.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded border border-gray-200 dark:border-gray-600"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}