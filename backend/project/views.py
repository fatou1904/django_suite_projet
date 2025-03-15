from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render
from rest_framework.generics import ListAPIView
from  rest_framework import generics, permissions
from .serializers import ProjetSerializers
from rest_framework.decorators import api_view
from .models import Projet
# Create your views here.

class ProjetView(ListAPIView):
    serializer_class = ProjetSerializers
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Projet.objects.filter(user = self.request.user)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def projet_detail(request, id):
    try:
        projet = Projet.objects.get(id=id)
        serializer = ProjetSerializers(projet)
        return Response(serializer.data)  
    except Projet.DoesNotExist:
        return Response({"error": "Projet non trouvé"}, status=404) 

class CreationProjetView(generics.CreateAPIView):
    serializer_class = ProjetSerializers
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(user = self.request.user)

class ModificationSuppressionProjetView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjetSerializers
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    def get_queryset(self):
        return Projet.objects.filter(user = self.request.user)
