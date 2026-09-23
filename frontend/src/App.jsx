import {useState, useEffect} from 'react'
function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetch('http://localhost:8000/api/login').then(res => res.json())
      setUser(userData)
    }

    fetchUser()
  }, [])

  return (
    <>
   <header>Hello World</header>
    </>
  )
}

export default App
