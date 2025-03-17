from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Tache
from project.models import Projet
from .serializers import TacheSerializer

User = get_user_model()

class TacheTestCase(TestCase):
    def setUp(self):
        # Initialisation des objets pour chaque test
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.projet = Projet.objects.create(user=self.user, nom='Test Projet')
        self.tache = Tache.objects.create(
            titre='Test Tache',
            description='Description',
            user=self.user,
            projet=self.projet,
            statut='À faire',
            progression=0
        )
        self.client.force_authenticate(user=self.user)

    # Tests pour le modèle Tache
    def test_tache_creation(self):
        self.assertEqual(self.tache.titre, 'Test Tache')
        self.assertEqual(self.tache.statut, 'À faire')
        self.assertEqual(self.tache.progression, 0)
        self.assertIsNotNone(self.tache.user)
        self.assertIsNotNone(self.tache.date_creation)

    def test_tache_complete(self):
        tache = Tache.objects.create(
            titre='Test Complete',
            description='Description',
            user=self.user,
            projet=self.projet,
            progression=100,
            date_echeance=timezone.now() + timezone.timedelta(days=1)
        )
        tache.save()
        self.assertEqual(tache.statut, 'Terminé')
        self.assertIsNotNone(tache.date_fin_reelle)
        self.assertTrue(tache.termine_dans_delai)

    def test_tache_delai_depasse(self):
        tache = Tache.objects.create(
            titre='Test Délai',
            description='Description',
            user=self.user,
            projet=self.projet,
            progression=100,
            date_echeance=timezone.now() - timezone.timedelta(days=1)
        )
        tache.save()
        self.assertEqual(tache.statut, 'Terminé')
        self.assertFalse(tache.termine_dans_delai)

    # Tests pour le sérialiseur TacheSerializer
    def test_tache_serializer(self):
        serializer = TacheSerializer(self.tache)
        data = serializer.data
        self.assertEqual(data['titre'], 'Test Tache')
        self.assertEqual(data['statut'], 'À faire')
        self.assertIsNone(data['assigned_to_username'])
        self.assertEqual(data['projet_id'], self.projet.id)

    def test_tache_serializer_create(self):
        data = {
            'titre': 'Nouvelle Tache',
            'description': 'Description',
            'projet_id': self.projet.id,
            'progression': 50
        }
        serializer = TacheSerializer(data=data, context={'request': type('Request', (), {'user': self.user})()})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        tache = serializer.save()
        self.assertEqual(tache.titre, 'Nouvelle Tache')
        self.assertEqual(tache.user, self.user)
        self.assertEqual(tache.projet, self.projet)

    def test_tache_serializer_update(self):
        data = {'titre': 'Tache Modifiée', 'progression': 75}
        serializer = TacheSerializer(self.tache, data=data, partial=True, context={'request': type('Request', (), {'user': self.user, 'data': data})()})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_tache = serializer.save()
        self.assertEqual(updated_tache.titre, 'Tache Modifiée')
        self.assertEqual(updated_tache.progression, 75)

    # Tests pour les vues
    def test_ajout_tache_view(self):
        data = {
            'titre': 'Tache API',
            'description': 'Test via API',
            'projet_id': self.projet.id
        }
        response = self.client.post('/ajouterTache/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Tache.objects.filter(titre='Tache API').exists())

    def test_tache_view(self):
        response = self.client.get('/taches/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['titre'], 'Test Tache')

    def test_modification_tache_view(self):
        data = {'titre': 'Tache Modifiée'}
        response = self.client.patch(f'/modiffsupp/{self.tache.id}/', data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Tache.objects.get(id=self.tache.id).titre, 'Tache Modifiée')

    def test_suppression_tache_view(self):
        response = self.client.delete(f'/modiffsupp/{self.tache.id}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Tache.objects.filter(id=self.tache.id).exists())

    def test_taches_par_projet_view(self):
        response = self.client.get(f'/taches/projet/{self.projet.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['titre'], 'Test Tache')

    def test_taches_assignees_utilisateur(self):
        self.tache.assigned_to = self.user
        self.tache.save()
        response = self.client.get('/assignees/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['titre'], 'Test Tache')

    def test_taches_assignees_projet(self):
        self.tache.assigned_to = self.user
        self.tache.save()
        response = self.client.get(f'/assignees/projet/{self.projet.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['titre'], 'Test Tache')