
const API_URL = 'http://127.0.0.1:8000/api/';

const getAccessToken = () => {
    return localStorage.getItem('access_token');
};

const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
};

const setTokens = (access, refresh) => {
    localStorage.setItem('access_token', access);

    if (refresh) {
        localStorage.setItem('refresh_token', refresh);
    }
};

const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

const request = async (endpoint, options = {}) => {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                'Authorization': `Bearer ${token}`
            }),
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            error: 'Something went wrong'
        }));

       const message =
    error.detail ||
    error.error ||
    Object.values(error).flat().join(' ') ||
    'API request failed';

throw new Error(message);
    }
if (response.status === 204) {
    return { result: true };
}
    return response.json();
};

const login = async (username, password) => {
    const response = await fetch(`${API_URL}token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            error: 'Login failed'
        }));

        throw new Error(
            error.detail ||
            error.error ||
            'Login failed'
        );
    }

    const data = await response.json();

    setTokens(data.access, data.refresh);

    return data;
};

const register = async (username, email, password) => {
    await request('register/', {
        method: 'POST',
        body: JSON.stringify({
            username,
            email,
            password
        })
    });

    await login(username, password);

    return await get('me/');
};

const logout = () => {
    clearTokens();
};

const get = (endpoint) => {
    return request(endpoint, {
        method: 'GET'
    });
};

const post = (endpoint, body = null) => {
    return request(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : null
    });
};

const put = (endpoint, body = null) => {
    return request(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : null
    });
};

const deleteRequest = (endpoint) => {
    return request(endpoint, {
        method: 'DELETE'
    });
};

const refresh = async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}token/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            refresh: refreshToken
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            error: 'Failed to refresh token'
        }));

        throw new Error(
            error.detail ||
            error.error ||
            'Failed to refresh token'
        );
    }

    const data = await response.json();
    setTokens(data.access, data.refresh);
    return data;
};

const auth = {
    login,
    logout,
    get,
    post,
    put,
    delete: deleteRequest,
    register,
    refresh
};

export { auth };

