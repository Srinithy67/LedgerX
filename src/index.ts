import { isDatabaseReady } from './config/database';

async function bootstrap() {
  const dbReady = await isDatabaseReady();

  if (!dbReady) {
    process.env.USE_MEMORY_STORE = 'true';
    console.warn('⚠️  Supabase tables not found — using in-memory data store.');
    console.warn('   Run "npm run db:setup" after adding DATABASE_URL to .env');
    console.warn('   Or paste supabase/migrations/20260615_init.sql into Supabase SQL Editor.\n');
  } else {
    console.log('✅ Connected to Supabase database.\n');
  }

  const { app } = await import('./app');
  const { env } = await import('./config/env');

  const server = app.listen(env.PORT, () => {
    console.log(`=========================================`);
    console.log(`  PocketPetal Backend API Running        `);
    console.log(`  Environment: ${env.NODE_ENV}           `);
    console.log(`  Storage:    ${dbReady ? 'Supabase' : 'In-Memory (dev)'} `);
    console.log(`  Port:        ${env.PORT}               `);
    console.log(`  Web Portal:  http://localhost:${env.PORT}`);
    console.log(`=========================================`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down gracefully.');
    server.close(() => {
      console.log('Http server closed.');
    });
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start PocketPetal:', err);
  process.exit(1);
});
