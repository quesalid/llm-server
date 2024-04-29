const checkCredit = (req:any) => {
    return new Promise((resolve, reject) => {
        console.log("**** CHECKING CREDIT - TBD *****");
        /*setTimeout(() => {
                reject('No sufficient credits');
            }, 500);*/
        resolve("ok");
    });
};

const setupCreditCheck = (app:any, routes:any) => {
    routes.forEach((r:any) => {
        if (r.creditCheck) {
            app.use(r.url, function (req:any, res:any, next:any) {
                checkCredit(req)
                    .then(() => {
                        next();
                    })
                    .catch((error:any) => {
                        res.status(402).send({ error });
                    });
            });
        }
    });
};

export default setupCreditCheck;
