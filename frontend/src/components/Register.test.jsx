import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from './Register';
import { auth } from '../tools/auth';

jest.mock('../tools/auth');

describe('Register', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('renders all registration fields', () => {
        render(<Register setUser={jest.fn()} setUseLoginPage={jest.fn()} />);

        expect(screen.getByLabelText(/^username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('shows an error when passwords do not match', async () => {
        const user = userEvent.setup();

        render(<Register setUser={jest.fn()} setUseLoginPage={jest.fn()} />);

        await user.type(screen.getByLabelText(/^username/i), 'bob');
        await user.type(screen.getByLabelText(/email/i), 'bob@test.com');
        await user.type(screen.getByLabelText(/^password/i), 'password123');
        await user.type(screen.getByLabelText(/confirm password/i), 'different123');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match');
        expect(auth.register).not.toHaveBeenCalled();
    });

    it('shows an error when the password is too short', async () => {
        const user = userEvent.setup();

        render(<Register setUser={jest.fn()} setUseLoginPage={jest.fn()} />);

        await user.type(screen.getByLabelText(/^username/i), 'bob');
        await user.type(screen.getByLabelText(/email/i), 'bob@test.com');
        await user.type(screen.getByLabelText(/^password/i), 'short1');
        await user.type(screen.getByLabelText(/confirm password/i), 'short1');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('at least 8 characters');
    });

    it('registers the user and calls setUser on success', async () => {
        const user = userEvent.setup();
        const setUser = jest.fn();
        auth.register.mockResolvedValueOnce({ username: 'bob' });

        render(<Register setUser={setUser} setUseLoginPage={jest.fn()} />);

        await user.type(screen.getByLabelText(/^username/i), 'bob');
        await user.type(screen.getByLabelText(/email/i), 'bob@test.com');
        await user.type(screen.getByLabelText(/^password/i), 'password123');
        await user.type(screen.getByLabelText(/confirm password/i), 'password123');
        await user.click(screen.getByRole('button', { name: 'Register' }));

        expect(auth.register).toHaveBeenCalledWith('bob', 'bob@test.com', 'password123');
        expect(await screen.findByRole('button', { name: 'Register' })).toBeInTheDocument();
        expect(setUser).toHaveBeenCalledWith({ username: 'bob' });
    });

    it('switches to the login page when clicked', async () => {
        const user = userEvent.setup();
        const setUseLoginPage = jest.fn();

        render(<Register setUser={jest.fn()} setUseLoginPage={setUseLoginPage} />);

        await user.click(screen.getByRole('button', { name: /already have an account/i }));

        expect(setUseLoginPage).toHaveBeenCalledWith(true);
    });
});
