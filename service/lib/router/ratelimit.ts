import rateLimit from "express-rate-limit";

const setupRateLimit = (app:any, routes:any) => {
    routes.forEach((r:any) => {
        if (r.rateLimit) {
            app.use(r.url, rateLimit(r.rateLimit));
        }
    });
};

export default setupRateLimit;
