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

    const visibleTodos = todos
        .map((todo, index) => ({ todo, index }))
        .filter(({ todo }) => {
            if (filter === "completed") return todo.completed;
            if (filter === "incomplete") return !todo.completed;
            return true;
        });

    return (
        <main className="todo-app">
            <header className="todo-header">
                <div className="brand-mark" aria-hidden="true">✓</div>
                <div className="header-copy">
                    <p className="eyebrow">PERSONAL WORKSPACE</p>
                    <h1>Make room for what matters.</h1>
                </div>
                <button className="logout-button" onClick={handleLogout}>Log out <span aria-hidden="true">↗</span></button>
            </header>

            <section className="todo-content" aria-label="Todo list">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">YOUR LIST</p>
                        <h2>Today at a glance</h2>
                    </div>
                    <p className="task-count">
                        <strong>{todos.length}</strong> tasks <span aria-hidden="true">·</span>{" "}
                        <strong>{todos.filter(todo => todo.completed).length}</strong> done
                    </p>
                </div>

                <form className="todo-composer" onSubmit={handleSubmit}>
                    <div className="compose-fields">
                        <input
                            className="task-title-input"
                            type="text"
                            name="title"
                            placeholder="What needs doing?"
                            aria-label="Task title"
                            value={newTodo.title}
                            onChange={handleChange}
                        />
                        <input
                            className="task-description-input"
                            type="text"
                            name="description"
                            placeholder="Add a note or details"
                            aria-label="Task description"
                            value={newTodo.description}
                            onChange={handleChange}
                        />
                    </div>
                    <button className="add-button" type="submit"><span aria-hidden="true">+</span> Add task</button>
                    {error && <p className="form-error" role="alert">{error}</p>}
                </form>

                <div className="list-toolbar">
                    <p className="list-label">TASKS <span>{visibleTodos.length.toString().padStart(2, "0")}</span></p>
                    <fieldset className="todo-filters">
                        <legend>Filter tasks</legend>
                        <label>
                            <input type="radio" name="filter" value="all" checked={filter === "all"} onChange={() => setFilter("all")} />
                            <span>All</span>
                        </label>
                        <label>
                            <input type="radio" name="filter" value="incomplete" checked={filter === "incomplete"} onChange={() => setFilter("incomplete")} />
                            <span>To do</span>
                        </label>
                        <label>
                            <input type="radio" name="filter" value="completed" checked={filter === "completed"} onChange={() => setFilter("completed")} />
                            <span>Done</span>
                        </label>
                    </fieldset>
                </div>

                <ul className="todo-list">
                    {visibleTodos.map(({ todo, index }) => (
                    <li className={`todo-item${todo.completed ? " is-complete" : ""}`} key={todo.id ?? `${todo.title} ${index}`}>
                        {editToDo === index ? (
                            <div className="edit-task">
                                <input type="text" name="title" aria-label="Edit task title" value={editTodoData.title} onChange={handleToDoDataChange} />
                                <input type="text" name="description" aria-label="Edit task description" value={editTodoData.description} onChange={handleToDoDataChange} />
                                <div className="todo-actions">
                                    <button className="text-button" onClick={() => handleSaveEdit(index)}>Save</button>
                                    <button className="text-button muted-button" onClick={handleCancelEdit}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <label className="todo-check">
                                    <input type="checkbox" checked={todo.completed} onChange={() => handleToggleComplete(index)} aria-label={`Mark ${todo.title} ${todo.completed ? "incomplete" : "complete"}`} />
                                    <span aria-hidden="true"></span>
                                </label>
                                <div className="task-copy">
                                    <h3>{todo.title}</h3>
                                    {todo.description && <p>{todo.description}</p>}
                                </div>
                                <div className="todo-actions">
                                    <button className="text-button" onClick={() => handleEdit(index)}>Edit</button>
                                    <button className="text-button delete-button" onClick={() => handleDelete(index)}>Delete</button>
                                </div>
                            </>
                        )}
                    </li>
                    ))}
                    {visibleTodos.length === 0 && (
                        <li className="empty-state">
                            <span className="empty-mark" aria-hidden="true">✓</span>
                            <h3>{todos.length === 0 ? "A clear start." : "Nothing in this view."}</h3>
                            <p>{todos.length === 0 ? "Add a task above and give your day some shape." : "Try another filter to see your tasks."}</p>
                        </li>
                    )}
                </ul>
            </section>
        </main>
    );
}