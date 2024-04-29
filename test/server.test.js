import request from "supertest";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";



const __dirname = path.dirname(fileURLToPath(import.meta.url));

let testconf
let delay = 40000

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// ISPE GAMP 5
// Test
//
// normal case (positive)
// invalid case (negative)
// repeatability
// performance
// volume/load
// regression
// structural testing

describe("TEST API Group ", () => {
    let token;
    let url = "https://127.0.0.1:3002";
    let loginurl = "https://127.0.0.1:3000"

    beforeAll(() => {
        const configpath = path.join(__dirname, 'conf', 'test-config.json').toString()
        const data = fs.readFileSync(configpath)
        testconf = JSON.parse(data)
        url = 'http://'
        if (testconf.HTTPS)
            url = 'https://'
        if (testconf.HOST)
            url += testconf.HOST + ':'
        else
            url += '127.0.0.1:'
        if (testconf.PORT)
            url += testconf.PORT
        else
            url += '3002'

        if (testconf.LOGINURL)
            loginurl = testconf.LOGINURL

        const jsonForReporter = {
            Environment: "QA",
            "Product branch": "feature/abc-4251-client-service-abc",
            "Tests branch": "master",
            "Current time": "2019-12-19T10:01:44.992Z"
        };
        process.env.JEST_HTML_REPORTERS_CUSTOM_INFOS = JSON.stringify(jsonForReporter);
        //process.env.JEST_HTML_REPORTERS_CUSTOM_INFOS = JSON.stringify(testconf.JEST_HTML_REPORTERS_CUSTOM_INFOS)
        //console.log("beforeall", process.env.JEST_HTML_REPORTERS_CUSTOM_INFOS)

    });

    /**
     * testApi - test api ednpoint
     */
    it("/cmd/testApi (testApi) should test api endpoint", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "testApi",
            options: []
        };
        const res = await request(url)
            .post("/cmd/testApi")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode > '300')
            console.log("TESTAPI", res.body.error)

        console.log("TESTAPI",res.body.data)
            

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("testApi");
        expect(res.body.error).toBe(null);
    }, delay);
})