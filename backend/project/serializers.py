from rest_framework import serializers
from .models import Projet

class ProjetSerializers(serializers.ModelSerializer):
    class Meta:
        model = Projet
        fields = ['id', 'titre', 'description', 'date_creation']

        