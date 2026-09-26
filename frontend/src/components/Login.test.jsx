import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { auth } from '../tools/auth';

jest.mock('../tools/auth');

describe('Login', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('renders username and password fields', () => {
        render(<Login setUser={jest.fn()} setUseLoginPage={jest.fn()} />);

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('logs in and calls setUser on success', async () => {
        const user = userEvent.setup();
        const setUser = jest.fn();
        auth.login.mockResolvedValueOnce({ access: 'a', refresh: 'r' });

        render(<Login setUser={setUser} setUseLoginPage={jest.fn()} />);

        await user.type(screen.getByLabelText(/username/i), 'bob');
        await user.type(screen.getByLabelText(/password/i), 'secret');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        expect(auth.login).toHaveBeenCalledWith('bob', 'secret');
        expect(setUser).toHaveBeenCalledWith({ username: 'bob', access: 'a', refresh: 'r' });
    });

    it('shows an error message when login fails', async () => {
        const user = userEvent.setup();
        auth.login.mockRejectedValueOnce(new Error('Invalid credentials'));

        render(<Login setUser={jest.fn()} setUseLoginPage={jest.fn()} />);

        await user.type(screen.getByLabelText(/username/i), 'bob');
        await user.type(screen.getByLabelText(/password/i), 'wrong');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });

    it('switches to the register page when clicked', async () => {
        const user = userEvent.setup();
        const setUseLoginPage = jest.fn();

        render(<Login setUser={jest.fn()} setUseLoginPage={setUseLoginPage} />);

        await user.click(screen.getByRole('button', { name: /don't have an account/i }));

        expect(setUseLoginPage).toHaveBeenCalledWith(false);
    });
});
