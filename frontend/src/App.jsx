import {useState, useEffect} from 'react';
import Auth from './pages/Auth';
import {auth} from './tools/auth';
import TodoPage from './pages/TodoPage';

function App() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token')

        if (!accessToken) {
            return
        }

        const refreshToken = localStorage.getItem('refresh_token');


        const getUser = async () => {
            try {
                const user = await auth.get('me/')
                if (!user && refreshToken) {
                    try {
                        await auth.refresh();
                        const user = await auth.get('me/');
                        setUser(user);
                    } catch (error) {
                        console.error('Failed to refresh token:', error);
                        auth.logout();
                    }
                }
                setUser(user)
            } catch (error) {
                console.error('Failed to restore login:', error)
                auth.logout()
            }
        }

        getUser()
    }, [])

    const handleLogout = () => {
        auth.logout()
        setUser(null);
    }


    return (
        <>
            {!user && <Auth setUser={setUser}/>}
            {user && <TodoPage handleLogout={handleLogout} />}
        </>
    )
}

export default App
