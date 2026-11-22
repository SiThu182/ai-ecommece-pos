import type { Server } from 'node:http';
import { createApp } from './app';
import { EnvValidationError, loadEnv, type Env } from './core/config/env';

const SHUTDOWN_TIMEOUT_MS = 10_000;

function registerShutdown(server: Server): void {
  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`${signal} received, shutting down...`);
    server.close((err) => {
      if (err) {
        console.error('Error during shutdown', err);
        process.exit(1);
      }
      process.exit(0);
    });
    // Force exit if open connections keep the server alive too long.
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

function main(): void {
  let env: Env;
  try {
    env = loadEnv();
  } catch (err) {
    if (err instanceof EnvValidationError) {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }

  const app = createApp({ env });
  const server = app.listen(env.PORT);

  server.on('listening', () => {
    console.log(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
  server.on('error', (err) => {
    console.error('Failed to start HTTP server', err);
    process.exit(1);
  });

  registerShutdown(server);
}

main();
