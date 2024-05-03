import { callFetchPost } from '../../utils/tokenutils.js'
import LLMChain from './llmchain.js'

let cryptokey: string
let llmchain:any

const init = async (subtype: any = 'ollama',options:any=null) => {
    // To encrypt and decrypt sensitive data
    llmchain = new LLMChain(subtype,options)
    cryptokey = process.env.CRIPTOKEY ? process.env.CRIPTOKEY : '6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50'
};


const login = async (cmd: any, options: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const headers = { "Content-Type": "application/json" };
            const ret = await callFetchPost(options.target, cmd.options, headers)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: ret,
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const loadModel = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const ret:any = await llmchain.loadModel(cmd.options)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: ret,
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

const llmdb = {
    init,
    login,
    loadModel
    
};
export default llmdb;
