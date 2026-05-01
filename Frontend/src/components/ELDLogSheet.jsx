import { useRef, useEffect } from 'react'
import { STATUS_COLORS } from '../data/staticData'

const HOURS = Array.from({ length: 25 }, (_, i) => i) // 0..24
const ROWS = [
  { key: 0, label: 'Off Duty' },
  { key: 1, label: 'Sleeper Berth' },
  { key: 2, label: 'Driving' },
  { key: 3, label: 'On Duty\n(Not Driving)' },
]

const ROW_H = 44
const HEADER_H = 36
const LEFT_W = 110
const RIGHT_W = 20
const CANVAS_H = HEADER_H + ROW_H * 4 + 2

function drawLog(canvas, timeline) {
  const W = canvas.width
  const gridW = W - LEFT_W - RIGHT_W
  const cellW = gridW / 24

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, canvas.height)

  // Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, canvas.height)

  // Header row hour labels
  ctx.fillStyle = '#374151'
  ctx.font = '10px monospace'
  ctx.textAlign = 'center'
  const hourLabels = ['12', '1','2','3','4','5','6','7','8','9','10','11','12','1','2','3','4','5','6','7','8','9','10','11','12']
  hourLabels.forEach((h, i) => {
    const x = LEFT_W + i * cellW
    ctx.fillText(h, x, 14)
  })
  const midLabels = ['MID', '', '', '', '', '', 'NOON', '', '', '', '', '', '', '', '', '', '', '', 'MID']
  ;[0, 6, 12, 18, 24].forEach((h, idx) => {
    const labels = ['MID', '6 AM', 'NOON', '6 PM', 'MID']
    ctx.fillStyle = '#6b7280'
    ctx.font = '8px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(labels[idx], LEFT_W + h * cellW, 26)
  })

  // Row labels and grid
  ROWS.forEach(({ label }, rowIdx) => {
    const y = HEADER_H + rowIdx * ROW_H

    // Row label
    ctx.fillStyle = '#374151'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'
    label.split('\n').forEach((line, li) => {
      ctx.fillText(line, LEFT_W - 6, y + (li === 0 ? 16 : 28))
    })

    // Row bg
    ctx.fillStyle = rowIdx % 2 === 0 ? '#f9fafb' : '#f3f4f6'
    ctx.fillRect(LEFT_W, y, gridW, ROW_H)

    // Vertical hour lines
    for (let h = 0; h <= 24; h++) {
      const x = LEFT_W + h * cellW
      ctx.strokeStyle = h % 6 === 0 ? '#9ca3af' : '#e5e7eb'
      ctx.lineWidth = h % 6 === 0 ? 1 : 0.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + ROW_H)
      ctx.stroke()
    }

    // Horizontal border
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(LEFT_W, y)
    ctx.lineTo(LEFT_W + gridW, y)
    ctx.stroke()
  })

  // Bottom border
  const bottomY = HEADER_H + ROW_H * 4
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(LEFT_W, bottomY)
  ctx.lineTo(LEFT_W + gridW, bottomY)
  ctx.stroke()

  // Left border
  ctx.beginPath()
  ctx.moveTo(LEFT_W, HEADER_H)
  ctx.lineTo(LEFT_W, bottomY)
  ctx.stroke()

  // Draw filled timeline blocks
  timeline.forEach(({ status, startHour, endHour }) => {
    const rowIdx = status
    const y = HEADER_H + rowIdx * ROW_H
    const x1 = LEFT_W + startHour * cellW
    const x2 = LEFT_W + endHour * cellW
    const color = STATUS_COLORS[status]?.bg || '#6b7280'

    ctx.fillStyle = color + 'cc'
    ctx.fillRect(x1 + 0.5, y + 4, x2 - x1 - 1, ROW_H - 8)

    // Top thick line indicator
    ctx.fillStyle = color
    ctx.fillRect(x1 + 0.5, y + 2, x2 - x1 - 1, 3)
  })

  // Draw connecting vertical lines between status changes
  const sorted = [...timeline].sort((a, b) => a.startHour - b.startHour)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    if (Math.abs(prev.endHour - curr.startHour) < 0.1) {
      const x = LEFT_W + curr.startHour * cellW
      const y1 = HEADER_H + prev.status * ROW_H + ROW_H / 2
      const y2 = HEADER_H + curr.status * ROW_H + ROW_H / 2
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, y1)
      ctx.lineTo(x, y2)
      ctx.stroke()
    }
  }
}

export default function ELDLogSheet({ log, trip }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth || 700
    canvas.height = CANVAS_H
    drawLog(canvas, log.timeline)
  }, [log])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Sheet Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Day {log.day} — {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Hours of Service Log — FMCSA 49 CFR Part 395</p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          <div>Driver: <span className="font-medium text-gray-900 dark:text-white">{trip.driverName}</span></div>
          <div>Carrier: <span className="font-medium text-gray-900 dark:text-white">{trip.carrierName}</span></div>
          <div>Truck: <span className="font-medium text-gray-900 dark:text-white">{trip.truckNumber}</span> / Trailer: <span className="font-medium text-gray-900 dark:text-white">{trip.trailerNumber}</span></div>
        </div>
      </div>

      {/* Canvas grid */}
      <div className="p-4 bg-white dark:bg-gray-900">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: CANVAS_H, display: 'block' }}
          className="rounded border border-gray-200 dark:border-gray-700"
        />

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3">
          {Object.values(STATUS_COLORS).map(({ label, bg }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="w-3 h-3 rounded-sm" style={{ background: bg }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Table */}
      <div className="border-t border-gray-100 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              {['Status', 'Start', 'End', 'Duration', 'Location', 'Notes'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-gray-500 dark:text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {log.entries.map((entry, i) => {
              const statusKey = Object.values(STATUS_COLORS).findIndex(s => s.label === entry.status)
              const color = STATUS_COLORS[statusKey >= 0 ? statusKey : 0]
              return (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: color.bg + '22', color: color.bg }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color.bg }} />
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-mono">{entry.start}</td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-mono">{entry.end}</td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-mono font-medium">{entry.duration}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{entry.location}</td>
                  <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500 italic">{entry.notes || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 bg-gray-50 dark:bg-gray-700/30 flex flex-wrap gap-6">
        {[
          { label: 'Driving Time',      value: log.drivingTime,     color: 'text-green-600 dark:text-green-400' },
          { label: 'On Duty Time',      value: log.onDutyTime,      color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Off Duty/Sleeper',  value: log.offDutySleeper,  color: 'text-gray-600 dark:text-gray-400' },
          { label: 'Total On Duty',     value: log.totalOnDuty,     color: 'text-gray-900 dark:text-white' },
          { label: 'Available Tomorrow',value: log.availableTomorrow, color: 'text-blue-600 dark:text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}