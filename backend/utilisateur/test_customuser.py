from django.test import TestCase, Client
from django.urls import reverse, resolve
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import Group
from .models import CustomUser
from .serializers import CustomUserSerializers, UserRegistrationSerializer
from .views import (
    CustomUserViewSet,
    LogoutView,
    ProfileView,
    RegisterView,
    ModificationProfileView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

class ComprehensiveTests(TestCase):
    def setUp(self):
        # Initialisation du client de test
        self.client = APIClient()

        # Création des groupes pour les tests
        Group.objects.create(name='Professeur')
        Group.objects.create(name='Etudiant')

        # Création d'un utilisateur étudiant
        self.etudiant = CustomUser.objects.create(
            username='etudiant1',
            first_name='Jean',
            last_name='Dupont',
            email='jean.dupont@example.com',
            role=CustomUser.ETUDIANT
        )
        self.etudiant.set_password('test123')
        self.etudiant.save()

        # Création d'un utilisateur professeur
        self.professeur = CustomUser.objects.create(
            username='prof1',
            first_name='Marie',
            last_name='Curie',
            email='marie.curie@example.com',
            role=CustomUser.PROFESSEUR
        )
        self.professeur.set_password('test123')
        self.professeur.save()

        # Obtention d'un token pour les tests authentifiés
        self.token = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'etudiant1', 'password': 'test123'},
            format='json'
        ).json()['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    # Tests du modèle CustomUser
    def test_custom_user_creation(self):
        """Teste la création d'un utilisateur"""
        self.assertEqual(self.etudiant.first_name, 'Jean')
        self.assertEqual(self.etudiant.last_name, 'Dupont')
        self.assertEqual(self.etudiant.email, 'jean.dupont@example.com')
        self.assertEqual(self.etudiant.role, CustomUser.ETUDIANT)
        self.assertTrue(self.etudiant.datecreation)

    def test_group_assignment_etudiant(self):
        """Teste l'assignation correcte du groupe pour un étudiant"""
        etudiant_group = Group.objects.get(name='Etudiant')
        professeur_group = Group.objects.get(name='Professeur')
        self.assertIn(etudiant_group, self.etudiant.groups.all())
        self.assertNotIn(professeur_group, self.etudiant.groups.all())

    def test_group_assignment_professeur(self):
        """Teste l'assignation correcte du groupe pour un professeur"""
        professeur_group = Group.objects.get(name='Professeur')
        etudiant_group = Group.objects.get(name='Etudiant')
        self.assertIn(professeur_group, self.professeur.groups.all())
        self.assertNotIn(etudiant_group, self.professeur.groups.all())

    def test_str_method(self):
        """Teste la méthode __str__"""
        self.assertEqual(str(self.etudiant), 'etudiant1')
        self.assertEqual(str(self.professeur), 'prof1')

    def test_email_unique(self):
        """Teste la contrainte d'unicité de l'email"""
        with self.assertRaises(Exception):
            duplicate_user = CustomUser(
                username='etudiant2',
                first_name='Pierre',
                last_name='Martin',
                email='jean.dupont@example.com',  # Email déjà utilisé
                role=CustomUser.ETUDIANT
            )
            duplicate_user.set_password('test123')
            duplicate_user.save()

    # Tests des serializers (associés aux vues)
    def test_custom_user_serializer(self):
        """Teste le serializer CustomUserSerializers"""
        serializer = CustomUserSerializers(self.etudiant)
        data = serializer.data
        self.assertEqual(data['first_name'], 'Jean')
        self.assertEqual(data['last_name'], 'Dupont')
        self.assertEqual(data['username'], 'etudiant1')
        self.assertEqual(data['email'], 'jean.dupont@example.com')
        self.assertEqual(data['role'], CustomUser.ETUDIANT)

    def test_user_registration_serializer(self):
        """Teste le serializer UserRegistrationSerializer"""
        data = {
            'first_name': 'Sophie',
            'last_name': 'Lopez',
            'username': 'sophie123',
            'email': 'sophie.lopez@example.com',
            'password': 'test456',
            'role': CustomUser.ETUDIANT
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.first_name, 'Sophie')
        self.assertEqual(user.email, 'sophie.lopez@example.com')
        self.assertEqual(user.role, CustomUser.ETUDIANT)
        self.assertTrue(user.check_password('test456'))
        etudiant_group = Group.objects.get(name='Etudiant')
        self.assertIn(etudiant_group, user.groups.all())

    # Tests des URLs
    def test_token_obtain_pair_url(self):
        """Teste l'URL pour obtenir un token"""
        url = reverse('token_obtain_pair')
        self.assertEqual(resolve(url).func.view_class, TokenObtainPairView)
        response = self.client.post(url, {
            'username': 'etudiant1',
            'password': 'test123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.json())
        self.assertIn('refresh', response.json())

    def test_token_refresh_url(self):
        """Teste l'URL pour rafraîchir un token"""
        url = reverse('token_refresh')
        self.assertEqual(resolve(url).func.view_class, TokenRefreshView)
        refresh_token = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'etudiant1', 'password': 'test123'},
            format='json'
        ).json()['refresh']
        response = self.client.post(url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.json())

    def test_profile_url(self):
        """Teste l'URL du profil (authentification requise)"""
        url = reverse('profile')
        self.assertEqual(resolve(url).func.view_class, ProfileView)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_register_url(self):
        """Teste l'URL d'inscription"""
        url = reverse('register')
        self.assertEqual(resolve(url).func.view_class, RegisterView)
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123',
            'role': CustomUser.ETUDIANT
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_modification_profile_url(self):
        """Teste l'URL de modification de profil"""
        url = reverse('modificationProfile', kwargs={'id': self.etudiant.id})
        self.assertEqual(resolve(url).func.view_class, ModificationProfileView)
        data = {
            'first_name': 'Updated',
            'last_name': 'Dupont',
            'email': 'updated@example.com'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.etudiant.refresh_from_db()
        self.assertEqual(self.etudiant.first_name, 'Updated')

    def test_logout_url(self):
        """Teste l'URL de déconnexion"""
        url = reverse('logout')
        self.assertEqual(resolve(url).func.view_class, LogoutView)
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_utilisateurs_url(self):
        """Teste l'URL de la liste des utilisateurs"""
        url = reverse('utilisateurs')
        self.assertEqual(resolve(url).func.view_class, CustomUserViewSet)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_access(self):
        """Teste l'accès non authentifié à une URL protégée"""
        self.client.credentials()  # Supprime les credentials
        url = reverse('profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

if __name__ == '__main__':
    import unittest
    unittest.main()