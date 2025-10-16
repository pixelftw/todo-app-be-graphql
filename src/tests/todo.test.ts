import { server } from "../app";
import type { Todo } from "../generated/graphql";

const getTodoByIdQuery = (id: string) => `
        query {
          todo(id: ${id}) {
            id
            title
            isCompleted
        }
      }
  `;

describe("Todo CRUD apis", () => {
  beforeAll(async () => {
    // Ensure server is started for executeOperation
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  let createdTodoId: string;

  it("should add a new todo", async () => {
    const mutation = `
      mutation {
        addTodo(title: "Learn GraphQL") {
          id
          title
          isCompleted
        }
      }
    `;

    const res = await server.executeOperation({ query: mutation });

    if (res.body.kind === "single") {
      const data = res.body.singleResult.data as { addTodo: Todo };

      expect(data.addTodo).toHaveProperty("title", "Learn GraphQL");
      expect(data.addTodo).toHaveProperty("id");
      expect(data.addTodo).toHaveProperty("isCompleted", false);

      createdTodoId = data.addTodo.id as string;
    }
  });

  it("should return error if user adds an empty todo item", async () => {
    const mutation = `
      mutation {
        addTodo(title: "") {
          id
          title
          isCompleted
        }
      }
     `;

    const res = await server.executeOperation({ query: mutation });

    if (res.body.kind === "single") {
      const result = res.body.singleResult.data;

      const error = res.body.singleResult.errors?.[0];

      if (error) {
        expect(result).toBeNull();
        expect(error.message).toBe("Please Enter a valid todo");
      } else {
        throw Error("Invalid todo item entry getting created into the system");
      }
    }
  });

  it("should list out all the todos available", async () => {
    const query = `
        query {
          todos {
            id
            title
            isCompleted
          }
        }
        `;

    const res = await server.executeOperation({ query });

    if (res.body.kind === "single") {
      const result = res.body.singleResult.data as { todos: Todo[] };

      expect(result.todos.length).toBeGreaterThan(0);
    }
  });

  it("should find todo based on given id", async () => {
    const res = await server.executeOperation({
      query: getTodoByIdQuery(createdTodoId),
    });

    if (res.body.kind === "single") {
      const { todo } = res.body.singleResult.data as { todo: Todo };

      expect(todo).toHaveProperty("title", "Learn GraphQL");
      expect(todo).toHaveProperty("id");
      expect(todo).toHaveProperty("isCompleted", false);
    }
  });

  it("should return error in case todo item not available for a given id", async () => {
    const res = await server.executeOperation({
      query: getTodoByIdQuery("-1"),
    });

    if (res.body.kind === "single") {
      const error = res.body.singleResult.errors?.[0];

      if (error?.message) {
        expect(error.message).toEqual("Todo item does not exist");
      } else {
        throw Error("Should not come in this block");
      }
    }
  });

  it("should mark a todo as completed", async () => {
    const mutation = `
      mutation {
        markTodoCompleted(id: ${createdTodoId}) {
            id
            isCompleted
        }
      }
    `;

    const res = await server.executeOperation({ query: mutation });

    if (res.body.kind === "single") {
      const result = res.body.singleResult.data as {
        markTodoCompleted: Omit<Todo, "title">;
      };

      expect(result.markTodoCompleted.isCompleted).toEqual(true);
      expect(result.markTodoCompleted.id).toEqual(createdTodoId);
    }
  });

  it("should return error if todo is not available to be marked as completed", async () => {
    const mutation = `
      mutation {
        markTodoCompleted(id: -1) {
            id
            isCompleted
        }
      }
    `;

    const res = await server.executeOperation({ query: mutation });

    if (res.body.kind === "single") {
      const error = res.body.singleResult.errors?.[0];

      expect(error?.message).toEqual("Todo does not exist");
    }
  });

  it("should return error if the todo not available", async () => {
    const mutation = `
    mutation {
      deleteTodo(id: -1) {
          id
          title
          isCompleted
      }
    }
  `;

    const res = await server.executeOperation({ query: mutation });

    if (res.body.kind === "single") {
      expect(res.body.singleResult.errors?.[0]?.message).toBe(
        "Todo item does not exist for given id"
      );
    }
  });

  it("should delete todo with given id", async () => {
    const exisingTodo = await server.executeOperation({
      query: getTodoByIdQuery(createdTodoId),
    });

    if (exisingTodo.body.kind === "single") {
      const { todo } = exisingTodo.body.singleResult.data as { todo: Todo };

      expect(todo).toHaveProperty("title", "Learn GraphQL");
      expect(todo).toHaveProperty("id", createdTodoId);
    }

    const mutation = `
    mutation {
      deleteTodo(id: ${createdTodoId}) {
          id
          title
          isCompleted
      }
    }
  `;

    const res = await server.executeOperation({ query: mutation });

    if (res.body.kind === "single") {
      const result = res.body.singleResult.data as { deleteTodo: Todo };

      expect(result.deleteTodo.id).toEqual(createdTodoId);
    }

    const afterDeleteResponse = await server.executeOperation({
      query: getTodoByIdQuery(createdTodoId),
    });

    if (afterDeleteResponse.body.kind === "single") {
      const error = afterDeleteResponse.body.singleResult.errors?.[0];

      expect(error?.message).toEqual("Todo item does not exist");
    }
  });
});
