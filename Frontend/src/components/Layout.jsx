import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, MapPin, FileText,
  Settings, HelpCircle, Truck, Menu, X, Moon, Sun
} from 'lucide-react'
import { DRIVER } from '../data/staticData'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/new-trip',  icon: PlusCircle,       label: 'New Trip'   },
  { to: '/trips',     icon: MapPin,           label: 'My Trips'   },
  { to: '/logs',      icon: FileText,         label: 'Logs'       },
  { to: '/settings',  icon: Settings,         label: 'Settings'   },
]

export default function Layout() {
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const toggleDark = () => {
    setDark(d => !d)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'dark' : ''}`}>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-60 flex flex-col
        bg-[#151f2e] text-white
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="bg-blue-500 rounded-lg p-1.5">
            <Truck size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">TruckLogix</p>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">ELD Trip Planner</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-2 border-t border-white/10 pt-3">
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {DRIVER.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{DRIVER.name}</p>
              <p className="text-[11px] text-white/40 truncate">{DRIVER.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setOpen(true)}>
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-blue-600" />
            <span className="font-bold text-sm dark:text-white">TruckLogix</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}