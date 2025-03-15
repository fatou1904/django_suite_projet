from django.db import models
from django.utils import timezone
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear

class Tache(models.Model):
    STATUT_CHOICES = [
        ('À faire', 'À faire'), 
        ('En cours', 'En cours'),
        ('Terminé', 'Terminé')
    ]
    titre = models.CharField(max_length=50)
    description = models.CharField(max_length=100)
    date_creation = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='À faire')
    user = models.ForeignKey('utilisateur.CustomUser', on_delete=models.CASCADE, related_name='taches_creees')
    assigned_to = models.ForeignKey('utilisateur.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='taches_assignees')
    progression = models.IntegerField(default=0)
    projet = models.ForeignKey('project.Projet', on_delete=models.CASCADE, related_name='taches', null=True, blank=True)
    date_echeance = models.DateTimeField(null=True, blank=True)
    date_fin_reelle = models.DateTimeField(null=True, blank=True)
    termine_dans_delai = models.BooleanField(default=False)
    
    def __str__(self):
        return self.titre
    
    def save(self, *args, **kwargs):
        if self.progression == 100:
            self.statut = 'Terminé'
            self.date_fin_reelle = timezone.now()
            
            if self.date_echeance and self.date_fin_reelle <= self.date_echeance:
                self.termine_dans_delai = True
        
        super().save(*args, **kwargs)