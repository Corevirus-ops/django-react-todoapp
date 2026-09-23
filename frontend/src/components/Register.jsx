import {useState} from 'react'
import {auth} from '../tools/auth'
export default function Register({setUser, setUseLoginPage}) {
const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    })
}

const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match")
        return
    }
    const user = await auth.post('register/', formData)
    setUser(user)
}

return (
    <form onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input 
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
        />
        <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
        />
        <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
        />
        <input 
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
        />
        <button type="button" onClick={() => setUseLoginPage(true)}>Already have an account?</button>
        <button type="submit">Register</button>
    </form>
)

}