from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.MeView.as_view(), name='me'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('todos/', views.TodoList.as_view(), name='todo_list'),
    path('todos/<int:pk>/', views.TodoDetail.as_view(), name='todo_detail'),
]
