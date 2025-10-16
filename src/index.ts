import { startStandaloneServer } from "@apollo/server/standalone";
import { server } from "./app.ts";

const PORT = 4103;

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  console.log(`GraphQL Server running at: ${url}`);
}

startServer();
