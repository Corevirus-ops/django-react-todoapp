import {useState, useEffect} from 'react';
import Auth from './pages/Auth';
import {auth} from './tools/auth';

function App() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token')

        if (!accessToken) {
            return
        }

        const getUser = async () => {
            try {
                const user = await auth.get('me/')
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
            {user && (
                <div>
                    <h2>Welcome {user.username}</h2>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            )}
        </>
    )
}

export default App
