import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Authorization'],
    },
  });

  // Простой HTTP-логгер
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    const hasAuth = Boolean(req.headers?.authorization);
    res.on('finish', () => {
      const ms = Date.now() - start;
      // Не логируем тела/токены, только метаданные
      console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} ${ms}ms auth=${hasAuth ? 'yes' : 'no'}`);
    });
    next();
  });
  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://localhost:${port}`);
}
bootstrap();
