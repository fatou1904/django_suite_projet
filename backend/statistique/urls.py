from django.urls import path
from .views import StatistiquesViewSet

urlpatterns = [
    path('statistique/', StatistiquesViewSet.as_view({'get': 'list'}), name='statistiques'),
    path('statistique/projet/<int:projet_id>/', 
         StatistiquesViewSet.as_view({'get': 'projet_stats'}), 
         name='statistiques_projet'),
]
