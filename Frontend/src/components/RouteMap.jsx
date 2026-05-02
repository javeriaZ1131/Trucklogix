import { useEffect, useRef } from 'react'
import { STOP_COLORS } from '../data/staticData'

// Leaflet is loaded via CDN in index.html
// This component renders an OpenStreetMap via Leaflet

export default function RouteMap({ trip }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (!window.L || !mapRef.current || mapInstance.current) return

    const L = window.L
    const stops = trip.stops_summary
    const coords = trip.routeCoords

    // Compute center
    const avgLat = coords.reduce((s, c) => s + c[0], 0) / coords.length
    const avgLng = coords.reduce((s, c) => s + c[1], 0) / coords.length

    const map = L.map(mapRef.current, { zoomControl: true }).setView([avgLat, avgLng], 5)
    mapInstance.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    // Draw polyline
    L.polyline(coords, { color: '#3b82f6', weight: 3, opacity: 0.85 }).addTo(map)
console.log('stops:', JSON.stringify(stops, null, 2))
    // Add markers
    stops.forEach((stop) => {
      const color = STOP_COLORS[stop.type]?.dot || '#6b7280'
      const [lat, lng] = stop.coords ?? []
if (lat == null || lng == null) return
     // const coord = coords[Math.min(i, coords.length - 1)]

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:14px;height:14px;border-radius:50%;
          background:${color};border:2.5px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,0.3)
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      
      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${stop.label}</b><br>${stop.location}<br><small>${stop.miles} mi from start</small>`)
    })

    // Fit bounds
    if (coords.length > 1) {
      map.fitBounds(L.latLngBounds(coords), { padding: [30, 30] })
    }

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [trip])

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 320, borderRadius: 8, zIndex: 0 }} />
  )
}