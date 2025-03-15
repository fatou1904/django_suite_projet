from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Sum
from datetime import datetime, timedelta
from project import models
from tache.models import Tache
from project.models import Projet
from statistique.models import StatistiquesPeriodiques
from statistique.serializer import StatistiquesPeriodiquesSerializer
from utilisateur.models import CustomUser
import logging

logger = logging.getLogger(__name__)

class StatistiquesViewSet(viewsets.ModelViewSet):
    queryset = StatistiquesPeriodiques.objects.all()
    serializer_class = StatistiquesPeriodiquesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return StatistiquesPeriodiques.objects.all()
        elif user.role == 'professeur':
            return StatistiquesPeriodiques.objects.filter(utilisateur=user)
        return StatistiquesPeriodiques.objects.none()
    
    def list(self, request):
        """Renvoie les statistiques globales de l'utilisateur connecté."""
        user = request.user
        
        # Vérification des permissions
        if not user.is_staff and not user.is_superuser and user.role != 'professeur':
            logger.warning(f"User {user.username} tried to access statistics without permission.")
            return Response({"detail": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)
        
        # Récupérer les statistiques existantes
        queryset = self.get_queryset()
        if queryset.exists():
            stats = queryset.order_by('-debut_periode').first()
            serializer = self.get_serializer(stats)
            return Response(serializer.data)
        
        # Calculer les statistiques à la volée
        now = datetime.now()
        debut_periode = now - timedelta(days=90)
        
        # Obtenir les tâches créées par l'utilisateur et assignées
        taches = Tache.objects.filter(user=user) | Tache.objects.filter(assigned_to=user)



        logger.info(f"User {user.username} has {taches.count()} tasks assigned.")
        
        if not taches.exists():
            return Response({
                "nombre_taches_total": 0,
                "nombre_taches_completees": 0,
                "nombre_taches_dans_delai": 0,
                "pourcentage_completion": 0,
                "pourcentage_dans_delai": 0,
                "prime_eligible": False,
                "montant_prime": 0
            })
        
        total_taches = taches.count()
        taches_completees = taches.filter(statut='Terminé').count()
        taches_dans_delai = taches.filter(termine_dans_delai=True).count() if hasattr(Tache, 'termine_dans_delai') else 0
        
        pourcentage_completion = (taches_completees / total_taches) * 100 if total_taches > 0 else 0
        pourcentage_dans_delai = (taches_dans_delai / total_taches) * 100 if total_taches > 0 else 0
        
        prime_eligible = pourcentage_dans_delai >= 90
        montant_prime = 100000 if pourcentage_dans_delai == 100 else 30000 if pourcentage_dans_delai >= 90 else 0
        
        stats_data = {
            "utilisateur": user.id,
            "utilisateur_username": user.username,
            "periode_type": "trimestriel",
            "debut_periode": debut_periode,
            "fin_periode": now,
            "nombre_taches_total": total_taches,
            "nombre_taches_completees": taches_completees,
            "nombre_taches_dans_delai": taches_dans_delai,
            "pourcentage_completion": pourcentage_completion,
            "pourcentage_dans_delai": pourcentage_dans_delai,
            "prime_eligible": prime_eligible,
            "montant_prime": montant_prime
        }
        
        return Response(stats_data)
    
    @action(detail=False, methods=['post'])
    def recalculer(self, request):
        """Force le recalcul des statistiques pour l'utilisateur."""
        user = request.user
        
        if user.role != 'professeur' and not user.is_staff and not user.is_superuser:
            return Response({"detail": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)
        
        now = datetime.now()
        debut_periode = now - timedelta(days=90)
        
        stats = calculer_statistiques_periodiques(user, debut_periode, now, 'trimestriel')
        
        if stats:
            return Response(stats)
        return Response({"detail": "Impossible de calculer les statistiques"}, status=status.HTTP_400_BAD_REQUEST)

def calculer_statistiques_periodiques(user, debut_periode, fin_periode, frequence):
    taches = Tache.objects.filter(assigned_to=user, date_creation__gte=debut_periode, date_creation__lte=fin_periode)
    
    nombre_taches_total = taches.count()
    nombre_taches_completees = taches.filter(statut="Terminé").count()
    nombre_taches_dans_delai = taches.filter(termine_dans_delai=True).count() if hasattr(Tache, 'termine_dans_delai') else 0
    
    pourcentage_completion = (nombre_taches_completees / nombre_taches_total) * 100 if nombre_taches_total else 0
    pourcentage_dans_delai = (nombre_taches_dans_delai / nombre_taches_total) * 100 if nombre_taches_total else 0
    
    prime_eligible = pourcentage_dans_delai >= 90
    montant_prime = 100000 if pourcentage_dans_delai == 100 else 30000 if pourcentage_dans_delai >= 90 else 0
    
    return {
        "nombre_taches_total": nombre_taches_total,
        "nombre_taches_completees": nombre_taches_completees,
        "nombre_taches_dans_delai": nombre_taches_dans_delai,
        "pourcentage_completion": pourcentage_completion,
        "pourcentage_dans_delai": pourcentage_dans_delai,
        "prime_eligible": prime_eligible,
        "montant_prime": montant_prime
    }
