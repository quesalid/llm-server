import MemoryStore from "memorystore";
import session from "express-session";
import Up2id from "./up2idconnect.js";

const setupAuth = (app:any, routes:any) => {
    const sessionStore = MemoryStore(session);
    const store = new sessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
    });

    app.use(
        session({
            // It holds the secret key for session
            //secret: process.env.AUTH_CLIENTSECRET,

            secret: "NO_SECRET",

            // Forces the session to be saved
            // back to the session store
            resave: false,

            // Forces a session that is "uninitialized"
            // to be saved to the store
            saveUninitialized: true,
            // Use memorystore
            // instead of default express store due to memory leaks
            store: store,
        })
    );

    let opts = { store: store };

    Up2id.init(opts);
    app.use(Up2id.middleware);

    routes.forEach((r:any) => {
        if (r.auth) {
            app.use(r.url, Up2id.protect, function (req:any, res:any, next:any) {
                next();
            });
        }
    });
};

export default setupAuth;
