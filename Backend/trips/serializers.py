from rest_framework import serializers
from .models import Trip

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Trip
        fields = '__all__'

class TripPlanRequestSerializer(serializers.Serializer):
    currentLocation  = serializers.CharField()
    pickupLocation   = serializers.CharField()
    dropoffLocation  = serializers.CharField()
    cycleUsed        = serializers.FloatField(default=0)
    driverName       = serializers.CharField(default='John Doe')
    carrierName      = serializers.CharField(default='Logistics Inc')
    truckNumber      = serializers.CharField(default='T-100')
    trailerNumber    = serializers.CharField(default='TR-500')