from django.urls import path, include
from rest_framework_simplejwt import views as jwt_views
from .views import CreationProjetView, ModificationSuppressionProjetView, ProjetView, projet_detail
from project import views
urlpatterns = [
    path('creationProjet/', CreationProjetView.as_view(), name='Create_Projet'),
    path('projet/<int:id>/', views.projet_detail, name='projet_detail'),
     path('afficherProjet/', ProjetView.as_view(), name='list_projet'),
    path('modiffsuppProjet/<int:id>/', ModificationSuppressionProjetView.as_view(), name='modiffsuppProjet'),
]