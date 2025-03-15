from django.urls import path, include
from rest_framework_simplejwt import views as jwt_views
from .views import  AjoutTacheView, ModificationSuppressionTacheView, TacheView, TachesAssigneesProjet, TachesAssigneesUtilisateur, TachesParProjetView
urlpatterns = [
    path('ajouterTache/', AjoutTacheView.as_view(), name='taches-list-create'),
     path('taches/', TacheView.as_view(), name='taches-list'),
    path('modiffsupp/<int:id>/', ModificationSuppressionTacheView.as_view(), name='tache-detail'),
    path('taches/projet/<int:projet_id>/', TachesParProjetView.as_view(), name='taches_par_projet'),
    path('assignees/', TachesAssigneesUtilisateur.as_view(), name='taches-assignees'),
    path('assignees/projet/<int:projet_id>/', TachesAssigneesProjet.as_view(), name='taches-assignees-projet'),
    
]