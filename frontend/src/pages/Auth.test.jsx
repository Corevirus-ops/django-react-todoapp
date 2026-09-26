import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Auth from './Auth';

jest.mock('../tools/auth');

describe('Auth', () => {
    it('renders the login form by default', () => {
        render(<Auth setUser={jest.fn()} />);

        expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    });

    it('toggles to the register form', async () => {
        const user = userEvent.setup();
        render(<Auth setUser={jest.fn()} />);

        await user.click(screen.getByRole('button', { name: /don't have an account/i }));

        expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    });

    it('toggles back to the login form', async () => {
        const user = userEvent.setup();
        render(<Auth setUser={jest.fn()} />);

        await user.click(screen.getByRole('button', { name: /don't have an account/i }));
        await user.click(screen.getByRole('button', { name: /already have an account/i }));

        expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    });
});
