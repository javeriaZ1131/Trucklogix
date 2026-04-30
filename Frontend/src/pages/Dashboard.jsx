import Sidebar from '../components/Sidebar/Sidebar'
import TripPlanner from '../components/TripPlanner/TripPlanner'
import TripOverview from '../components/TripOverview/TripOverview'
import ELDLogs from '../components/ELDLogs/ELDLogs'
import RouteMap from '../components/RouteMap/RouteMap'
import './Dashboard.css'
const Dashboard = () => {
return (
<div className="dashboard-container">
<Sidebar />
<div className="main-content">
<div className="top-grid">
<TripPlanner />
<TripOverview />
</div>
<div className="bottom-grid">
<ELDLogs />
<RouteMap />
</div>
</div>
</div>
)
}
export default Dashboard