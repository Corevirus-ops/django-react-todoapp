import { auth } from './auth';

const mockFetchResponse = (data, ok = true, status = 200) => ({
    ok,
    status,
    json: () => Promise.resolve(data),
});

describe('auth tool', () => {
    beforeEach(() => {
        localStorage.clear();
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('login', () => {
        it('stores tokens and returns data on success', async () => {
            global.fetch.mockResolvedValueOnce(
                mockFetchResponse({ access: 'access123', refresh: 'refresh123' })
            );

            const data = await auth.login('bob', 'secret');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('token/'),
                expect.objectContaining({ method: 'POST' })
            );
            expect(data).toEqual({ access: 'access123', refresh: 'refresh123' });
            expect(localStorage.getItem('access_token')).toBe('access123');
            expect(localStorage.getItem('refresh_token')).toBe('refresh123');
        });

        it('throws an error with the server message on failure', async () => {
            global.fetch.mockResolvedValueOnce(
                mockFetchResponse({ detail: 'Invalid credentials' }, false, 401)
            );

            await expect(auth.login('bob', 'wrong')).rejects.toThrow('Invalid credentials');
            expect(localStorage.getItem('access_token')).toBeNull();
        });
    });

    describe('get', () => {
        it('sends an authorization header when a token exists', async () => {
            localStorage.setItem('access_token', 'my-token');
            global.fetch.mockResolvedValueOnce(mockFetchResponse({ id: 1, title: 'Todo' }));

            const result = await auth.get('todos/1/');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('todos/1/'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
                })
            );
            expect(result).toEqual({ id: 1, title: 'Todo' });
        });

        it('throws with a combined field error message', async () => {
            global.fetch.mockResolvedValueOnce(
                mockFetchResponse({ title: ['This field is required.'] }, false, 400)
            );

            await expect(auth.get('todos/')).rejects.toThrow('This field is required.');
        });
    });

    describe('post/put', () => {
        it('sends a JSON body on post', async () => {
            global.fetch.mockResolvedValueOnce(mockFetchResponse({ id: 5 }));

            const result = await auth.post('todos/', { title: 'New task' });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('todos/'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ title: 'New task' }),
                })
            );
            expect(result).toEqual({ id: 5 });
        });

        it('sends a JSON body on put', async () => {
            global.fetch.mockResolvedValueOnce(mockFetchResponse({ id: 5, completed: true }));

            const result = await auth.put('todos/5/', { completed: true });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('todos/5/'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ completed: true }),
                })
            );
            expect(result).toEqual({ id: 5, completed: true });
        });
    });

    describe('delete', () => {
        it('returns { result: true } for a 204 response', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
                json: () => Promise.resolve(undefined),
            });

            const result = await auth.delete('todos/1/');

            expect(result).toEqual({ result: true });
        });
    });

    describe('logout', () => {
        it('clears stored tokens', () => {
            localStorage.setItem('access_token', 'a');
            localStorage.setItem('refresh_token', 'r');

            auth.logout();

            expect(localStorage.getItem('access_token')).toBeNull();
            expect(localStorage.getItem('refresh_token')).toBeNull();
        });
    });

    describe('refresh', () => {
        it('throws when no refresh token is available', async () => {
            await expect(auth.refresh()).rejects.toThrow('No refresh token available');
        });

        it('stores new tokens on success', async () => {
            localStorage.setItem('refresh_token', 'old-refresh');
            global.fetch.mockResolvedValueOnce(
                mockFetchResponse({ access: 'new-access', refresh: 'new-refresh' })
            );

            const data = await auth.refresh();

            expect(data).toEqual({ access: 'new-access', refresh: 'new-refresh' });
            expect(localStorage.getItem('access_token')).toBe('new-access');
            expect(localStorage.getItem('refresh_token')).toBe('new-refresh');
        });
    });

    describe('register', () => {
        it('registers, logs in, and returns the current user', async () => {
            global.fetch
                .mockResolvedValueOnce(mockFetchResponse({ id: 1 })) // register/
                .mockResolvedValueOnce(mockFetchResponse({ access: 'a', refresh: 'r' })) // token/
                .mockResolvedValueOnce(mockFetchResponse({ username: 'bob' })); // me/

            const user = await auth.register('bob', 'bob@test.com', 'password123');

            expect(global.fetch).toHaveBeenCalledTimes(3);
            expect(user).toEqual({ username: 'bob' });
        });
    });
});
