from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from datetime import datetime, timedelta
from .models import Tache
from statistique.views import calculer_statistiques_periodiques

@receiver(post_save, sender=Tache)
def update_stats_after_task_change(sender, instance, **kwargs):
    """Recalcule les statistiques après modification d'une tâche."""
    utilisateur = instance.assigned_to
    if utilisateur and utilisateur.role == 'professeur':
        now = datetime.now()
        debut_periode = now - timedelta(days=90)  # Pour une période trimestrielle
        calculer_statistiques_periodiques(
            utilisateur,
            debut_periode=debut_periode,
            fin_periode=now,
            recalcul_force=True
        )

@receiver(post_delete, sender=Tache)
def update_stats_after_task_delete(sender, instance, **kwargs):
    """Recalcule les statistiques après suppression d'une tâche."""
    utilisateur = instance.assigned_to
    if utilisateur and utilisateur.role == 'professeur':
        now = datetime.now()
        debut_periode = now - timedelta(days=90)  # Pour une période trimestrielle
        calculer_statistiques_periodiques(
            utilisateur,
            debut_periode=debut_periode,
            fin_periode=now,
            recalcul_force=True
        )