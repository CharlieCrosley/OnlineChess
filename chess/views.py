from django.shortcuts import render, redirect
from django.http import Http404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse


def index(request):
    return render(request, "index.html", {})

