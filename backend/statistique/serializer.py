from rest_framework import serializers
from .models import StatistiquesPeriodiques

class StatistiquesPeriodiquesSerializer(serializers.ModelSerializer):
    utilisateur_username = serializers.CharField(source='utilisateur.username', read_only=True)

    class Meta:
        model = StatistiquesPeriodiques
        fields = [
            'id',
            'utilisateur',
            'utilisateur_username',
            'periode_type',
            'debut_periode',
            'fin_periode',
            'nombre_taches_total',
            'nombre_taches_completees',
            'nombre_taches_dans_delai',
            'pourcentage_completion',
            'pourcentage_dans_delai',
            'prime_eligible',
            'montant_prime'
        ]
        read_only_fields = fields
