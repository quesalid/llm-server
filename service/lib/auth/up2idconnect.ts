import { findKeyInStore, getApiKeyFromServer } from "../utils/tokenutils.js";
import { loggers, loadLogger } from "../start/logger.js";

let options:any;

const logger = loggers.simple;

const init = (opts:any) => {
    if (opts) options = opts;
};

const middleware = (req:any, res:any, next:any) => {
    // STORE TOKEN IN STORE
    next();
};

/*
 * Check if apikey in header
 * if null check if apikey in query
 * ----> if not token the ERROR
 * ----> check if apikey in store
 * ----> if NOT apkey in store authenticate apikey with id server
 * */
const protect = async (req:any, res:any, next:any) => {
    // IF CALLED CHECK TOKEN
    let key;
    let token = req.header("x-api-key"); //Get API key from headers
    if (!token) {
        // try to get token from query
        token = req.query.apikey;
    }
    if (!token || token == "null") {
        // IF BAD TOKEN AUTHENTICATE USER
        let err = { status: 200, message: '' } as {status:number,message:any};
        err.status = 500;
        err.message = "NO_TOKEN";
        logger.error("APISERVER ERROR ", err.message);
        next(err);
    } else {
        try {
            // VERIFY SIGNATURE IN STORE
            key = await findKeyInStore(options.store, token);
            next();
        } catch (error) {
            //console.log("PROTECT ERROR", error)
            if (error == "TOKEN_NOT_FOUND") {
                try {
                    await authenticate(req, token);
                    next();
                } catch (error) {
                    let err = { status: 200, message: '' } as { status: number, message: any };
                    err.status = 500;
                    err.message = error;
                    logger.error("APISERVER ERROR ", error);
                    next(err);
                }
            } else {
                logger.error("APISERVER ERROR ", error);
                let err = { status: 200, message: '' } as { status: number, message: any };
                err.status = 500;
                err.message = error;
                next(err);
            }
        }
    }
};

const authenticate = async (req:any, apikey:any) => {
    try {
        // CHECK apikey WITH ID-SERVER
        // STORE returned apikey in store
        const serverurl =
            process.env.AUTH_APITOKENURI + "?apikey=" + apikey + "&errtype=json";
        const newapikey:any = await getApiKeyFromServer(apikey, serverurl);
        req.session.apikey = newapikey.response.apikey;
    } catch (error) {
        logger.error("APISERVER ERROR ", error);
        throw error;
    }
};

const Up2id = {
    init,
    middleware,
    protect,
};

export default Up2id;
