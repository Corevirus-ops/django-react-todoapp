import {useState, Activity} from 'react'
import {auth} from '../tools/auth'


export default function Register({setUser, setUseLoginPage}) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false);

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
        setLoading(true)

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        try {
            const user = await auth.register(
                formData.username,
                formData.email,
                formData.password
            )
            setUser(user)
            setLoading(false)
        } catch (error) {
            setFormData({...formData, password: '', confirmPassword: ''})
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            <Activity mode={loading ? 'hidden' : 'visible'}>

            {error && <p>{error}</p>}

            <label>
                Username:
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Email:
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Password:
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Confirm Password:
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </label>

            <button type="button" onClick={() => setUseLoginPage(true)}>
                Already have an account?
            </button>
            <button type="submit" disabled={loading}>
                Register
            </button>
            </Activity>
        {loading && <p>Loading...</p>}

        </form>
    )
}
