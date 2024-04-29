import morgan from "morgan";
import { loggers, loadLogger } from "./logger.js";

const logger:any = loggers.simple;

logger.stream  = {
    write: (message:any) =>
        logger.info(message.substring(0, message.lastIndexOf("\n"))),
};

morgan.token('body', (req:any) => {
    let tkn:any
    let ua:any
    ua = req.get('user-agent')
    if (req.body && req.body.command) tkn = req.body.command
    else tkn = { msg: "WARNING: NCF STATUS", ua: ua }
    return JSON.stringify(tkn)
})

morgan.token('nakedurl', (req:any) => {
    // url without query string
    return req.originalUrl.split('?')[0]

})


const mrg = morgan(
    ":method :nakedurl :status :response-time ms - :res[content-length] :body",
    { stream: logger.stream }
);

export default mrg;
