const supabaseUrl = "https://jeiapeayuntfzsxwvgib.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaWFwZWF5dW50ZnpzeHd2Z2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyODQ0MTIsImV4cCI6MjA0Nzg2MDQxMn0.EEVXJjZ_WERczupBLQcNEftpchRnmsSWBs0NjW7mX9g";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let todos = [];

function errHandling(err) {
  if (err) {
    console.error(err);
    alert("Il y a eu une erreur");
    return;
  }
}

async function generateTodos(update = false) {
  const todoList = document.getElementById("todos");
  todoList.innerHTML = "";

  if (update) {
    const { data: fetchedTodos, error } = await supabase
      .from("todos")
      .select("*");
    if (errHandling(error)) return;
    todos = fetchedTodos;
  }

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${
        todo.completed ? "checked" : ""
      }>
      <span class="todo-text">${todo.content}</span>
      <button class="todo-delete">Delete</button>
    `;

    const checkbox = li.querySelector(".todo-checkbox");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const deleteButton = li.querySelector(".todo-delete");
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));
    todoList.appendChild(li);
  });
}

async function addTodo(content) {
  const newTodo = {
    content: content,
    completed: false,
  };

  const { data, error } = await supabaseClient
    .from("todos")
    .insert([newTodo])
    .select();

  if (errHandling(error)) return;

  todos.push(data[0]);
  generateTodos();
}

async function toggleTodo(id) {
  const todoIndex = todos.findIndex((t) => t.id === id);
  if (todoIndex !== -1) {
    const updatedTodo = {
      ...todos[todoIndex],
      completed: !todos[todoIndex].completed,
    };

    const { data, error } = await supabaseClient
      .from("todos")
      .update(updatedTodo)
      .eq("id", id)
      .select();

    if (errHandling(error)) return;

    todos[todoIndex] = data[0];
    generateTodos();
  }
}

async function deleteTodo(id) {
  const { error } = await supabaseClient.from("todos").delete().eq("id", id);

  if (errHandling(error)) return;
  todos = todos.filter((t) => t.id !== id);

  generateTodos();
}

document.getElementById("todo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("todo-input");
  if (input.value.trim()) {
    await addTodo(input.value.trim());
    input.value = "";
  }
});

generateTodos(true);
