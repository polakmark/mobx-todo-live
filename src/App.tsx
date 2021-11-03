import { action, computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
interface ITodo {
  text: string;
  isDone: boolean;
}

class TodoStore {
  constructor() {
    makeObservable(this);
  }

  @observable todos: ITodo[] = [
    { text: "todo1", isDone: false },
    { text: "todo2", isDone: true },
  ];

  @action add(todoText: string) {
    this.todos.push({ text: todoText, isDone: false });
  }

  @action markDone(todo: ITodo) {
    todo.isDone = true;
  }

  @action markUndone(todo: ITodo) {
    todo.isDone = false;
  }

  @action remove(todo: ITodo) {
    const index = this.todos.findIndex((e) => e === todo);
    this.todos.splice(index, 1);
  }

  @computed get todoCount() {
    return this.todos.length;
  }
}

const TodoContext = React.createContext<TodoStore | undefined>(undefined);

const useTodos = () => {
  const context = React.useContext(TodoContext);

  if (!context) {
    throw new Error("Todostore not initialized");
  }

  return context;
};

const TodoProvider: React.FC = ({ children }) => {
  const todoStore = new TodoStore();

  return (
    <TodoContext.Provider value={todoStore}>{children}</TodoContext.Provider>
  );
};

interface TodoItemProps {
  todo: ITodo;
}

export const TodoItem: React.FC<TodoItemProps> = observer(({ todo }) => {
  const todoStore = useTodos();

  return (
    <li>
      <span
        style={{
          textDecoration: todo.isDone ? "line-through" : "none",
        }}
      >
        {todo.text}
      </span>
      <button
        onClick={() =>
          todo.isDone ? todoStore.markUndone(todo) : todoStore.markDone(todo)
        }
      >
        {todo.isDone ? "Mark undone" : "Mark done"}
      </button>
      <button onClick={() => todoStore.remove(todo)}>Remove</button>
    </li>
  );
});

export const TodoList = observer(() => {
  const todoStore = useTodos();

  return (
    <ul>
      {todoStore.todos.map((todo) => (
        <TodoItem todo={todo} />
      ))}
    </ul>
  );
});

export const TodoForm = () => {
  const todoStore = useTodos();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        todoStore.add(inputRef.current!.value);
        inputRef.current!.value = "";
      }}
    >
      <input ref={inputRef} type="text" />
      <button type="submit">Submit</button>
    </form>
  );
};

export const App = () => {
  return (
    <>
      <TodoForm />
      <TodoList />
    </>
  );
};
