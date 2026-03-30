import https from 'https';
import fs from 'fs';
import { createServer } from 'https';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync('/app/certs/localhost+2-key.pem'),
    cert: fs.readFileSync('/app/certs/localhost+2.pem'),
};

app.prepare().then(() => {
    createServer(httpsOptions, (req, res) => {
        handle(req, res);
    }).listen(process.env.PORT, () => {
        /* listen */
    });
});