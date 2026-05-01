import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, ChevronLeft, ChevronRight,
  CheckCircle2, ArrowRight
} from 'lucide-react'
import { STATUS_COLORS } from '../data/staticData'
import { fetchTrips } from '../api/tripService'

// ELD renderer

const ROW_H    = 42
const HEADER_H = 38
const LEFT_W   = 110
const RIGHT_W  = 8
const CANVAS_H = HEADER_H + ROW_H * 4

const ROW_LABELS = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty\n(Not Driving)']

function drawGrid(canvas, timeline) {
  if (!canvas) return
  const W = canvas.offsetWidth || 720
  canvas.width  = W
  canvas.height = CANVAS_H
  const gridW = W - LEFT_W - RIGHT_W
  const cellW = gridW / 24
  const ctx   = canvas.getContext('2d')

  ctx.clearRect(0, 0, W, CANVAS_H)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, CANVAS_H)

  /* hour labels row */
  const topNums = ['12','1','2','3','4','5','6','7','8','9','10','11',
                   '12','1','2','3','4','5','6','7','8','9','10','11','12']
  ctx.fillStyle  = '#6b7280'
  ctx.font       = '9px monospace'
  ctx.textAlign  = 'center'
  topNums.forEach((h, i) => ctx.fillText(h, LEFT_W + i * cellW, 13))

  /* period labels */
  const periods = { 0: 'MID', 6: '6 AM', 12: 'NOON', 18: '6 PM', 24: 'MID' }
  ctx.font = '8px sans-serif'
  Object.entries(periods).forEach(([h, lbl]) =>
    ctx.fillText(lbl, LEFT_W + Number(h) * cellW, 28)
  )

  /* row backgrounds + labels + grid */
  ROW_LABELS.forEach((lbl, ri) => {
    const y = HEADER_H + ri * ROW_H

    ctx.fillStyle = ri % 2 === 0 ? '#f9fafb' : '#f3f4f6'
    ctx.fillRect(LEFT_W, y, gridW, ROW_H)

    ctx.fillStyle = '#374151'
    ctx.font      = '9.5px sans-serif'
    ctx.textAlign = 'right'
    lbl.split('\n').forEach((line, li) =>
      ctx.fillText(line, LEFT_W - 5, y + (li === 0 ? 16 : 28))
    )

    for (let h = 0; h <= 24; h++) {
      const x = LEFT_W + h * cellW
      ctx.strokeStyle = h % 6 === 0 ? '#9ca3af' : '#e5e7eb'
      ctx.lineWidth   = h % 6 === 0 ? 1 : 0.5
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + ROW_H); ctx.stroke()
    }

    ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(LEFT_W, y); ctx.lineTo(LEFT_W + gridW, y); ctx.stroke()
  })

  /* bottom + left border */
  const bot = HEADER_H + ROW_H * 4
  ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(LEFT_W, bot); ctx.lineTo(LEFT_W + gridW, bot); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(LEFT_W, HEADER_H); ctx.lineTo(LEFT_W, bot);   ctx.stroke()

  /* filled status blocks */
  timeline.forEach(({ status, startHour, endHour }) => {
    const y     = HEADER_H + status * ROW_H
    const x1    = LEFT_W + startHour * cellW
    const x2    = LEFT_W + endHour   * cellW
    const color = STATUS_COLORS[status]?.bg || '#6b7280'
    ctx.fillStyle = color + 'bb'
    ctx.fillRect(x1 + 0.5, y + 5, x2 - x1 - 1, ROW_H - 10)
    ctx.fillStyle = color
    ctx.fillRect(x1 + 0.5, y + 2, x2 - x1 - 1, 3)
  })

  /* vertical connectors between status changes */
  const sorted = [...timeline].sort((a, b) => a.startHour - b.startHour)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1], curr = sorted[i]
    if (Math.abs(prev.endHour - curr.startHour) < 0.12) {
      const x  = LEFT_W + curr.startHour * cellW
      const y1 = HEADER_H + prev.status  * ROW_H + ROW_H / 2
      const y2 = HEADER_H + curr.status  * ROW_H + ROW_H / 2
      ctx.strokeStyle = '#374151'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke()
    }
  }
}

function ELDCanvas({ timeline }) {
  const ref = useRef(null)
  useEffect(() => { drawGrid(ref.current, timeline) }, [timeline])
 
  return (
    <canvas
      ref={ref}
      style={{
        width: '100%', height: CANVAS_H, display: 'block',
        borderRadius: 6, border: '1px solid #e5e7eb',
      }}
    />
  )
}


//   HOS compliance progress bar

function HosBar({ label, value, limit, colorClass }) {
  const pct = Math.min((value / limit) * 100, 100)
  const ok  = value <= limit
  return (
    <div className="flex-1 min-w-[130px]">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`text-xs font-mono font-semibold ${ok ? colorClass : 'text-red-500'}`}>
          {value.toFixed(2)} / {limit}h
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${ok ? colorClass.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-') : 'bg-red-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}


//   Main component

const toH = (s) => { const [h, m] = s.split(':').map(Number); return h + m / 60 }
const STATUS_MAP = { 'Off Duty': 0, 'Sleeper Berth': 1, 'Driving': 2, 'On Duty (Not Driving)': 3 }

export default function Logs() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(null)
  const [dayIdx, setDayIdx]         = useState(0)
  const [trips, setTrips] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchTrips()
    .then(res => setTrips(res.data))
    .catch(() => setTrips([]))
}, [])

