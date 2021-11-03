import {
  action,
  computed,
  IReactionDisposer,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";

const myAsyncPromise = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("done");
    }, 1000);
  });
interface ITodo {
  text: string;
  isDone: boolean;
}

class AuthStore {
  constructor() {
    makeObservable(this);
  }

  @observable isLoggedIn: boolean = false;

  @action login() {
    this.isLoggedIn = true;
  }
}

const authStore = new AuthStore();

class TodoStore {
  protected readonly authStore: AuthStore;

  constructor(authStore: AuthStore) {
    this.authStore = authStore;
    makeObservable(this);
  }

  @observable todos: ITodo[] = [
    { text: "todo1", isDone: false },
    { text: "todo2", isDone: true },
  ];

  @action _add(todo: ITodo) {
    if (this.authStore.isLoggedIn) {
      this.todos.push(todo);
    } else {
      console.error("not authorized");
    }
  }

  @action async add(todoText: string) {
    const result = await myAsyncPromise();
    this._add({ text: todoText, isDone: false });
    console.log(result);
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
  const todoStore = new TodoStore(authStore);

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
        <TodoItem key={todo.text} todo={todo} />
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

export const TodoCount: React.FC = observer(() => {
  const todoStore = useTodos();
  const disposer = React.useRef<IReactionDisposer | undefined>();

  React.useEffect(() => {
    if (!disposer.current) {
      disposer.current = reaction(
        () => todoStore.todos.length,
        () => console.log(todoStore.todos)
      );
    }
    return () => {
      disposer.current?.();
    };
  }, []);

  React.useEffect(() => {
    console.log("classic effect", todoStore.todos.length, todoStore.todos);
  }, [todoStore.todos.length]);

  return <span>{todoStore.todoCount}</span>;
});

const Auth: React.FC = observer(() => {
  return authStore.isLoggedIn ? (
    <span>Logged in</span>
  ) : (
    <button onClick={() => authStore.login()}>Login</button>
  );
});

export const App = () => {
  return (
    <>
      <TodoProvider>
        <TodoForm />
        <TodoList />
        <TodoCount />
        <Auth />
      </TodoProvider>
    </>
  );
};
