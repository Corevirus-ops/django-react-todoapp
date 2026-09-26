from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from todo.models import Todo


class MeViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', email='alice@test.com', password='password123')
        self.url = reverse('me')

    def test_requires_authentication(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_returns_current_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {
            'id': self.user.id,
            'username': 'alice',
            'email': 'alice@test.com',
        })


class RegisterViewTests(APITestCase):
    def setUp(self):
        self.url = reverse('register')

    def test_creates_a_new_user(self):
        response = self.client.post(self.url, {
            'username': 'bob',
            'email': 'bob@test.com',
            'password': 'password123',
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='bob').exists())

    def test_rejects_duplicate_email(self):
        User.objects.create_user(username='existing', email='bob@test.com', password='password123')

        response = self.client.post(self.url, {
            'username': 'newbob',
            'email': 'bob@test.com',
            'password': 'password123',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rejects_short_password(self):
        response = self.client.post(self.url, {
            'username': 'bob',
            'email': 'bob@test.com',
            'password': 'short1',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TodoListViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', password='password123')
        self.other_user = User.objects.create_user(username='bob', password='password123')
        self.url = reverse('todo_list')
        self.client.force_authenticate(user=self.user)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_lists_only_the_current_users_todos(self):
        Todo.objects.create(user=self.user, title='Mine', description='')
        Todo.objects.create(user=self.other_user, title='Not mine', description='')

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Mine')

    def test_creates_a_todo_for_the_current_user(self):
        response = self.client.post(self.url, {
            'title': 'New task',
            'description': 'Details',
            'completed': False,
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        todo = Todo.objects.get(pk=response.data['id'])
        self.assertEqual(todo.user, self.user)
        self.assertEqual(todo.title, 'New task')

    def test_rejects_a_todo_without_a_title(self):
        response = self.client.post(self.url, {'description': 'no title'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TodoDetailViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', password='password123')
        self.other_user = User.objects.create_user(username='bob', password='password123')
        self.todo = Todo.objects.create(user=self.user, title='Buy milk', description='2%')
        self.url = reverse('todo_detail', kwargs={'pk': self.todo.pk})
        self.client.force_authenticate(user=self.user)

    def test_retrieves_a_todo(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Buy milk')

    def test_returns_404_for_another_users_todo(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_returns_404_for_a_missing_todo(self):
        response = self.client.get(reverse('todo_detail', kwargs={'pk': 9999}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_updates_a_todo(self):
        response = self.client.put(self.url, {
            'title': 'Buy oat milk',
            'description': '2%',
            'completed': True,
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Buy oat milk')
        self.assertTrue(self.todo.completed)

    def test_rejects_update_without_a_title(self):
        response = self.client.put(self.url, {'description': 'no title'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_deletes_a_todo(self):
        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Todo.objects.filter(pk=self.todo.pk).exists())

    def test_cannot_delete_another_users_todo(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Todo.objects.filter(pk=self.todo.pk).exists())
