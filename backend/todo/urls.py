from django.urls import path
from . import views

urlpatterns = [
    path('todos/', views.todo_list, name='todo_list'),
    path('todos/<int:pk>/', views.todo_detail, name='todo_detail'),
    path('login/', views.user_login, name='user_login'),
    path('logout/', views.user_logout, name='user_logout'),
]