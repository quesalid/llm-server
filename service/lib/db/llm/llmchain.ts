import { Ollama } from "@langchain/community/llms/ollama";
class LLMChain {
    modelname: any
    model: any
    options:any

    constructor(modelname: any, options:any) {
        this.modelname = modelname
        this.options = options
    }

    async loadModel(options: any) {
        return new Promise(async (resolve, reject) => {
            try {
                switch (options.modelname) {
                    case 'ollama':
                        this.model = await new Ollama(options.modeloptions)
                        resolve(this.model)
                    default:
                        reject("BAD_MODEL_NAME_ERR")
                }
            } catch (error) {
                reject(error)
            }
        })
    }
}


export default LLMChain