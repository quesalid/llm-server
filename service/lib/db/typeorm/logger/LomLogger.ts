import {
    AbstractLogger,
    LogLevel,
    LogMessage,
    QueryRunner,
} from "typeorm"

export class LomLogger extends AbstractLogger {
    /**
     * Write log to specific output.
     */
    protected writeLog(
        level: LogLevel,
        logMessage: LogMessage | LogMessage[],
        queryRunner?: QueryRunner,
    ) {
        const messages = this.prepareLogMessages(logMessage, {
            highlightSql: false,
        })

        for (let message of messages) {
            switch (message.type ?? level) {
                case "log":
                case "schema-build":
                case "migration":
                    console.log(message.message)
                    break

                case "info":
                case "query":
                    if (message.prefix) {
                        console.info(message.prefix, message.message)
                    } else {
                        console.info(message.message)
                    }
                    break

                case "warn":
                case "query-slow":
                    if (message.prefix) {
                        console.warn(message.prefix, message.message)
                    } else {
                        console.warn(message.message)
                    }
                    break

                case "error":
                case "query-error":
                    if (message.prefix) {
                        console.error(message.prefix, message.message)
                    } else {
                        console.error(message.message)
                    }
                    break
            }
        }
    }

    /**
     * Logs query and parameters used in it.
     */
    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        const requestUrl = queryRunner && queryRunner.data["request"] ? "(" + queryRunner.data["request"].url + ") " : "";
        console.log(requestUrl + "executing query: " + query);
    }

}