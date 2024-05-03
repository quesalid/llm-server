import DBAbstract from "../db/DBAbstract.js";
import { loggers, loadLogger } from "../start/logger.js";

let db:any;
let logger: any;

const init = async function (injectDB:any, stype = 'sqlite') {
    const lgrs = await loadLogger()
    logger = lgrs.simple
    await injectDB.init(stype)
    db = new DBAbstract(stype, injectDB);
};



const testApi = async function (req:any) {
    return new Promise(async (resolve, reject) => {
        try {
            let ret = await db.testApi(req);
            resolve(ret);
        } catch (error) {
            logger.error(error);
            reject(error);
        }
    });
};

const restCommand = async function (req: any, options: any) {
    return new Promise(async (resolve, reject) => {
        try {
            let ret = await db.restCommand(req, options);
            resolve(ret);
        } catch (error) {
            logger.error(error);
            reject(error);
        }
    });
};

const login = async function (req:any, options:any) {
    return new Promise(async (resolve, reject) => {
        try {
            let ret = await db.login(req, options);
            resolve(ret);
        } catch (error) {
            logger.error(error);
            reject(error);
        }
    });
}

const controller:any = {
    init ,
    testApi,
    restCommand,
    login
};

export default controller;
