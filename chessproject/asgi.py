"""
ASGI config for chessproject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

""" import os
import django
from channels.routing import get_default_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chessproject.settings")
django.setup()

application = get_default_application() """


import os

from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import chess.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chessproject.settings')

# The HTTP protocol is handled by get_asgi_application() 
# and the websocket protocol is handled by a URL router
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": 
        URLRouter(
            chess.routing.websocket_urlpatterns
        
    ),
})