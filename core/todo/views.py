from django.shortcuts import render
from .models import Todo

from django.http import JsonResponse

# Create your views here.
# get todos
def todo_list(request):
    todos = Todo.objects.filter(user=request.user)
    return JsonResponse({'todos': list(todos.values('id', 'title', 'description', 'completed'))})
#update todo
def todo_detail(request, pk):
    try:
        todo = Todo.objects.get(pk=pk, user=request.user)
    except Todo.DoesNotExist:
        return JsonResponse({'error': 'Todo not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'id': todo.id, 'title': todo.title, 'description': todo.description, 'completed': todo.completed})
    elif request.method == 'PUT':
        data = json.loads(request.body)
        todo.title = data.get('title', todo.title)
        todo.description = data.get('description', todo.description)
        todo.completed = data.get('completed', todo.completed)
        todo.save()
        return JsonResponse({'id': todo.id, 'title': todo.title, 'description': todo.description, 'completed': todo.completed})
    elif request.method == 'DELETE':
        todo.delete()
        return JsonResponse({'result': 'Todo deleted'})