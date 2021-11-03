import React, { useRef } from "react";
import { action, makeObservable, observable, Reaction } from "mobx";
import { observer } from "mobx-react-lite";

interface ITodo {
  text: string;
  done: boolean;
}

export class TodoStore {
  @observable todos: ITodo[] = [
    { text: "learn", done: true },
    { text: "practice", done: false },
  ];

  @action add(text: string) {
    this.todos.push({ text, done: false });
  }

  @action markDone(todo: ITodo) {
    todo.done = true;
  }

  @action markUndone(todo: ITodo) {
    todo.done = false;
  }

  @action remove(todo: ITodo) {
    const index = this.todos.findIndex((e) => e === todo);

    this.todos.splice(index, 1);
  }

  constructor() {
    makeObservable(this);
  }
}

const TodoContext = React.createContext<TodoStore | null>(null);

const observer2 = <P extends object>(
  component: React.FunctionComponent<P>
): any => {
  return (props: P) => {
    const [, tick] = React.useState([]);

    const rerender = () => tick([]);

    const r = new Reaction("observer reaction", rerender);

    let renderResult;

    r.track(() => {
      renderResult = component(props);
    });

    React.useEffect(
      () => () => {
        r.dispose();
      },
      []
    );

    return renderResult;
  };
};

const useTodos = () => {
  const store = React.useContext(TodoContext);

  if (!store) {
    throw new Error("TodoStore not initialized");
  }

  return store;
};

const TodoProvider: React.FC = ({ children }) => {
  const store = React.useMemo(() => new TodoStore(), []);

  return <TodoContext.Provider value={store}>{children}</TodoContext.Provider>;
};

interface TodoItemProps {
  todo: ITodo;
}

const TodoItem: React.FC<TodoItemProps> = observer(({ todo }) => {
  const store = useTodos();

  return (
    <li>
      <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
        {todo.text}
      </span>
      <button
        onClick={() =>
          todo.done ? store.markUndone(todo) : store.markDone(todo)
        }
      >
        {todo.done ? "Undo" : "Mark done"}
      </button>
      <button onClick={() => store.remove(todo)}>Remove</button>
    </li>
  );
});

const TodoList: React.FC = observer(() => {
  const store = useTodos();

  return (
    <ul>
      {store.todos.map((todo) => (
        <TodoItem todo={todo} />
      ))}
    </ul>
  );
});

const TodoForm: React.FC = observer(() => {
  const store = useTodos();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (inputRef.current) {
          store.add(inputRef.current.value);
          inputRef.current.value = "";
        }
      }}
    >
      <input ref={inputRef} type="text" />
      <button type="submit">Add todo</button>
    </form>
  );
});

export const Todo: React.FC = () => (
  <TodoProvider>
    <TodoForm />
    <TodoList />
  </TodoProvider>
);
