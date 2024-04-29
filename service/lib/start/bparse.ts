import bodyParser from "body-parser";

const setupBodyParser = (app:any, routes:any) => {
    routes.forEach((r:any) => {
        switch (r.bodyparser) {
            case "json":
                app.use(r.url, bodyParser.json({ limit: "50mb" }));
                break;
            case "urlencoded":
                app.use(
                    r.url,
                    bodyParser.urlencoded({
                        limit: "50mb",
                        extended: true,
                        parameterLimit: 50000,
                    })
                );
                break;
            case "text":
                app.use(r.url, bodyParser.text({ limit: "50mb" }));
            case "raw":
                app.use(r.url, bodyParser.raw({ limit: "50mb" }));
                break;
            default:
                break;
        }
    });
};

export default setupBodyParser;
