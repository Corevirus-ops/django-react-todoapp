import { useActionState, useState } from 'react'
import {auth} from '../tools/auth'


export default function Register({setUser, setUseLoginPage}) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData(current => ({ ...current, [name]: value }))
    }

    const [error, submitAction, isPending] = useActionState(async (_previousError, formData) => {
        void _previousError
        const username = String(formData.get('username') ?? '')
        const email = String(formData.get('email') ?? '')
        const password = String(formData.get('password') ?? '')
        const confirmPassword = String(formData.get('confirmPassword') ?? '')

        if (password !== confirmPassword) return 'Passwords do not match'
        if (password.length < 8) return 'Password must be at least 8 characters'

        try {
            const user = await auth.register(username, email, password)
            setUser(user)
            return null
        } catch (error) {
            setFormData(current => ({ ...current, password: '', confirmPassword: '' }))
            return error instanceof Error ? error.message : 'Unable to create account. Please try again.'
        }
    }, null)

    return (
        <form action={submitAction}>
            <h2>Register</h2>
            {error && <p role="alert">{error}</p>}
            {isPending && <p className="register-status" role="status">Creating your account...</p>}
            <fieldset className="register-fields" disabled={isPending}>
                <label>
                    Username:
                    <input type="text" name="username" autoComplete="username" value={formData.username} onChange={handleChange} required />
                </label>

                <label>
                    Email:
                    <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required />
                </label>

                <label>
                    Password:
                    <input type="password" name="password" autoComplete="new-password" minLength={8} value={formData.password} onChange={handleChange} required />
                </label>

                <label>
                    Confirm Password:
                    <input type="password" name="confirmPassword" autoComplete="new-password" minLength={8} value={formData.confirmPassword} onChange={handleChange} required />
                </label>

                <button type="button" onClick={() => setUseLoginPage(true)}>
                    Already have an account?
                </button>
                <button type="submit" aria-busy={isPending}>
                    {isPending ? 'Creating account...' : 'Register'}
                </button>
            </fieldset>
        </form>
    )
}
