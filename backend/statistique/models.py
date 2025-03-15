from django.db import models

class StatistiquesPeriodiques(models.Model):
    PERIODE_CHOICES = [
        ('trimestriel', 'Trimestriel'),
        ('annuel', 'Annuel')
    ]
    utilisateur = models.ForeignKey('utilisateur.CustomUser', on_delete=models.CASCADE)
    periode_type = models.CharField(max_length=20, choices=PERIODE_CHOICES)
    debut_periode = models.DateField()
    fin_periode = models.DateField()
    nombre_taches_total = models.IntegerField(default=0)
    nombre_taches_completees = models.IntegerField(default=0)
    nombre_taches_dans_delai = models.IntegerField(default=0)
    pourcentage_completion = models.FloatField(default=0)
    pourcentage_dans_delai = models.FloatField(default=0)
    prime_eligible = models.BooleanField(default=False)
    montant_prime = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('utilisateur', 'periode_type', 'debut_periode')
    
    def __str__(self):
        return f"{self.utilisateur.username} - {self.periode_type} - {self.debut_periode}"