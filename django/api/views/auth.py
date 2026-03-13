from datetime import datetime

from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from django.contrib.auth import logout

from ..auth import get_token_from_request, verify_token
from ..models import User


class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def login(self, request):
        try:
            token = request.data.get('cred')
            if token:
                _, exp = verify_token(token)
                response = Response({'status': 'success', 'message': 'Login successful'})
                response.set_cookie(
                    "token",
                    token,
                    expires=datetime.utcfromtimestamp(exp),
                    httponly=True,
                    path="/",
                    samesite="Lax",
                )
                return response
            else:
                return Response({'status': 'error', 'message': 'Invalid credentials'})
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)})

    @action(detail=False, methods=['get'])
    def logout(self, request):
        try:
            logout(request)
            response =  Response({'status': 'success', 'message': 'Logout successful'})
            response.delete_cookie('token')
            return response
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)})
        
    @action(detail=False, methods=['get'])
    def health_checker(self, request):
        try:
            response =  Response({'status': 'success', 'message': 'Server is up and running'})
            return response
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)})

    @action(detail=False, methods=['get'])
    def auth_health_checker(self, request):
        try:
            token = get_token_from_request(request)
            if not token:
                return Response({'status': 'error', 'message': 'JWT is invalid'})
            user_name, _ = verify_token(token)
            user = User.objects.get(user_name=user_name, is_active=True)
            if not user:
                return Response({'status': 'error', 'message': 'JWT is invalid'})
            response =  Response({'status': 'success', 'message': 'JWT is valid'})
            return response
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)})
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
