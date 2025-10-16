import type { Resolvers, Todo } from "../../generated/graphql.ts";

const todos: Todo[] = [];

export const todoResolvers: Resolvers = {
  Query: {
    todos: () => todos,
    todo: (_, { id }) => {
      const todo = todos.find((todo) => todo.id === id);

      if (!todo) {
        throw Error(`Todo item does not exist`);
      }

      return todo;
    },
  },
  Mutation: {
    addTodo: (_parent, args) => {
      if (!args.title) {
        throw Error("Please Enter a valid todo");
      }

      const newTodo: Todo = {
        id: (todos.length + 1).toString(),
        title: args.title,
        isCompleted: false,
      };

      todos.push(newTodo);

      return newTodo;
    },
    markTodoCompleted: (_parent, { id }) => {
      const todo = todos.find((todo) => todo.id === id);

      if (todo) {
        todo.isCompleted = true;
        return todo;
      } else {
        throw Error("Todo does not exist");
      }
    },
    deleteTodo: (_parant, { id }) => {
      const todoIndex = todos.findIndex((todo) => todo.id === id);

      const todo = todos[todoIndex];

      if (todoIndex === -1) {
        throw Error("Todo item does not exist for given id");
      }

      todos.splice(todoIndex, 1);

      return todo as Todo;
    },
  },
};
