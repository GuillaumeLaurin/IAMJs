import https from 'https';
import fs from 'fs';
import { createServer } from 'https';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT ?? 4200;

app.prepare().then(() => {
  if (process.env.HTTPS_ENABLED === 'true') {
    const httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH!),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH!),
    };
    createServer(httpsOptions, (req, res) => handle(req, res)).listen(port, () => {
      /* listen */
    });
  } else {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      /*listen*/
    });
  }
});
