import { Children } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import '.layout/Dashboard.css'
const DashboardLayout=({Children})=>{
return (
  <div className="dashboard-container">
<Sidebar />
<div className="dashboard-main">
{/* TOP SECTION */}
<div className="top-grid">
<TripPlanner />
<TripOverview />
3
</div>
{/* BOTTOM SECTION */}
<div className="bottom-grid">
<ELDLogs />
<Instructions />
<TripsTable />
</div>
</div>
</div>
)
}

export default DashboardLayout