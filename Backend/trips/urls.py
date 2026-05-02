from django.urls import path
from .views import PlanTripView, TripListView, TripDetailView, LocationSearchView

urlpatterns = [
    path('plan-trip/', PlanTripView.as_view()),
    path('trips/',     TripListView.as_view()),
    path('trips/<int:pk>/', TripDetailView.as_view()),
        path("location/", LocationSearchView.as_view()),  # 👈 ADD THIS

    
]