from django.contrib.auth.models import User
from django.test import TestCase

from todo.serializer import RegisterSerializer, TodoSerializer
from todo.models import Todo


class TodoSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', password='password123')

    def test_serializes_expected_fields(self):
        todo = Todo.objects.create(user=self.user, title='Buy milk', description='2%', completed=True)

        data = TodoSerializer(todo).data

        self.assertEqual(set(data.keys()), {'id', 'title', 'description', 'completed'})
        self.assertEqual(data['title'], 'Buy milk')
        self.assertTrue(data['completed'])

    def test_requires_title(self):
        serializer = TodoSerializer(data={'description': 'no title'})

        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)


class RegisterSerializerTests(TestCase):
    def test_creates_user_with_hashed_password(self):
        serializer = RegisterSerializer(data={
            'username': 'bob',
            'email': 'bob@test.com',
            'password': 'password123',
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertEqual(user.username, 'bob')
        self.assertNotEqual(user.password, 'password123')
        self.assertTrue(user.check_password('password123'))

    def test_rejects_password_shorter_than_8_chars(self):
        serializer = RegisterSerializer(data={
            'username': 'bob',
            'email': 'bob@test.com',
            'password': 'short1',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_rejects_duplicate_email_case_insensitively(self):
        User.objects.create_user(username='existing', email='Bob@Test.com', password='password123')

        serializer = RegisterSerializer(data={
            'username': 'newuser',
            'email': 'bob@test.com',
            'password': 'password123',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
