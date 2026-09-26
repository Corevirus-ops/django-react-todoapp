import { render, screen } from '@testing-library/react';
import App from './App';
import { auth } from './tools/auth';

jest.mock('./tools/auth');

describe('App', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    it('shows the auth screen when there is no stored access token', async () => {
        render(<App />);

        expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
        expect(auth.get).not.toHaveBeenCalled();
    });

    it('restores the logged-in user when a valid access token exists', async () => {
        localStorage.setItem('access_token', 'valid-token');
        auth.get.mockResolvedValueOnce({ username: 'bob' });

        render(<App />);

        expect(await screen.findByText(/make room for what matters/i)).toBeInTheDocument();
        expect(auth.get).toHaveBeenCalledWith('me/');
    });

    it('logs out and falls back to the auth screen when restoring fails', async () => {
        localStorage.setItem('access_token', 'expired-token');
        auth.get.mockRejectedValueOnce(new Error('Unauthorized'));

        render(<App />);

        expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
        expect(auth.logout).toHaveBeenCalled();
    });
});
