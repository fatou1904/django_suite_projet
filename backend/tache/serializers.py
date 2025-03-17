from rest_framework import serializers
from .models import Tache
from utilisateur.models import CustomUser
from project.models import Projet

# In serializers.py

class TacheSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.SerializerMethodField(read_only=True)
    projet_id = serializers.IntegerField(required=True)  
    projet_createur_id = serializers.SerializerMethodField(read_only=True)
    
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = Tache
        fields = [
            'id',
            'titre',
            'description',
            'date_creation',
            'statut',
            'user',
            'assigned_to',
            'assigned_to_username',
            'progression',
            'projet_id',
            'projet_createur_id',
            'date_echeance',
            'date_fin_reelle',
            'termine_dans_delai'
        ]
        read_only_fields = ('user', 'date_creation', 'date_fin_reelle', 'termine_dans_delai')
    def get_assigned_to_username(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.username
        return None
    
    def get_projet_createur_id(self, obj):
        if obj.projet_id:
            try:
                projet = Projet.objects.get(id=obj.projet_id)
                if projet.user:
                    return projet.user.id
            except Projet.DoesNotExist:
                pass
        return None

    def create(self, validated_data):
        try:
            user = self.context['request'].user
            validated_data['user'] = user
            
            if 'projet_id' not in validated_data:
                view = self.context.get('view')
                if view and hasattr(view, 'kwargs'):
                    projet_id = view.kwargs.get('projet_id')
                    if projet_id:
                        validated_data['projet_id'] = projet_id
                else:
                    request = self.context.get('request')
                    if request and hasattr(request, 'data'):
                        projet_id = request.data.get('projet_id')
                        if projet_id:
                            validated_data['projet_id'] = projet_id
            
            if 'projet_id' not in validated_data:
                raise serializers.ValidationError({'projet_id': 'Le projet est requis'})
            
           
            try:
                projet_id = validated_data['projet_id']
                Projet.objects.get(id=projet_id)
            except Projet.DoesNotExist:
                raise serializers.ValidationError({'projet_id': f'Projet avec ID {projet_id} inexistant'})
            
            
            return Tache.objects.create(**validated_data)
        except Exception as e:
            print(f"Erreur lors de la création de la tâche: {str(e)}")
            if isinstance(e, serializers.ValidationError):
                raise
            raise serializers.ValidationError({'general': f'Erreur lors de la création: {str(e)}'})
    def update(self, instance, validated_data):
        try:
            instance.titre = validated_data.get('titre', instance.titre)
            instance.description = validated_data.get('description', instance.description)
            instance.statut = validated_data.get('statut', instance.statut)
            instance.progression = validated_data.get('progression', instance.progression)
            
           
            data = self.context['request'].data
            if 'projet_id' in data:
                try:
                    projet_id = data['projet_id']
                    projet = Projet.objects.get(id=projet_id)
                    instance.projet = projet
                except Projet.DoesNotExist:
                    raise serializers.ValidationError({'projet_id': f'Projet avec ID {projet_id} inexistant'})
            
            if 'assigned_to' in validated_data:
                instance.assigned_to = validated_data.get('assigned_to')
            if 'date_echeance' in validated_data:
                instance.date_echeance = validated_data.get('date_echeance')
                
            instance.save()
            return instance
        except Exception as e:
            print(f"Erreur lors de la mise à jour de la tâche: {str(e)}")
            if isinstance(e, serializers.ValidationError):
                raise
            raise serializers.ValidationError({'general': f'Erreur lors de la mise à jour: {str(e)}'})