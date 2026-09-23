import {useState} from 'react';
import Register from '../components/Register';
import Login from '../components/Login';
export default function Auth({setUser}) {
    const [useLoginPage, setUseLoginPage] = useState(true)

    return (
        <div className="auth">
            {useLoginPage ? <Login setUser={setUser} setUseLoginPage={setUseLoginPage}/> : <Register setUser={setUser} setUseLoginPage={setUseLoginPage}/>}
        </div>
    )
}