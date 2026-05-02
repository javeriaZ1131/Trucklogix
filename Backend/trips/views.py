from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Trip
from .serializers import TripSerializer, TripPlanRequestSerializer
from .hos_engine import plan_trip
import requests
from datetime import date, timedelta
class PlanTripView(APIView):
    """POST /api/plan-trip/ — geocode, calculate HOS, save and return full result."""

    def post(self, request):
        ser = TripPlanRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        d = ser.validated_data
        try:
            result = plan_trip(
                d['currentLocation'],
                d['pickupLocation'],
                d['dropoffLocation'],
                d['cycleUsed'],
            )
            trip_date = date.today()
            for i, log in enumerate(result['eldLogs']):
                log['date'] = (trip_date + timedelta(days=i)).isoformat()
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Planning failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        trip = Trip.objects.create(
            current_location = d['currentLocation'],
            pickup_location  = d['pickupLocation'],
            dropoff_location = d['dropoffLocation'],
            cycle_used       = d['cycleUsed'],
            driver_name      = d['driverName'],
            carrier_name     = d['carrierName'],
            truck_number     = d['truckNumber'],
            trailer_number   = d['trailerNumber'],
            result           = result,
        )

        return Response({
            'id':     trip.id,
            'trip':   TripSerializer(trip).data,
            'result': result,
        }, status=status.HTTP_201_CREATED)


class TripListView(APIView):
    """GET /api/trips/ — list all trips."""

    def get(self, request):
        trips = Trip.objects.all()
        return Response(TripSerializer(trips, many=True).data)


class TripDetailView(APIView):
    """GET /api/trips/:id/  DELETE /api/trips/:id/"""

    def get(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk)
        except Trip.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'trip':   TripSerializer(trip).data,
            'result': trip.result,
        })

    def delete(self, request, pk):
        try:
            Trip.objects.get(pk=pk).delete()
        except Trip.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class LocationSearchView(APIView):
    def get(self, request):
        query = request.GET.get("q")

        if not query:
            return Response(
                {"error": "Query parameter 'q' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            url = "https://nominatim.openstreetmap.org/search"

            headers = {
                "User-Agent": "Trucklogix/1.0 javeriazulfiqar490@gmail.com"
            }

            params = {
                "format": "json",
                "q": query,
                "limit": 5
            }

            res = requests.get(url, headers=headers, params=params)
            data = res.json()

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )