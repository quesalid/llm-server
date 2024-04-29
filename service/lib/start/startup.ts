import { loggers, loadLogger } from "./logger.js";
import { fork, exec } from "child_process";
import path from "path";
import configServer from "./config.js";
import { fileURLToPath } from "url";
import ROUTES from "./routes.js";

const logger = loggers.simple;
// Startup routine
const handleProcessEvents = () => {
    try {
        process.on("exit", async () => {
            // Clear up all mess on exit
        });

        process.on("uncaughtException", (error:any) => {
            logger.error(error, "", false);
            console.warn(error);
        });

        process.on("uncaughtException", async (error:any) => {
            logger.error(error, "", false);
            console.warn(error);
        });

        process.on("unhandledRejection", async (error:any) => {
            logger.error(error, "", false);
            console.warn(error);
        });
        process.on("SIGINT", function () {
            logger.info("\nGracefully shutting down from SIGINT (Ctrl-C)");
            // some other closing procedures go here
            process.exit(0);
        });
    } catch (exception:any) {
        throw new Error(
            `[startup.handleProcessEvents] ${exception.message || exception}`
        );
    }
};

const setEnv = function (opts:any) {
    // READ FROM CONF FILE
    const keys = Object.keys(opts);
    for (let i = 0; i < keys.length; i++) {
        process.env[keys[i]] = process.env[keys[i]] ? process.env[keys[i]] : opts[keys[i]];
    }
    process.env.HTTPTYPE = process.env.HTTPTYPE ? process.env.HTTPTYPE : 'HTTPS'
    process.env.HTTPPORT = process.env.HTTPPORT ? process.env.HTTPPORT : '4002'
    process.env.SERVERHOST = process.env.SERVERHOST ? process.env.SERVERHOST : '127.0.0.1'
};

/**
 * Starts up all configured<br>
 * child processes
 * @param null
 * */
const startup = async (resolve:any, reject:any) => {
    let ret = {
        childrens: {} as any,
        env: {},
        auth: {},
        routes:null
    };
    let configpath = "";
    try {
        let __dirname = path.dirname(fileURLToPath(import.meta.url));
        configpath = path.join(__dirname, "../../conf").toString();
        handleProcessEvents();
        const serverconf = configServer(configpath);
        const childrens = serverconf.childrens;
        setEnv(serverconf.env);
        const routes = ROUTES(configpath);
        ret.routes = routes;
        ret.env = serverconf.env;
        ret.auth = serverconf.auth;
        // start childrens
        for (let i = 0; i < childrens.length; i++) {
            let childItem = {};
            try {
                if (childrens[i].optype == "fork") {
                    const chpath = path.join(
                        __dirname,
                        "..",
                        childrens[i].ctype,
                        childrens[i].ctype + "Child.js"
                    );
                    // Add abort signal
                    const controller = new AbortController();
                    const { signal } = controller;
                    const child = await fork(chpath, [childrens[i].cname], { signal });
                    //
                    childItem = {
                        child: child,
                        name: childrens[i].cname,
                        ctype: childrens[i].ctype,
                        controller: controller,
                    };
                }
                if (childrens[i].optype == "exec") {
                    const controller = new AbortController();
                    const { signal } = controller;
                    const child = await exec(
                        '"' + childrens[i].ctype + '"',
                        { signal },
                        (error, stdout, stderr) => {
                            if (error) {
                                logger.error(`exec error: ${error}`);
                                return;
                            }
                            console.log(`stdout: ${stdout}`);
                            console.error(`stderr: ${stderr}`);
                        }
                    );
                    childItem = {
                        child: child,
                        name: childrens[i].cname,
                        ctype: childrens[i].ctype,
                        controller: controller,
                    };
                }
                //ret.childrens[childrens[i].ctype] = childItem
                ret.childrens[childrens[i].cname]  = childItem;
                logger.info(
                    "Child " + childrens[i].cname + " started",
                    "daemon",
                    false
                );
            } catch (error:any) {
                logger.info(
                    "Error: bad child name " +
                    childrens[i].cname +
                    " error: " +
                    JSON.stringify(error),
                    "daemon",
                    false
                );
            }
        }
        resolve(ret);
    } catch (exception:any) {
        reject(`[startup] ${exception.message}`);
    }
};

export default () =>
    new Promise((resolve, reject) => {
        startup(resolve, reject);
    });
