from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Todo
from .serializer import TodoSerializer, RegisterSerializer

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email
        })

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



class TodoList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        todos = Todo.objects.filter(user=request.user)
        serializer = TodoSerializer(todos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TodoSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TodoDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_todo(self, request, pk):
        try:
            return Todo.objects.get(pk=pk, user=request.user)
        except Todo.DoesNotExist:
            return None

    def get(self, request, pk):
        todo = self.get_todo(request, pk)

        if todo is None:
            return Response(
                {'error': 'Todo not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TodoSerializer(todo)
        return Response(serializer.data)

    def put(self, request, pk):
        todo = self.get_todo(request, pk)

        if todo is None:
            return Response(
                {'error': 'Todo not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TodoSerializer(todo, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        todo = self.get_todo(request, pk)

        if todo is None:
            return Response(
                {'error': 'Todo not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        todo.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

