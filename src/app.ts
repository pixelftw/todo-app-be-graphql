import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { ApolloServer } from "@apollo/server";
import type { Resolvers } from "./generated/graphql.js";
import { todoResolvers } from "./graphql/resolvers/todo.resolver.ts";

const todoTypeDefinations = loadSchemaSync("./src/graphql/schema/todo.gql", {
  loaders: [new GraphQLFileLoader()],
});

const resolvers: Resolvers = {
  ...todoResolvers,
};

export const server = new ApolloServer({
  typeDefs: [todoTypeDefinations],
  resolvers,
});
