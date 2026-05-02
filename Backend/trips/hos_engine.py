"""
FMCSA HOS Engine — Property Carrier 70hr/8-day ruleset
Assumptions:
  - 11hr driving limit per shift
  - 14hr on-duty window per shift
  - 30min break required after 8hrs driving
  - 10hr sleeper berth reset
  - Avg speed: 55 mph
  - Fuel stop every 1,000 miles
  - 1hr for pickup, 1hr for dropoff
"""

AVG_SPEED      = 55      # mph
FUEL_RANGE     = 1000    # miles between fuel stops
MAX_DRIVE      = 11.0    # hrs driving per shift
MAX_DUTY       = 14.0    # hrs on-duty window
BREAK_AFTER    = 8.0     # hrs before mandatory 30min break
BREAK_DUR      = 0.5     # hrs (30 min)
RESET_DUR      = 10.0    # hrs sleeper berth reset
PICKUP_DUR     = 1.0     # hrs
DROPOFF_DUR    = 1.0     # hrs
CYCLE_LIMIT    = 70.0    # hrs / 8 days


def geocode_location(location: str):
    """
    Simple geocoder using Nominatim (free, no API key).
    Returns (lat, lon) or raises ValueError.
    """
    import urllib.request, urllib.parse, json, time
    query = urllib.parse.urlencode({'q': location, 'format': 'json', 'limit': 1})
    url   = f"https://nominatim.openstreetmap.org/search?{query}"
    req   = urllib.request.Request(url, headers={'User-Agent': 'TruckLogix/1.0 javeriazulfiqar490@gmail.com'})
    with urllib.request.urlopen(req, timeout=8) as r:
        data = json.loads(r.read())
    if not data:
        raise ValueError(f"Could not geocode: {location}")
    time.sleep(1)   # Nominatim rate limit: 1 req/sec
    return float(data[0]['lat']), float(data[0]['lon'])


def haversine(lat1, lon1, lat2, lon2) -> float:
    """Great-circle distance in miles."""
    import math
    R  = 3958.8
    d1 = math.radians(lat2 - lat1)
    d2 = math.radians(lon2 - lon1)
    a  = (math.sin(d1/2)**2 +
          math.cos(math.radians(lat1)) *
          math.cos(math.radians(lat2)) *
          math.sin(d2/2)**2)
    return R * 2 * math.asin(math.sqrt(a))


def interpolate_coord(c1, c2, fraction):
    return [
        c1[0] + (c2[0] - c1[0]) * fraction,
        c1[1] + (c2[1] - c1[1]) * fraction,
    ]


