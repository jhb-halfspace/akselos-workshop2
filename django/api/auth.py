from datetime import datetime
from functools import lru_cache

import requests
from api.serializers import UserSerializer
from rest_framework import authentication, exceptions, status
from timerecorder.settings import GG_CLIENT_ID

from .models import User


class CustomAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        token = get_token_from_request(request)
        if not token:
            raise exceptions.AuthenticationFailed('Invalid token')
        try:
            user_name, _ = verify_token(token)
            user = User.objects.get(user_name=user_name, is_active=True)
            serializer = UserSerializer(user)
            data = serializer.data
            request.user = data
        except User.DoesNotExist:
            raise exceptions.PermissionDenied('No such user')
        except Exception as e:
            raise exceptions.PermissionDenied(str(e))
        return user, None


def get_token_from_request(request):
    token = request.COOKIES.get('token')
    if not token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header[7:]
    return token


@lru_cache(maxsize=128)
def verify_token(token: str):
    response = requests.get(
        f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}"
    )
    if response.status_code != status.HTTP_200_OK:
         raise Exception('Token verification failed')

    res = response.json()

    client_id = GG_CLIENT_ID
    if res.get('aud') != client_id:
        raise Exception('Token was not issued for this audience')

    issuer = res.get('iss')
    if issuer not in ['https://accounts.google.com', 'accounts.google.com']:
        raise Exception('Token was not issued by Google')

    exp = int(res.get('exp'))
        
    # Check if the token is still valid
    current_time = datetime.utcnow().timestamp()

    if exp < current_time:
        raise Exception('Token has expired')

    email = res.get('email')
    if not email:
        raise Exception('Email not found in token')

    user_name = email.split('@')[0]

    return user_name, exp
