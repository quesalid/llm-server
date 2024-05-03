import express from "express";
import controller from "../controller/Controller.js";
import llmdb from "../db/llm/llmdb.js"

/*
 * Cretaes callback from controllers
 */
const createRouterCallback = (callback:string, options:any) => {
    const routercallback = async (req:any, res:any) => {
        try {
            let ret = await controller[callback](req, options) ;
            res.json(ret);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    };
    return routercallback;
};

const initController = async () => {
    try {
        if (process.env.MODELTYPE) {
            await controller.init(llmdb, process.env.MODELTYPE_SUBTYPE);
        } else {
            throw("NO_MODEL_SPECIFIED")
        }
    } catch (error) {
        throw(error)
    }
};

/*
 * Set up routes
 */
const setupRouter = async (app:any, routes:any) => {
    await initController();
    const router = express.Router();
    routes.forEach((r:any) => {
        switch (r.controller.method) {
            case "GET":
                router.get(r.url, createRouterCallback(r.controller.callback, r.controller.options));
                break;
            case "POST":
                router.post(r.url, createRouterCallback(r.controller.callback, r.controller.options));
                break;
            case "HEAD":
                router.head(r.url, createRouterCallback(r.controller.callback, r.controller.options));
                break;
            case "PUT":
                router.put(r.url, createRouterCallback(r.controller.callback, r.controller.options));
                break;
            case "DELETE":
                router.delete(r.url, createRouterCallback(r.controller.callback, r.controller.options));
                break;
            case "CONNECT":
                router.connect(r.url, createRouterCallback(r.controller.callback, r.controller.options));
                break;
            case "OPTIONS":
                router.options(r.url, createRouterCallback(r.controller.callback, r.controller.options));
                break;
            case "TRACE":
                router.trace(r.url, createRouterCallback(r.controller.callback, r.controller.options));
                break;
            case "PATCH":
                router.patch(r.url, createRouterCallback(r.controller.callback, r.controller.options));
                break;
        }
    });

    app.use("/", router);
};

export default setupRouter;
