from rest_framework import permissions
from project.models import Projet

class CreateurProjet(permissions.BasePermission):
    """
    Permission qui vérifie si l'utilisateur peut créer ou modifier un projet et ses éléments.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Les professeurs ont tous les droits
        if request.user.groups.filter(name='Professeur').exists():
            return True
            
        # la création d'un nouveau projet
        if getattr(view, '__class__', None) and 'Projet' in view.__class__.__name__ and request.method == 'POST':
            return request.user.is_authenticated and request.user.groups.filter(name='Etudiant').exists()
        
        projet_id = getattr(view, 'kwargs', {}).get('projet_id')  
        if not projet_id and request.data.get('projet_id'):
            projet_id = request.data.get('projet_id')
            
        if projet_id:
            try:
                projet = Projet.objects.get(id=projet_id)
                if request.user.groups.filter(name='Etudiant').exists():
                    return (projet.user == request.user or 
                            (hasattr(projet, 'membres') and 
                             projet.membres.filter(id=request.user.id).exists()))
                return True 
            except Projet.DoesNotExist:
                return False
                
        return False
        
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if request.user.groups.filter(name='Professeur').exists():
            return True
            
        if request.user.groups.filter(name='Etudiant').exists():
            projet = None
            if hasattr(obj, 'projet_id'):
                try:
                    projet = Projet.objects.get(id=obj.projet_id)
                except Projet.DoesNotExist:
                    return False
            
            if projet:
                return (projet.user == request.user or
                        (hasattr(projet, 'membres') and
                         projet.membres.filter(id=request.user.id).exists()))
                
        return False


class UtilisateurAssigne(permissions.BasePermission):
    """
    Permission qui vérifie si l'utilisateur est assigné à une tâche.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if request.user.groups.filter(name='Professeur').exists():
            return True
            
        if not request.user.groups.filter(name='Etudiant').exists():
            return False
            
        if 'Tache' not in view.__class__.__name__:
            return False
            
        projet_id = getattr(view, 'kwargs', {}).get('projet_id')  
        if not projet_id and request.data.get('projet_id'):
            projet_id = request.data.get('projet_id')
            
        if projet_id:
            try:
                projet = Projet.objects.get(id=projet_id)
                return projet.membres.filter(id=request.user.id).exists()
            except Projet.DoesNotExist:
                return False
            
        return False
        

class AssignerTache(permissions.BasePermission):
    """
    Permission qui contrôle qui peut assigner des tâches et à qui.
    """
    def has_permission(self, request, view):
        if request.method == 'POST':
            projet_id = getattr(view, 'kwargs', {}).get('projet_id')
            if not projet_id and request.data.get('projet_id'):
                projet_id = request.data.get('projet_id')
                
            if projet_id:
                try:
                    projet = Projet.objects.get(id=projet_id)
                    return (projet.user == request.user or
                            (hasattr(projet, 'membres') and 
                             projet.membres.filter(id=request.user.id).exists()))
                except Projet.DoesNotExist:
                    return False
        
        return True  
        
    def has_object_permission(self, request, view, obj):
        if request.method not in ['PUT', 'PATCH'] or 'assigned_to' not in request.data:
            return True
        
        if request.user.groups.filter(name='Professeur').exists():
            return True
            
        projet = None
        if hasattr(obj, 'projet_id'):
            try:
                projet = Projet.objects.get(id=obj.projet_id)
            except Projet.DoesNotExist:
                return False
        
        if not projet:
            return False
            
        # Autoriser le créateur du projet à assigner des tâches
        is_creator = projet.user == request.user
        if not is_creator:
            return False  
            
        assigned_to = request.data.get('assigned_to')
        if not assigned_to:
            return True  
        
        try:
            from utilisateur.models import CustomUser
            assigned_user = CustomUser.objects.get(id=assigned_to)
            return (projet.membres.filter(id=assigned_user.id).exists() or 
                    projet.user == assigned_user)
        except CustomUser.DoesNotExist:
            return False