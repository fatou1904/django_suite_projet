from django.db.models import Q
from rest_framework import permissions, generics
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from project import serializers
from .models import Tache
from .serializers import TacheSerializer
from .permission import AssignerTache, CreateurProjet, UtilisateurAssigne

class TacheView(ListAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Tache.objects.filter(user=self.request.user)

class AjoutTacheView(generics.ListCreateAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated, CreateurProjet, AssignerTache]

    def get_queryset(self):
        projet_id = self.kwargs.get('projet_id')
        if projet_id:
            from project.models import Projet
            return Tache.objects.filter(projet_id=projet_id).filter(
                Q(user=self.request.user) | Q(assigned_to=self.request.user)
            )
        return Tache.objects.filter(Q(user=self.request.user) | Q(assigned_to=self.request.user))

    def perform_create(self):
        from project.models import Projet
        try:
            projet_id = self.kwargs.get('projet_id') or self.request.data.get('projet_id')
            if not projet_id:
                raise serializers.ValidationError({'projet_id': 'Projet ID est requis'})
            try:
                Projet.objects.get(id=projet_id)
            except Projet.DoesNotExist:
                raise serializers.ValidationError({'projet_id': f'Projet avec ID {projet_id} inexistant'})
            serializer = self.get_serializer(data=self.request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=self.request.user, projet_id=projet_id)
        except Exception as e:
            raise serializers.ValidationError({'general': f'Erreur lors de la création: {str(e)}'})

class ModificationSuppressionTacheView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated, CreateurProjet, AssignerTache]
    lookup_field = 'id'
    
    def get_queryset(self):
        from project.models import Projet
        projet_id = self.kwargs.get('projet_id')
        if projet_id:
            return Tache.objects.filter(projet_id=projet_id)
        return Tache.objects.filter(Q(user=self.request.user) | Q(assigned_to=self.request.user))

class TachesParProjetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, projet_id):
        from project.models import Projet
        try:
            projet = Projet.objects.get(id=projet_id)
            if not (projet.user == request.user or (hasattr(projet, 'membres') and projet.membres.filter(id=request.user.id).exists())):
                return Response({"message": "pas la permission d'accéder à ce projet"}, status=403)
            taches = Tache.objects.filter(projet=projet)
            serializer = TacheSerializer(taches, many=True)
            return Response(serializer.data)
        except Projet.DoesNotExist:
            return Response({"message": "Le projet n'existe pas."}, status=404)

class TachesAssigneesUtilisateur(generics.ListAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tache.objects.filter(assigned_to=self.request.user)

class TachesAssigneesProjet(generics.ListAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated, UtilisateurAssigne]

    def get_queryset(self):
        projet_id = self.kwargs['projet_id']
        return Tache.objects.filter(projet_id=projet_id, assigned_to=self.request.user)