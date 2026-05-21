// src/server.ts
import express from 'express';
import sgp22Router from './sgp22/router';
import sgp32Router from './sgp32/router';

const app: express.Express = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[smdp-mockv2] [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * SGP.22 MODULE: Consumer Architecture
 * Endpoints under the prefix /gsma/rsp2/
 */
app.use('/gsma/rsp2', (req, res, next) => {
  res.setHeader('X-Admin-Protocol', 'gsma/rsp/v3.0.0');
  res.setHeader('Content-Type', 'application/json');
  next();
}, sgp22Router);

/**
 * SGP.32 MODULE : IoT Architecture (Novedad v1.2)
 * Endpoints under the prefix /gsma/rsp3/
 */
app.use('/gsma/rsp3', (req, res, next) => {
  res.setHeader('X-Admin-Protocol', 'gsma/rsp/v1.2.0');
  res.setHeader('Content-Type', 'application/json');
  next();
}, sgp32Router);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    return res.status(400).json({ error: "Malformed JSON Payload" });
  }
  next();
});

let server: any;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`🚀 [smdp-mockv2] Servidor de Mocks Global Levantado`);
    console.log(`📡 [SGP.22] Consumer RSP listo en http://localhost:${port}/gsma/rsp2/`);
    console.log(`📡 [SGP.32] eSIM IoT RSP listo en http://localhost:${port}/gsma/rsp3/`);
  });
}

export { server };
export default app;