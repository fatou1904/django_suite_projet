from django.contrib import admin
from .models import Tache
# Register your models here.

class TacheAdmin(admin.ModelAdmin):
    pass

admin.site.register(Tache, TacheAdmin)
