<<<<<<< HEAD
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

=======
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

>>>>>>> cb77817fd01b635948cd03e4e87e49b5a7055f8e
export default DashboardLayout