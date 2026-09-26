from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class TokenAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', password='password123')
        self.obtain_url = reverse('token_obtain_pair')
        self.refresh_url = reverse('token_refresh')

    def test_obtains_token_pair_with_valid_credentials(self):
        response = self.client.post(self.obtain_url, {
            'username': 'alice',
            'password': 'password123',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_rejects_invalid_credentials(self):
        response = self.client.post(self.obtain_url, {
            'username': 'alice',
            'password': 'wrong-password',
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refreshes_an_access_token(self):
        tokens = self.client.post(self.obtain_url, {
            'username': 'alice',
            'password': 'password123',
        }).data

        response = self.client.post(self.refresh_url, {'refresh': tokens['refresh']})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_rejects_an_invalid_refresh_token(self):
        response = self.client.post(self.refresh_url, {'refresh': 'not-a-real-token'})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_full_register_then_login_flow(self):
        register_response = self.client.post(reverse('register'), {
            'username': 'bob',
            'email': 'bob@test.com',
            'password': 'password123',
        })
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        login_response = self.client.post(self.obtain_url, {
            'username': 'bob',
            'password': 'password123',
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        me_response = self.client.get(
            reverse('me'),
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['username'], 'bob')
