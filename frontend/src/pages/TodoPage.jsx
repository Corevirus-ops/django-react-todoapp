import {useState, useEffect} from "react";
import { auth } from "../tools/auth";
export default function TodoPage({ handleLogout }) {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState({ title: "", description: "" });
    const [error, setError] = useState("");
    const [editToDo, setEditToDo] = useState(null);
    const [editTodoData, setEditTodoData] = useState({ title: "", description: "" });
    const [filter, setFilter] = useState("all");


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

    const handleToggleComplete = async (index) => {
        try {
            const todo = todos[index];
            const updatedTodo = { ...todo, completed: !todo.completed };
            const response = await auth.put(`todos/${todo.id}/`, updatedTodo);
            if (response && response.id) {
                setTodos(prevTodos => {
                    const updatedTodos = [...prevTodos];
                    updatedTodos[index] = response;
                    return updatedTodos;
                });
            } else {
                setError("Failed to toggle todo completion");
            }
        } catch (error) {
            console.error("Failed to toggle todo completion:", error);
            setError("Failed to toggle todo completion");
        }
    };

    const handleDelete = async (index) => {
        try {
            const todo = todos[index];
            const response = await auth.delete(`todos/${todo.id}/`);
           
            if (response.result) {
                setTodos(prevTodos => {
                    const updatedTodos = [...prevTodos];
                    updatedTodos.splice(index, 1);
                    return updatedTodos;
                });
            } else {
                setError("Failed to delete todo");
            }
        } catch (error) {
            console.error("Failed to delete todo:", error);
            setError("Failed to delete todo");
        }
    };

    const handleEdit = (index) => {
        setEditToDo(index);
        setEditTodoData({
            title: todos[index].title,
            description: todos[index].description
        });
    };

    const handleSaveEdit = async (index) => {
        try {
            const todo = todos[index];
            const updatedTodo = { ...todo, title: editTodoData.title, description: editTodoData.description };
            const response = await auth.put(`todos/${todo.id}/`, updatedTodo);
            if (response && response.id) {
                setTodos(prevTodos => {
                    const updatedTodos = [...prevTodos];
                    updatedTodos[index] = response;
                    return updatedTodos;
                });
                setEditToDo(null);
            } else {
                setError("Failed to save todo");
            }
        } catch (error) {
            console.error("Failed to save todo:", error);
            setError("Failed to save todo");
        }
    };

    const handleCancelEdit = () => {
        setEditToDo(null);
        setEditTodoData({ title: "", description: "" });
    };

    const handleToDoDataChange = (e) => {
        const { name, value } = e.target;
        setEditTodoData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    return (
        <div>
            <h1>Todo Page</h1>
            <button onClick={handleLogout}>Logout</button>
            <fieldset>
                <legend>Filter Todos</legend>
                <label>
                    <input type="radio" name="filter" value="all" checked={filter === "all"} onChange={() => setFilter("all")} />
                    All
                </label>
                <label>
                    <input type="radio" name="filter" value="completed" checked={filter === "completed"} onChange={() => setFilter("completed")} />
                    Completed
                </label>
                <label>
                    <input type="radio" name="filter" value="incomplete" checked={filter === "incomplete"} onChange={() => setFilter("incomplete")} />
                    Incomplete
                </label>
            </fieldset>
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="New todo" value={newTodo.title} onChange={handleChange} />
                <input type="text" name="description" placeholder="Description" value={newTodo.description} onChange={handleChange} />
                <button type="submit">Add</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
            <ul>
                {todos.filter(todo => {
                    if (filter === "all") return true;
                    if (filter === "completed") return todo.completed;
                    if (filter === "incomplete") return !todo.completed;
                    return true;
                }).map((todo, index) => (
                    <li key={`${todo.title} ${index}`}><div>
                        {editToDo === index ? (
                            <>
                                <input type="text" name="title" placeholder="New todo" value={editTodoData.title} onChange={handleToDoDataChange} />
                                <input type="text" name="description" placeholder="Description" value={editTodoData.description} onChange={handleToDoDataChange} />
                                <button onClick={() => handleSaveEdit(index)}>Save</button>
                                <button onClick={handleCancelEdit}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleEdit(index)}>Edit</button>
                                <h2>{todo.title}</h2>
                                <p>{todo.description}</p>
                                <input type="checkbox" checked={todo.completed} onChange={() => handleToggleComplete(index)} />
                                <button onClick={() => handleDelete(index)}>Delete</button>
                            </>
                        )}
                        </div></li>
                ))}
            </ul>
        </div>
    );
}