from django.contrib import admin
from .models import Projet
# Register your models here.

class ProjetAdmin(admin.ModelAdmin):
    pass

admin.site.register(Projet, ProjetAdmin)
