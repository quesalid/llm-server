/********************************************************
 * API SERVER
 * Serve api request
 *
 * |----------|-----------------|-------------|-------------|
 * | BROWSER  |   APP PROXY     | API SERVER  |  ID SERVER  |
 * |------------------------------------------|-------------|
 * | (req) -->|-->              |             |             | browser requests resource
 * |          |   (tokverify)   |             |             | app-proxy check apptoken
 * |          |     |ok    |nok |             |             | if bad apptoken app-proxy redirects browser to id-server
 * | (redir)<-|-----|------     |             |             |
 * |     |    |     |           |             |             |
 * |     ---->|-----|-----------|------------>|  (chekred)  | id-server checks redir with registered redirection
 * |          |     |           |             |   |nok  |ok | ERROR if not match - redir is an endpoint inside app-proxy
 * |          |     |           |             |   |     |   | else redirect browser to login page
 * |    [1]<--|-----|-----------|-------------| (ERR)   |   |
 * |      ----|-----|-----------|-------------|<-----(login)|
 * |      |   |     |           |             |             |
 * | (login)->|-----|-----------|------------>|  (check)    | request authtoken with apikey & credentials
 * |          |     |           |             |   |nok |ok  |
 * |    [2]<--|-----|-----------|-------------| (ERR)  |    | ERROR if bad credentials or bad apikey
 * |          |     |           |             |        |    | else
 * |          |     |     ------|-------------|<-(token)    | id-server send apikey + authtoken to redirect endpoint in app-proxy
 * |          |     | (apikey)  |             |             | app-proxy stores apikey for later calls
 * |          |     | (auttoken)|             |             |
 * |    <-----|-----|-(apptoken)|             |             | app-proxy transforms authtoken to apptoken and send to browser
 * |    |     |     |           |             |             | browser access resource with apptoken
 * | (req) -->|-->  |           |             |             |
 * |          |   (route) ----->|----         |             | app-proxy routes browser to the resource (api-server)
 * |          |                 |(checkapikey)|             | check app-proxy apikey
 * |          |                 |   |ok  |nok |             |
 * |          |                 |   |    ---->|  (chekak)   | id-server checks api-key
 * |          |                 |   |         |   |nok  |ok |
 * |          |       (ERROR)<--|<-(ERROR)<---| (ERR)   |   | ERROR if bad apikey
 * |          |                 |   |  -------|---------    | id-server return confimed apikey to api-server
 * |          |                 |   |(storeak)|             | api-server stores apikey in store
 * |          |                 |   |  |      |             |
 * |          |            <----|<-(res)      |             | api-server reponds to browser via app-proxy
 * |    [3]<--|<-- (format)     |             |             | app-proxy eventually reformats the response
 * |__________|_________________|_____________|_____________| SUCCESS
 *
 *
 * USE ORM
 * https://typeorm.io
 * TYPEORM MIGRATION
 * https://dev.to/andreasbergstrom/configure-typeorm-migrations-in-5-minutes-2njg
 * CREDIT CARD LEVEL
 * https://www.hostmerchantservices.com/articles/ultimate-guide-to-level-ii-and-iii-credit-card-data/
 * NEURAL NETWORKS
 * https://cs.stanford.edu/people/karpathy/convnetjs/started.html
 * https://brain.js.org/#/ 
 * https://caza.la/synaptic/#/
 ********************************************************/

// GITOPS
// https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions
// GITHOOKS
// https://www.digitalocean.com/community/tutorials/how-to-use-git-hooks-to-automate-development-and-deployment-task

// SERVER IMPORTS
import minimist from "minimist";
import express from "express";
import https from "https";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import MemoryStore from "memorystore";
// FROM LOCAL LIB
import startup from "./lib/start/startup.js";
import errorHandler from "./lib/start/errorhandler.js";
import { loggers, loadLogger } from "./lib/start/logger.js";
import httpLogger from "./lib/start/httpLogger.js";
import setupBodyParser from "./lib/start/bparse.js";
// PROXY ROUTES
import setupRouter from "./lib/router/router.js";
import setupRateLimit from "./lib/router/ratelimit.js";
import setupCreditCheck from "./lib/router/checkcredit.js";
// AUTH
import setupAuth from "./lib/auth/auth.js";
// CRYPTOUTILS
import cutils from "./lib/utils/cryptoutils.js";

