from django.db.models import Q
from rest_framework import permissions, generics
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from project import serializers
from project.models import Projet
from .models import Tache
from .serializers import TacheSerializer
from .permission import AssignerTache, CreateurProjet, UtilisateurAssigne

#  lister les tâches créées par l'utilisateur
class TacheView(ListAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Tache.objects.filter(user=self.request.user)

#ajouter les taches
class AjoutTacheView(generics.ListCreateAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated, CreateurProjet, AssignerTache]

    def get_queryset(self):
        projet_id = self.kwargs.get('projet_id')
        if projet_id:
            return Tache.objects.filter(
                projet_id=projet_id
            ).filter(
                Q(user=self.request.user) | Q(assigned_to=self.request.user)
            )
        return Tache.objects.filter(
            Q(user=self.request.user) | Q(assigned_to=self.request.user)
        )

    def perform_create(self, serializer):
        try:
            projet_id = self.kwargs.get('projet_id') or self.request.data.get('projet_id')
            
            if not projet_id:
                raise serializers.ValidationError({'projet_id': 'Projet ID est requis'})
            
            try:
                Projet.objects.get(id=projet_id)
            except Projet.DoesNotExist:
                raise serializers.ValidationError({'projet_id': f'Projet avec ID {projet_id} inexistant'})
            serializer.save(user=self.request.user, projet_id=projet_id)
        except Exception as e:
            print(f"Error in perform_create: {str(e)}")
            raise

#modification, delete, listage
class ModificationSuppressionTacheView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated, CreateurProjet, AssignerTache]
    lookup_field = 'id'
    
    def get_queryset(self):
        projet_id = self.kwargs.get('projet_id')
        if projet_id:
            return Tache.objects.filter(projet_id=projet_id)
        return Tache.objects.filter(
            Q(user=self.request.user) | Q(assigned_to=self.request.user)
        )


class TachesParProjetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, projet_id):
        try:
            print(f"essayage de recuperation de tache pour le projet {projet_id}")
            print(f"actuelle user: {request.user.username}")
            try:
                project_exists = Projet.objects.filter(id=projet_id).exists()
                print(f"Projet {projet_id} existe: {project_exists}")
                if not project_exists:
                    return Response({"message": "Le projet n'existe pas."}, status=404)
            except Exception as e:
                print(f"verifier erreurs si le projet existe: {str(e)}")
                return Response({"message": f"verification erreur projet: {str(e)}"}, status=500)
            
            try:
                projet = Projet.objects.get(id=projet_id)
                print(f"Projet trouve: {projet.titre}")
                
               
                is_creator = projet.user == request.user
                is_member = projet.membres.filter(id=request.user.id).exists() if hasattr(projet, 'membres') else False
                print(f"User est createur: {is_creator}")
                print(f"User is membre: {is_member}")
                
                if not (is_creator or is_member):
                    return Response({"message": "pas la permission d'acceder à ce projet"}, status=403)
            except Exception as e:
                print(f"erreur de recuperation: {str(e)}")
                return Response({"message": f"erreur avec l'accés des projets: {str(e)}"}, status=500)
            
            try:
                taches = Tache.objects.filter(projet=projet)
                print(f"taches non trouve pour le projet {projet_id}: {taches.count()}")
            except Exception as e:
                print(f"erreur de recuperation des taches: {str(e)}")
                return Response({"message": f"erreur de recuperation des taches: {str(e)}"}, status=500)
            
          
            try:
                serializer = TacheSerializer(taches, many=True)
                return Response(serializer.data)
            except Exception as e:
                print(f"Error serializer taches: {str(e)}")
                return Response({"message": f"Error serializer taches: {str(e)}"}, status=500)
            
        except Exception as e:
            print(f"peut pas gerer les exceptions dans TachesParProjetView: {str(e)}")
            return Response({"message": f"serveur error: {str(e)}"}, status=500)
        
class TachesAssigneesUtilisateur(generics.ListAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            return Tache.objects.filter(assigned_to=self.request.user)
        except Exception as e:
            print(f"Erreur dans TachesAssigneesUtilisateur: {str(e)}")
            return Tache.objects.none()


class TachesAssigneesProjet(generics.ListAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated, UtilisateurAssigne]

    def get_queryset(self):
        try:
            projet_id = self.kwargs['projet_id']
            return Tache.objects.filter(
                projet_id=projet_id,
                assigned_to=self.request.user
            )
        except Exception as e:
            print(f"Erreur dans TachesAssigneesProjet pour le projet {self.kwargs.get('projet_id', 'unknown')}: {str(e)}")
            return Tache.objects.none()