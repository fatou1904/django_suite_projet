from django.shortcuts import render
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework import permissions, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status


from .serializers import CustomUserSerializers, UserRegistrationSerializer
from .models import CustomUser

# Create your views here.
class CustomUserViewSet(ListAPIView):
    serializer_class = CustomUserSerializers
    permission_classes = (IsAuthenticated, )
    def get_queryset(self):
        if self.request.user.role == 'professeur':
            return CustomUser.objects.all()
        if self.request.user.role == 'etudiant':
            return CustomUser.objects.filter(role='etudiant')
    
class ProfileView(APIView):
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "datecreation": user.datecreation,
            "role": user.role,
        })
        

class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": serializer.data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
          
        
class LogoutView(APIView):
     permission_classes = (IsAuthenticated,)
     def post(self, request):
          
          try:
               refresh_token = request.data["refresh_token"]
               token = RefreshToken(refresh_token)
               token.blacklist()
               return Response(status=status.HTTP_205_RESET_CONTENT)
          except Exception as e:
               return Response(status=status.HTTP_400_BAD_REQUEST)
           
class ModificationProfileView(generics.UpdateAPIView):
    serializer_class = CustomUserSerializers
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'