const sessionStore = MemoryStore(session);
let store;



const apiServ = async () => {
    let argv = minimist(process.argv.slice(2));
    let logger:any
    if (argv.c) process.env.GP_CONFFILE = argv.c;
    startup()
        .then(async (ret:any) => {
            const lgrs = await loadLogger()
            logger = lgrs.simple
            logger.info(JSON.stringify(argv));
            const ROUTES:any = ret.routes;
            let server:any;
            let version = process.env.VERSION;

            const app:any = express();

            let port: any = process.env.HTTPPORT?parseInt(process.env.HTTPPORT):80;

            // SET SESSION STORE
            store = new sessionStore({
                checkPeriod: 86400000, // prune expired entries every 24h
            });
            if (ret.env.CORSENABLE) {
                logger.info("USE CORS");
                app.use(cors({ origin: true }));
            }
            // BODYPARSER
            if (ret.env.BODYPARSER) {
                logger.info("USE BODYPARSER");
                setupBodyParser(app, ROUTES);
            }
            // MORGAN LOGGER
            app.use(httpLogger);
            // AUTH
            if (ret.env.AUTH) {
                logger.info("USE AUTH ");
                setupAuth(app, ROUTES);
            }
            // RATE LIMIT
            if (ret.env.RATELIMIT) {
                logger.info("USE RATELIMIT");
                setupRateLimit(app, ROUTES);
            }
            // CHECK CREDIT
            if (ret.env.CREDITCHECK) {
                logger.info("USE CREDIT CHECK");
                setupCreditCheck(app, ROUTES);
            }
            // ROUTES
            logger.info("USE ROUTE WITH MODELTYPE: [" + process.env.MODELTYPE + "]");
            await setupRouter(app, ROUTES);
            logger.info("USE ROUTE CONNECTED WITH DATABASE");
            // ERROR HANDLER
            app.use(errorHandler);
            switch (process.env.HTTPTYPE) {
                case "HTTP":
                    /*app.listen(port, () => {
                                  console.log('HTTP: listening on port ' + port);
                              });*/
                    server = http.createServer(app);
                    break;
                case "HTTPS":
                    try {

                        let __dirname = path.dirname(fileURLToPath(import.meta.url));
                        let certfile:any = process.env.TARGETSTATUS != 'production' ? path.join(__dirname, './conf', 'cert.pem') : process.env.APICERTFILE
                        let keyfile:any = process.env.TARGETSTATUS != 'production' ? path.join(__dirname, './conf', 'key.pem') : process.env.APIKEYFILE
                        const { key, cert } = cutils.getCerts(keyfile, certfile) as {key:string,cert:string}

                        server = https.createServer({ key: key, cert: cert }, app);
                    } catch (error) {
                        logger.error(error);
                        process.exit(0);
                    }
                    break;
            }
            server.listen(port, process.env.SERVERHOST, () => {
                logger.info("*******************************");
                logger.info("     LLM SERVER  v." + version);
                if (process.env.TARGETSTATUS == 'development')
                    logger.info("STARTING MODE: development")
                else
                    logger.info("STARTING MODE: production")
                logger.info("BINDING ON HOST: " + process.env.SERVERHOST)
                logger.info(process.env.HTTPTYPE + ' SERVER: listening on port ' + process.env.HTTPPORT);
                logger.info('STARTED IN MODE ** ' + process.env.TARGETSTATUS + ' **');
                logger.info('SERVER: started with MODEL ' + process.env.MODELTYPE);
                if (process.env.MODELTYPE == 'llm')
                    logger.info('SERVER: started with SUBMODELTYPE ' + process.env.MODELTYPE_SUBTYPE);
                logger.info("*******************************");
            });
        })
        .catch((error) => {
            logger.error(error, "daemon", false);
        });
};

apiServ();
