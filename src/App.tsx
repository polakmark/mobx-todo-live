import { action, computed, makeObservable, observable } from "mobx";

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

const todoStore = new TodoStore();

interface TodoItemProps {
  todo: ITodo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  return <li>{todo.text}</li>;
};

export const App = () => {
  return (
    <ul>
      {todoStore.todos.map((todo) => (
        <TodoItem todo={todo} />
      ))}
    </ul>
  );
};
