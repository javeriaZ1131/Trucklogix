from django.db import models

# Create your models here.
from django.db import models

class Trip(models.Model):
    current_location  = models.CharField(max_length=200)
    pickup_location   = models.CharField(max_length=200)
    dropoff_location  = models.CharField(max_length=200)
    cycle_used        = models.FloatField(default=0)
    driver_name       = models.CharField(max_length=100, default='John Doe')
    carrier_name      = models.CharField(max_length=100, default='Logistics Inc')
    truck_number      = models.CharField(max_length=50,  default='T-100')
    trailer_number    = models.CharField(max_length=50,  default='TR-500')
    date              = models.DateField(auto_now_add=True)
    status            = models.CharField(max_length=20,  default='Planned')

    # Computed fields stored as JSON
    result            = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return f"Trip #{self.id}: {self.pickup_location} → {self.dropoff_location}"