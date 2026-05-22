import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyStatic from '@fastify/static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import { CONFIG } from '../../config/config.js';
import { orchestratorRoutes } from './routes/orchestrator.routes.js';
import { inventoryRoutes } from './routes/inventory.routes.js';
import { infrastructureRoutes } from './routes/infrastructure.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startServer() {
  console.log('🚀 UNUKO Orchestrator - Starting Resilient Product API');

  const server = fastify();

  // 1. Register Zod compilers
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // 2. Register CORS
  await server.register(cors, {
    origin: true,
  });

  // 3. Register Swagger for OpenAPI docs mapping from Zod
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'UNUKO Resilient Product API',
        description: 'OpenAPI/Swagger reference for 5G core state machine orchestration, devices simulation, and network status.',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${CONFIG.SERVER.PORT}`,
          description: 'Local development server',
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  // 4. Register Swagger UI dashboard
  await server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // 5. Register Routes
  await server.register(orchestratorRoutes);
  await server.register(inventoryRoutes);
  await server.register(infrastructureRoutes);

  // Serve static frontend assets if directory exists
  const possibleFrontendPaths = [
    path.resolve(__dirname, '../../sim-frontend/dist'),
    path.resolve(__dirname, '../../../sim-frontend/dist'),
    path.resolve(__dirname, '../../../../sim-frontend/dist'),
  ];

  let frontendPath: string | null = null;
  for (const p of possibleFrontendPaths) {
    if (fs.existsSync(p)) {
      frontendPath = p;
      break;
    }
  }

  if (frontendPath) {
    await server.register(fastifyStatic, {
      root: frontendPath,
      prefix: '/',
    });
    console.log(`📂 Serving dashboard frontend from: ${frontendPath}`);

    // Fallback handler for Single Page Application routing (React Router)
    server.setNotFoundHandler(async (request, reply) => {
      if (request.url.startsWith('/v1') || request.url.startsWith('/documentation')) {
        reply.code(404).send({ error: 'Not Found', message: `Route ${request.method}:${request.url} not found` });
        return;
      }
      return reply.sendFile('index.html');
    });
  } else {
    console.log('⚠️ No compiled frontend static path found. Static dashboard serving is disabled.');
  }

  // 6. Bind listener
  try {
    await server.listen({
      port: CONFIG.SERVER.PORT,
      host: CONFIG.SERVER.HOST,
    });
    console.log('\n---');
    console.log(`🌐 UNUKO Digital Twin - Backend ready at http://localhost:${CONFIG.SERVER.PORT}`);
    console.log('📖 OpenAPI/Swagger Docs ready at http://localhost:3000/documentation');
    console.log('✨ For Live Reload (HMR), use: http://localhost:5173');
    console.log('---\n');
  } catch (err) {
    console.error('Error starting Fastify server:', err);
    throw err;
  }

  return server;
}
