from django.test import TestCase, Client
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from utilisateur.models import CustomUser
from .models import Projet
from .serializers import ProjetSerializers

class ProjetTestCase(TestCase):
    def setUp(self):
        # Configuration initiale pour les tests
        self.client = APIClient()
        
        # Créer un utilisateur pour les tests
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpass123'
        )
        
        # Authentifier l'utilisateur
        self.client.force_authenticate(user=self.user)
        
        # Créer un projet pour les tests
        self.projet = Projet.objects.create(
            titre='Projet Test',
            description='Description test',
            user=self.user
        )

    # Test du modèle Projet
    def test_projet_model_str(self):
        """Vérifie que la méthode __str__ retourne le titre du projet"""
        self.assertEqual(str(self.projet), 'Projet Test')

    # Test du serializer
    def test_projet_serializer(self):
        """Vérifie que le serializer fonctionne correctement"""
        serializer = ProjetSerializers(self.projet)
        data = serializer.data
        self.assertEqual(data['titre'], 'Projet Test')
        self.assertEqual(data['description'], 'Description test')
        self.assertIn('id', data)
        self.assertIn('date_creation', data)

    # Test de la vue ProjetView (liste des projets)
    def test_projet_list_view(self):
        """Vérifie que la vue renvoie la liste des projets de l'utilisateur"""
        url = reverse('list_projet')  # Utilise le nom défini dans urlpatterns
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Un seul projet créé
        self.assertEqual(response.data[0]['titre'], 'Projet Test')

    # Test de la vue projet_detail
    def test_projet_detail_view(self):
        """Vérifie que la vue renvoie les détails d'un projet spécifique"""
        url = reverse('projet_detail', args=[self.projet.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['titre'], 'Projet Test')

    def test_projet_detail_not_found(self):
        """Vérifie la réponse quand un projet n'existe pas"""
        url = reverse('projet_detail', args=[999])  # ID inexistant
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Projet non trouvé')

    # Test de la création d'un projet
    def test_creation_projet_view(self):
        """Vérifie que la création d'un projet fonctionne"""
        url = reverse('Create_Projet')
        data = {
            'titre': 'Nouveau Projet',
            'description': 'Nouvelle description'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Projet.objects.count(), 2)  # Deux projets maintenant
        self.assertEqual(response.data['titre'], 'Nouveau Projet')

    # Test de la modification d'un projet
    def test_modification_projet_view(self):
        """Vérifie que la modification d'un projet fonctionne"""
        url = reverse('modiffsuppProjet', args=[self.projet.id])
        data = {
            'titre': 'Projet Modifié',
            'description': 'Description modifiée'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.projet.refresh_from_db()
        self.assertEqual(self.projet.titre, 'Projet Modifié')

    # Test de la suppression d'un projet
    def test_suppression_projet_view(self):
        """Vérifie que la suppression d'un projet fonctionne"""
        url = reverse('modiffsuppProjet', args=[self.projet.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Projet.objects.count(), 0)

    # Test de l'accès non authentifié
    def test_unauthenticated_access(self):
        """Vérifie que les vues sont protégées contre les accès non authentifiés"""
        self.client.force_authenticate(user=None)  # Désauthentifier
        url = reverse('list_projet')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
