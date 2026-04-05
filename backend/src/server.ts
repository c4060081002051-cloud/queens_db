import { loadConfig } from "./config.js";
import { setupDatabase } from "./models/index.js";
import { buildApp } from "./app.js";

const config = loadConfig();
const sequelize = setupDatabase(config);

await sequelize.authenticate();

// One-time schema sync from Sequelize models: uncomment, run `npm run dev` once, then comment
// again. Leaving `sync({ alter: true })` enabled can recreate/alter indexes on every startup.
// await sequelize.sync({ alter: true });

const app = buildApp(config);

const server = app.listen(config.PORT, config.HOST, () => {
  console.log(
    `API (Express + Sequelize) on http://${config.HOST}:${config.PORT} · MySQL ${config.DB_NAME} @ ${config.DB_HOST}:${config.DB_PORT}`,
  );
});

async function shutdown() {
  await sequelize.close();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
