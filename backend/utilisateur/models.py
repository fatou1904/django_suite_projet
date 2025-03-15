from django.contrib.auth.models import AbstractUser, Group
from django.db import models

class CustomUser(AbstractUser):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    datecreation = models.DateTimeField(auto_now_add=True)
    
    ETUDIANT = 'etudiant'
    PROFESSEUR = 'professeur'
    CHOIX_ROLE = [(ETUDIANT, "Étudiant"), (PROFESSEUR, "Professeur")]
    role = models.CharField(max_length=10, choices=CHOIX_ROLE)
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions',
        blank=True
    )
    
    def __str__(self):
        return self.username
        
    def save(self, *args, **kwargs):
        is_new = self.pk is None 
        
        super().save(*args, **kwargs)
        
        if self.role == self.PROFESSEUR:
            try:
                groupe_prof = Group.objects.get(name='Professeur')
                if groupe_prof not in self.groups.all():
                    self.groups.add(groupe_prof)
                
                try:
                    groupe_etud = Group.objects.get(name='Etudiant')
                    if groupe_etud in self.groups.all():
                        self.groups.remove(groupe_etud)
                except Group.DoesNotExist:
                    pass
            except Group.DoesNotExist:
                print(f"Attention: Le groupe 'Professeur' n'existe pas.")
                
        elif self.role == self.ETUDIANT:
            try:
                groupe_etud = Group.objects.get(name='Etudiant')
                if groupe_etud not in self.groups.all():
                    self.groups.add(groupe_etud)
                
                try:
                    groupe_prof = Group.objects.get(name='Professeur')
                    if groupe_prof in self.groups.all():
                        self.groups.remove(groupe_prof)
                except Group.DoesNotExist:
                    pass
            except Group.DoesNotExist:
                print(f"Attention: Le groupe 'Etudiant' n'existe pas.")