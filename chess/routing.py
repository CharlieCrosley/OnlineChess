from django.urls import re_path
from chess.consumers import ChessConsumer

websocket_urlpatterns = [
    re_path(r'^ws/(?P<room_code>\w+)/$', ChessConsumer.as_asgi()),
]