def plan_trip(current_location, pickup_location, dropoff_location, cycle_used=0):
    """
    Main planning function. Returns full trip result dict.
    """
    # --- Geocode all three locations ---
    start_coords   = geocode_location(current_location)
    pickup_coords  = geocode_location(pickup_location)
    dropoff_coords = geocode_location(dropoff_location)

    # --- Compute segment distances ---
    dist_to_pickup   = haversine(*start_coords,   *pickup_coords)
    dist_to_dropoff  = haversine(*pickup_coords,  *dropoff_coords)
    total_distance   = dist_to_pickup + dist_to_dropoff

    # --- Build waypoints list ---
    # Each waypoint: {type, label, location, miles, coords, duration_hrs}
    waypoints = [
        {
            'type': 'start', 'label': 'Start',
            'location': current_location,
            'miles': 0,
            'coords': list(start_coords),
            'duration_hrs': 0,
            'note': '',
        },
        {
            'type': 'pickup', 'label': 'Pickup',
            'location': pickup_location,
            'miles': round(dist_to_pickup),
            'coords': list(pickup_coords),
            'duration_hrs': PICKUP_DUR,
            'note': f'1 hour for pickup',
        },
        {
            'type': 'dropoff', 'label': 'Dropoff',
            'location': dropoff_location,
            'miles': round(total_distance),
            'coords': list(dropoff_coords),
            'duration_hrs': DROPOFF_DUR,
            'note': '1 hour for dropoff',
        },
    ]

    # --- Insert fuel stops every 1,000 miles ---
    fuel_stops = []
    for threshold in range(FUEL_RANGE, int(total_distance), FUEL_RANGE):
        # Find which segment this falls on
        if threshold < dist_to_pickup:
            frac   = threshold / dist_to_pickup
            coords = interpolate_coord(start_coords, pickup_coords, frac)
            seg    = 'en route to pickup'
        else:
            frac   = (threshold - dist_to_pickup) / dist_to_dropoff
            coords = interpolate_coord(pickup_coords, dropoff_coords, frac)
            seg    = 'en route to dropoff'
        fuel_stops.append({
            'type': 'fuel', 'label': 'Fuel Stop',
            'location': f'Fuel Stop (~{threshold:,} mi)',
            'miles': threshold,
            'coords': coords,
            'duration_hrs': 0.5,
            'note': f'Fueling at {threshold:,} mi',
        })

    # Merge and sort by miles
    all_points = sorted(waypoints + fuel_stops, key=lambda x: x['miles'])

    # --- HOS simulation ---
    # State machine simulating the driver's day
    eld_logs       = []
    day            = 1
    clock          = 6.0       # Start at 6:00 AM
    drive_today    = 0.0
    duty_today     = 0.0
    drive_since_break = 0.0
    cycle_hours    = float(cycle_used)
    route_coords   = [list(start_coords)]

    current_day_entries  = []
    current_day_timeline = []

    def to_time_str(decimal_hour):
        h = int(decimal_hour % 24)
        m = int((decimal_hour % 1) * 60)
        suffix = 'AM' if h < 12 else 'PM'
        hh = h % 12 or 12
        return f"{hh:02d}:{m:02d} {suffix}"

    def add_entry(status, start, end, location, notes=''):
        duration = end - start
        hh = int(duration)
        mm = int((duration % 1) * 60)
        current_day_entries.append({
            'status':   status,
            'start':    to_time_str(start),
            'end':      to_time_str(end),
            'duration': f"{hh:02d}:{mm:02d}",
            'location': location,
            'notes':    notes,
        })

    def add_timeline(status_idx, start, end):
        current_day_timeline.append({
            'status':    status_idx,
            'startHour': round(start % 24, 3),
            'endHour':   round(end   % 24, 3),
        })

    def finish_day(driving, on_duty, off_sleep, total_od, available):
        dd = int(driving); dm = int((driving % 1) * 60)
        od = int(on_duty);  om = int((on_duty  % 1) * 60)
        os = int(off_sleep);osm= int((off_sleep% 1) * 60)
        to = int(total_od); tom= int((total_od % 1) * 60)
        av = max(0, min(11, available))
        aav = int(av); avm = int((av % 1) * 60)
        return {
            'day':              day,
            'date':             None,  # filled later
            'drivingTime':      f"{dd:02d}:{dm:02d}",
            'onDutyTime':       f"{od:02d}:{om:02d}",
            'offDutySleeper':   f"{os:02d}:{osm:02d}",
            'totalOnDuty':      f"{to:02d}:{tom:02d}",
            'availableTomorrow':f"{aav:02d}:{avm:02d}",
            'entries':          list(current_day_entries),
            'timeline':         list(current_day_timeline),
        }

    stops_summary = []
    stops_summary.append(all_points[0])  # start

    # Pre-trip inspection
    add_entry('On Duty (Not Driving)', clock, clock + 1, current_location, 'Pre-trip inspection')
    add_timeline(3, clock, clock + 1)
    duty_today += 1
    cycle_hours += 1
    clock += 1

    for seg_idx in range(1, len(all_points)):
        prev = all_points[seg_idx - 1]
        curr = all_points[seg_idx]

        miles_remaining = curr['miles'] - prev['miles']
        drive_hours     = miles_remaining / AVG_SPEED

        seg_start_loc = prev['location']
        seg_end_loc   = curr['location']
        miles_driven_in_seg = 0.0

        # Drive in chunks respecting HOS limits
        while drive_hours > 0.001:
            # How much can we drive now?
            can_drive = min(
                MAX_DRIVE  - drive_today,
                MAX_DUTY   - duty_today,
                BREAK_AFTER - drive_since_break,
                CYCLE_LIMIT - cycle_hours,
                drive_hours,
            )

            if can_drive <= 0.001:
                # Need a break or reset
                if drive_since_break >= BREAK_AFTER and duty_today < MAX_DUTY:
                    # 30-min break
                    add_entry('On Duty (Not Driving)', clock, clock + BREAK_DUR, seg_end_loc, '30-min rest break')
                    add_timeline(3, clock, clock + BREAK_DUR)
                    clock      += BREAK_DUR
                    duty_today += BREAK_DUR
                    cycle_hours += BREAK_DUR
                    drive_since_break = 0
                    continue
                else:
                    # 10-hr sleeper berth reset
                    sleeper_start = clock
                    sleeper_end   = clock + RESET_DUR

                    day_drive_total = drive_today
                    day_duty_total  = duty_today
                    off_total       = 24 - day_duty_total - (sleeper_start % 24 - (6.0 if day == 1 else 6.0))
                    log = finish_day(day_drive_total, day_duty_total - day_drive_total,
                                     RESET_DUR, day_duty_total,
                                     MAX_DRIVE - day_drive_total)
                    add_entry('Sleeper Berth', sleeper_start, sleeper_end, seg_end_loc, '10-hr reset')
                    add_timeline(1, sleeper_start % 24, sleeper_end % 24)
                    log['entries']  = list(current_day_entries)
                    log['timeline'] = list(current_day_timeline)
                    eld_logs.append(log)

                    # New day
                    day  += 1
                    clock = sleeper_end
                    drive_today       = 0
                    duty_today        = 0
                    drive_since_break = 0
                    current_day_entries.clear()
                    current_day_timeline.clear()
                    continue

            # Drive the chunk
            drive_start = clock
            clock          += can_drive
            drive_today    += can_drive
            duty_today     += can_drive
            cycle_hours    += can_drive
            drive_since_break += can_drive
            drive_hours    -= can_drive

            frac = can_drive / (curr['miles'] - prev['miles']) * AVG_SPEED / AVG_SPEED
            route_coords.append(list(curr['coords']))

            add_entry('Driving', drive_start, clock, f"{seg_start_loc} → {seg_end_loc}")
            add_timeline(2, drive_start % 24, clock % 24)

        # Arrived at waypoint — handle stop duration
        if curr['duration_hrs'] > 0:
            stop_start = clock
            status_label = {
                'pickup':  'On Duty (Not Driving)',
                'dropoff': 'On Duty (Not Driving)',
                'fuel':    'On Duty (Not Driving)',
            }.get(curr['type'], 'On Duty (Not Driving)')

            add_entry(status_label, stop_start, stop_start + curr['duration_hrs'],
                      curr['location'], curr['note'])
            add_timeline(3, stop_start % 24, (stop_start + curr['duration_hrs']) % 24)
            duty_today  += curr['duration_hrs']
            cycle_hours += curr['duration_hrs']
            clock       += curr['duration_hrs']

        stops_summary.append(curr)

    # Final day log
    if current_day_entries:
        day_drive = sum(
            float(e['duration'].split(':')[0]) + float(e['duration'].split(':')[1])/60
            for e in current_day_entries if e['status'] == 'Driving'
        )
        day_duty  = sum(
            float(e['duration'].split(':')[0]) + float(e['duration'].split(':')[1])/60
            for e in current_day_entries
            if e['status'] in ('Driving', 'On Duty (Not Driving)')
        )
        log = finish_day(day_drive, day_duty - day_drive, 24 - day_duty,
                         day_duty, MAX_DRIVE - day_drive)
        log['entries']  = list(current_day_entries)
        log['timeline'] = list(current_day_timeline)
        eld_logs.append(log)

    total_days    = len(eld_logs)
    total_drive_h = sum(
        float(l['drivingTime'].split(':')[0]) + float(l['drivingTime'].split(':')[1])/60
        for l in eld_logs
    )
    total_duty_h  = sum(
        float(l['totalOnDuty'].split(':')[0]) + float(l['totalOnDuty'].split(':')[1])/60
        for l in eld_logs
    )
    td = int(total_drive_h); tm = int((total_drive_h % 1) * 60)

    return {
        'distance':      round(total_distance),
        'duration':      f"{total_days} day{'s' if total_days > 1 else ''}",
        'drivingTime':   f"{td:02d} hrs {tm:02d} min",
        'totalDays':     total_days,
        'stops':         len(stops_summary),
        'fuelStops':     len([s for s in stops_summary if s['type'] == 'fuel']),
        'stopsSummary':  stops_summary,
        'routeCoords':   route_coords,
        'eldLogs':       eld_logs,
    }