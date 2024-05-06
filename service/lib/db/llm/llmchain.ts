// MODELS
// OLLAMA
import { Ollama } from "@langchain/community/llms/ollama";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
// VECTORr STORES
// CHROMA
import { Chroma } from "@langchain/community/vectorstores/chroma"
// DOCUMENTS LOADER
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// PDF
import { PDFLoader } from "langchain/document_loaders/fs/pdf";


class LLMChain {
    modelname: any
    model: any
    options: any
    chat: any
    embeddings: any
    vectorstore: any
    docloader:any

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
                        this.embeddings = await new OllamaEmbeddings(options.modeloptions)
                        resolve(this.model)
                    default:
                        reject("BAD_MODEL_NAME_ERR")
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    async loadChat(options: any) {
        return new Promise(async (resolve, reject) => {
            try {
                switch (options.chatname) {
                    case 'ollama':
                        this.chat = await new ChatOllama(options.chatoptions)
                        this.embeddings = await new OllamaEmbeddings(options.chatoptions)
                        resolve(this.chat)
                    default:
                        reject("BAD_CHAT_NAME_ERR")
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    async setDocumentLoader(options: any) {
        return new Promise(async (resolve, reject) => {
            try {
                switch (options.loader) {
                    case 'pdf':
                        this.docloader = new DirectoryLoader(
                            options.directory,
                            {
                                ".pdf": (path: string) => new PDFLoader(path),
                            }
                        );
                        resolve(this.model)
                    default:
                        reject("BAD_CHAT_NAME_ERR")
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    async loadVectorStoreFromDirectory(options: any) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.docloader)
                    reject("NO_DOC_LOADER_DEF_ERR")
                // Load docs
                const docs = await this.docloader.load();
                const textSplitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 1000,
                    chunkOverlap: 200,
                });
                const splitDocs = await textSplitter.splitDocuments(docs);
                switch (options.vsname) {
                    case 'chroma':
                        console.log("LOAD VECTOR STORE", options)
                        this.vectorstore = await Chroma.fromDocuments(splitDocs, this.embeddings, {
                            collectionName: options.collectionname,
                            url: options.server, // Optional, will default to this value
                            collectionMetadata: {
                                "hnsw:space": "cosine",
                            }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
                        });
                        resolve(this.vectorstore)
                    default:
                        reject("BAD_VECTORSTORE_NAME_ERR")
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    async loadVectorStoreFromCollection(options: any) {
        return new Promise(async (resolve, reject) => {
            try {
                switch (options.vsname) {
                    case 'chroma':
                        this.vectorstore = await Chroma.fromExistingCollection(this.embeddings, {
                            collectionName: options.collectionname,
                            url: options.server,
                        });
                        resolve(this.vectorstore)
                    default:
                        reject("BAD_VECTORSTORE_NAME_ERR")
                }
            } catch (error) {
                reject(error)
            }
        })
    }
}


export default LLMChain