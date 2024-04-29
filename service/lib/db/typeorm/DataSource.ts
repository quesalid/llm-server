import { DataSource, DataSourceOptions, createConnection } from "typeorm"
import { LomLogger } from "./logger/LomLogger.js" 




const sqliteopts: DataSourceOptions = {
    type: "better-sqlite3",
    database: "data/lom.db",
    synchronize: false,
    logging: false,
    entities: [
        "service/lib/db/typeorm/entities/**/*.js"
    ],
    migrations: [
        "service/lib/db/typeorm/migration/**/*.js"
    ],
    subscribers: [
        "service/lib/db/typeorm/subscriber/**/*.js"
    ]
}

const postgresopts: DataSourceOptions = {
    type: "postgres",
    synchronize: false,
    database: "lom", 
    username: process.env.DBUSER ? process.env.DBUSER : "crate",
    host: "localhost",
    port: 5432,
    password: process.env.DBPASSWORD ? process.env.DBPASSWORD : "",
    connectTimeoutMS: 10000,
    entities: [
        "service/db/typeorm/entities/**/*.js"
    ],
    migrations: [
        "service/db/typeorm/migration/**/*.js"
    ],
    subscribers: [
        "service/db/typeorm/subscriber/**/*.js"
    ]
}

const mysqlopts: DataSourceOptions = {
    type: "mysql",
    synchronize: false,
    database: "lom", 
    username: process.env.DBUSER ? process.env.DBUSER : "root",
    host: "localhost",
    port: 3306,
    password: process.env.DBPASSWORD ? process.env.DBPASSWORD : "RooT64PP06PoP972",
    logging: false,
    extra: {
        charset: "utf8mb4_unicode_ci"
    },
    entities: [
        "service/lib/db/typeorm/entities/**/*.js"
    ],
    migrations: [
        "service/lib/db/typeorm/migration/**/*.js"
    ],
    subscribers: [
        "service/lib/db/typeorm/subscriber/**/*.js"
    ]
}

export class LomDataSource {
    // ...
    options: any = sqliteopts
    db: DataSource
    type: any
    constructor(dbname: string,logging = false) {
        this.type = dbname
        switch (dbname) {
            case "sqlite":
                (sqliteopts.database as any) = process.env.TARGETSTATUS == 'development' ? "data/lomdev.db" : "data/lom.db",
                    this.options = sqliteopts
                break
            case "postgres":
                (postgresopts.database as any) = process.env.TARGETSTATUS == 'development' ? "lomdev" : "lom",
                    this.options = postgresopts
                break
            case "mysql":
                (mysqlopts.database as any) = process.env.TARGETSTATUS == 'development' ? "lomdev" : "lom",
                    this.options = mysqlopts
                break
            default:
                this.options = sqliteopts
                break;
        }
        if (logging)
            this.options.logger = new LomLogger()
        this.db = new DataSource(this.options)
    }

    async init(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.initialize()
                resolve(this.db)
            } catch (err) {
                console.log("Error initializing database: ", err)
                reject(err)
            }
        })
        //return this.db.initialize()
    }
}