import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoPage from './TodoPage';
import { auth } from '../tools/auth';

jest.mock('../tools/auth');

const sampleTodos = [
    { id: 1, title: 'Buy milk', description: 'From the store', completed: false },
    { id: 2, title: 'Walk the dog', description: '', completed: true },
];

describe('TodoPage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        auth.get.mockResolvedValue([]);
    });

    it('loads and displays todos on mount', async () => {
        auth.get.mockResolvedValueOnce(sampleTodos);

        render(<TodoPage handleLogout={jest.fn()} />);

        expect(await screen.findByText('Buy milk')).toBeInTheDocument();
        expect(screen.getByText('Walk the dog')).toBeInTheDocument();
        expect(auth.get).toHaveBeenCalledWith('todos/');
    });

    it('shows the empty state when there are no todos', async () => {
        render(<TodoPage handleLogout={jest.fn()} />);

        expect(await screen.findByText('A clear start.')).toBeInTheDocument();
    });

    it('adds a new todo on submit', async () => {
        const user = userEvent.setup();
        auth.post.mockResolvedValueOnce({ id: 3, title: 'New task', description: '', completed: false });

        render(<TodoPage handleLogout={jest.fn()} />);
        await screen.findByText('A clear start.');

        await user.type(screen.getByLabelText('Task title'), 'New task');
        await user.click(screen.getByRole('button', { name: /add task/i }));

        expect(await screen.findByText('New task')).toBeInTheDocument();
        expect(auth.post).toHaveBeenCalledWith('todos/', { title: 'New task', description: '', completed: false });
    });

    it('shows an error when adding a todo fails', async () => {
        const user = userEvent.setup();
        auth.post.mockResolvedValueOnce(null);

        render(<TodoPage handleLogout={jest.fn()} />);
        await screen.findByText('A clear start.');

        await user.type(screen.getByLabelText('Task title'), 'New task');
        await user.click(screen.getByRole('button', { name: /add task/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Failed to add todo');
    });

    it('toggles a todo as complete', async () => {
        const user = userEvent.setup();
        auth.get.mockResolvedValueOnce(sampleTodos);
        auth.put.mockResolvedValueOnce({ ...sampleTodos[0], completed: true });

        render(<TodoPage handleLogout={jest.fn()} />);
        await screen.findByText('Buy milk');

        await user.click(screen.getByLabelText('Mark Buy milk complete'));

        expect(auth.put).toHaveBeenCalledWith('todos/1/', { ...sampleTodos[0], completed: true });
        expect(await screen.findByLabelText('Mark Buy milk incomplete')).toBeInTheDocument();
    });

    it('deletes a todo', async () => {
        const user = userEvent.setup();
        auth.get.mockResolvedValueOnce(sampleTodos);
        auth.delete.mockResolvedValueOnce({ result: true });

        render(<TodoPage handleLogout={jest.fn()} />);
        const item = (await screen.findByText('Buy milk')).closest('li');

        await user.click(within(item).getByRole('button', { name: 'Delete' }));

        expect(auth.delete).toHaveBeenCalledWith('todos/1/');
        expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    });

    it('edits a todo and saves changes', async () => {
        const user = userEvent.setup();
        auth.get.mockResolvedValueOnce(sampleTodos);
        auth.put.mockResolvedValueOnce({ id: 1, title: 'Buy oat milk', description: 'From the store', completed: false });

        render(<TodoPage handleLogout={jest.fn()} />);
        const item = (await screen.findByText('Buy milk')).closest('li');

        await user.click(within(item).getByRole('button', { name: 'Edit' }));
        const titleInput = screen.getByLabelText('Edit task title');
        await user.clear(titleInput);
        await user.type(titleInput, 'Buy oat milk');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(auth.put).toHaveBeenCalledWith('todos/1/', expect.objectContaining({ title: 'Buy oat milk' }));
        expect(await screen.findByText('Buy oat milk')).toBeInTheDocument();
    });

    it('cancels editing a todo', async () => {
        const user = userEvent.setup();
        auth.get.mockResolvedValueOnce(sampleTodos);

        render(<TodoPage handleLogout={jest.fn()} />);
        const item = (await screen.findByText('Buy milk')).closest('li');

        await user.click(within(item).getByRole('button', { name: 'Edit' }));
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.getByText('Buy milk')).toBeInTheDocument();
        expect(auth.put).not.toHaveBeenCalled();
    });

    it('filters todos by completion status', async () => {
        const user = userEvent.setup();
        auth.get.mockResolvedValueOnce(sampleTodos);

        render(<TodoPage handleLogout={jest.fn()} />);
        await screen.findByText('Buy milk');

        await user.click(screen.getByRole('radio', { name: 'Done' }));
        expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
        expect(screen.getByText('Walk the dog')).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: 'To do' }));
        expect(screen.getByText('Buy milk')).toBeInTheDocument();
        expect(screen.queryByText('Walk the dog')).not.toBeInTheDocument();
    });

    it('calls handleLogout when the logout button is clicked', async () => {
        const user = userEvent.setup();
        const handleLogout = jest.fn();

        render(<TodoPage handleLogout={handleLogout} />);
        await screen.findByText('A clear start.');

        await user.click(screen.getByRole('button', { name: /log out/i }));

        expect(handleLogout).toHaveBeenCalledTimes(1);
    });
});
