import {useState, useEffect} from "react";
import { auth } from "../tools/auth";
export default function TodoPage({ handleLogout }) {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState({ title: "", description: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        // Fetch todos from an API or local storage
        const fetchTodos = async () => {
            // Example: Replace with your API call
            const response = await auth.get("todos/");
            setTodos(response);
        };
        fetchTodos();
    }, []);

    const handleAddTodo = (id) => {
        setTodos([...todos, {id, title: newTodo.title, description: newTodo.description, completed: false }]);
        setNewTodo({ title: "", description: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTodo.title.trim()) return;
        try {
            const response = await auth.post("todos/", { title: newTodo.title, description: newTodo.description, completed: false });
            if (response && response.id) {
                handleAddTodo(response.id);
            } else {
                setError("Failed to add todo");
            }
        } catch (error) {
            console.error("Failed to add todo:", error);
            setError("Failed to add todo");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewTodo(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    }; 

    return (
        <div>
            <h1>Todo Page</h1>
            <button onClick={handleLogout}>Logout</button>
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="New todo" value={newTodo.title} onChange={handleChange} />
                <input type="text" name="description" placeholder="Description" value={newTodo.description} onChange={handleChange} />
                <button type="submit">Add</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
            <ul>
                {todos.map((todo, index) => (
                    <li key={`${todo.title} ${index}`}><div>
                        <h2>{todo.title}</h2>
                        <p>{todo.description}</p>
                        <input type="checkbox" checked={todo.completed} />
                        </div></li>
                ))}
            </ul>
        </div>
    );
}