useEffect(() => {
  if (trips.length && !selectedId) {
    setSelectedId(trips[0].id)
  }
}, [trips])
 
const trip = trips?.find(t => t.id === selectedId)
const log = trip?.eldLogs?.[dayIdx] ||null

if (!trips.length) {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-500">No logs found</p>
    </div>
  )
}
//   const driveH = toH(log.drivingTime)
//   const dutyH  = toH(log.totalOnDuty)
//   const availH = toH(log.availableTomorrow)
const driveH = log?.drivingTime ? toH(log.drivingTime) : 0
const dutyH  = log?.totalOnDuty ? toH(log.totalOnDuty) : 0
const availH = log?.availableTomorrow ? toH(log.availableTomorrow) : 0

  const handleTripSelect = (id) => {
    setSelectedId(id)
    setDayIdx(0)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ELD Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Hours of Service logs — FMCSA 49 CFR Part 395
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-3 py-1.5">
          <CheckCircle2 size={14} className="text-green-500" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">All logs compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* ── Trip list sidebar ── */}
        <div className="lg:col-span-1">
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
            Select Trip
          </p>
          <div className="space-y-2">
            {[...(trips || [])].reverse().map(t => {
              const active = t.id === selectedId
              return (
                <button
                  key={t.id}
                  onClick={() => handleTripSelect(t.id)}
                  className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all ${
                    active
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={12} className={active ? 'text-blue-500' : 'text-gray-400'} />
                    <span className={`text-xs font-bold ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Trip #{t.id}
                    </span>
                    <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                      {t.eldLogs.length}d
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                    {t.pickupLocation} → {t.dropoffLocation}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
                    {t.distance.toLocaleString()} mi ·{' '}
                    {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Day navigator card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Day {log.day} —{' '}
                  {new Date(log.date).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Driver: <span className="text-gray-600 dark:text-gray-300">{trip.driverName}</span>
                  {' '}· Truck: <span className="text-gray-600 dark:text-gray-300">{trip.truckNumber}</span>
                  {' '}· Carrier: <span className="text-gray-600 dark:text-gray-300">{trip.carrierName}</span>
                </p>
              </div>

              {/* Prev / Next day */}
              <div className="flex items-center gap-2">
                <button
                  disabled={dayIdx === 0}
                  onClick={() => setDayIdx(d => d - 1)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-14 text-center">
                  Day {dayIdx + 1} / {trip.eldLogs.length}
                </span>
                <button
                  disabled={dayIdx === trip.eldLogs.length - 1}
                  onClick={() => setDayIdx(d => d + 1)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* HOS compliance bars */}
            <div className="flex flex-wrap gap-5 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
              <HosBar label="Driving (11h limit)"  value={driveH} limit={11} colorClass="text-green-600 dark:text-green-400" />
              <HosBar label="On Duty (14h limit)"  value={dutyH}  limit={14} colorClass="text-amber-600 dark:text-amber-400" />
              <HosBar label="Available tomorrow"   value={availH} limit={11} colorClass="text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Canvas grid */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              Hours of Service Graph
            </p>
            <ELDCanvas timeline={log.timeline} />
            <div className="flex flex-wrap gap-4 mt-3">
              {Object.values(STATUS_COLORS).map(({ label, bg }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-sm" style={{ background: bg }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Driving',        value: log.drivingTime,       textCls: 'text-green-600 dark:text-green-400',  bgCls: 'bg-green-50 dark:bg-green-900/20'   },
              { label: 'On Duty',        value: log.onDutyTime,        textCls: 'text-amber-600 dark:text-amber-400',  bgCls: 'bg-amber-50 dark:bg-amber-900/20'   },
              { label: 'Off/Sleeper',    value: log.offDutySleeper,    textCls: 'text-purple-600 dark:text-purple-400',bgCls: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Total On Duty',  value: log.totalOnDuty,       textCls: 'text-gray-900 dark:text-white',       bgCls: 'bg-gray-50 dark:bg-gray-700/40'     },
              { label: 'Avail Tomorrow', value: log.availableTomorrow, textCls: 'text-blue-600 dark:text-blue-400',    bgCls: 'bg-blue-50 dark:bg-blue-900/20'     },
            ].map(({ label, value, textCls, bgCls }) => (
              <div key={label} className={`rounded-xl px-3 py-3 ${bgCls}`}>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <p className={`text-lg font-bold font-mono leading-tight ${textCls}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Log entries table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Log Entries
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    {['Status', 'Start', 'End', 'Duration', 'Location', 'Notes'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {log.entries.map((entry, i) => {
                    const sKey  = STATUS_MAP[entry.status] ?? 0
                    const color = STATUS_COLORS[sKey]
                    return (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                            style={{ background: color.bg + '22', color: color.bg }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color.bg }} />
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">{entry.start}</td>
                        <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">{entry.end}</td>
                        <td className="px-4 py-2.5 font-mono font-semibold text-gray-800 dark:text-gray-200">{entry.duration}</td>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{entry.location}</td>
                        <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500 italic">{entry.notes || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                View full trip detail
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}