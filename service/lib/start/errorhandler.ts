import { loggers, loadLogger } from "./logger.js";

const logger = loggers.simple;

const errorHandler = (error:any, req:any, res:any, next:any) => {
    // Error handling middleware functionality
    logger.error(`error ${error.message} ${error.code}`); // log the error
    const status = error.status || 500;
    res.body = error.message;
    res.status(status).send(error);
};

export default errorHandler;
