from django.urls import path, include
from rest_framework_simplejwt import views as jwt_views
from .views import CustomUserViewSet, LogoutView, ProfileView, RegisterView, ModificationProfileView
urlpatterns = [
    
     path('token/', jwt_views.TokenObtainPairView.as_view(), name ='token_obtain_pair'),
     path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name ='token_refresh'),
     path('profile/', ProfileView.as_view(), name ='profile'),
     path('register/', RegisterView.as_view(), name ='register'),
     path('modificationProfile/<int:id>/', ModificationProfileView.as_view(), name ='modificationProfile'),
     path('logout/', LogoutView.as_view(), name ='logout'),
     path('utilisateurs/', CustomUserViewSet.as_view(), name='utilisateurs')
]