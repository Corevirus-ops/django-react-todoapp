from django.contrib.auth.models import User
from django.test import TestCase

from todo.models import Todo


class TodoModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', password='password123')

    def test_str_returns_title(self):
        todo = Todo.objects.create(user=self.user, title='Buy milk', description='2%')

        self.assertEqual(str(todo), 'Buy milk')

    def test_completed_defaults_to_false(self):
        todo = Todo.objects.create(user=self.user, title='Buy milk', description='2%')

        self.assertFalse(todo.completed)

    def test_todo_belongs_to_user(self):
        todo = Todo.objects.create(user=self.user, title='Buy milk', description='2%')

        self.assertEqual(todo.user, self.user)

    def test_deleting_user_deletes_todos(self):
        Todo.objects.create(user=self.user, title='Buy milk', description='2%')

        self.user.delete()

        self.assertEqual(Todo.objects.count(), 0)
