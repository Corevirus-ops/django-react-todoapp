
import {useState} from 'react'
import {auth} from '../tools/auth'

export default function Login({setUser, setUseLoginPage}) {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    const [error, setError] = useState('')

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const tokens = await auth.login(
                formData.username,
                formData.password
            )

            setUser({
                username: formData.username,
                ...tokens
            })
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {error && <p>{error}</p>}

            <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
            />

            <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
            />

            <button type="button" onClick={() => setUseLoginPage(false)}>
                Don't have an account?
            </button>

            <button type="submit">
                Login
            </button>
        </form>
    )
}

