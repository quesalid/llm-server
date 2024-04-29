import crypto from "crypto"
import fs from "fs"


const IV_LENGTH = 16;

const iv = crypto.randomBytes(IV_LENGTH);

const iiv = Buffer.from("F_2r+B.i8Qn!-pO4")
console.log("iiv: ", iiv.toString('hex'))

const getHash = (str: string) => {
    const hash = crypto.createHash("sha256")
    hash.update(str)
    return hash.copy().digest('hex')
}

const getSalt = () => {
    return crypto.randomBytes(8).toString("hex")
}

const getHashedPassword = (password: string) => {
    return getHash(password)
}

const encrypt = (text: string, key: any) => {
    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, 'hex'), iiv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return (iiv.toString('hex') + ':' + encrypted.toString('hex'))
}


const decrypt = (text: string, key: any) => {
    let textParts: any = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return (decrypted.toString())
}

const generateKeyPair = (): any => {
    return new Promise(
        (resolve, reject) => crypto.generateKeyPair(
            'rsa',
            {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem"
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem"
                }
            },
            (error, publicKey, privateKey) => error ? reject(error) : resolve({ publicKey, privateKey })
        )
    )
}

const getCerts = (keyfile: string, certfile: string) => {
    try {
        const key = fs.readFileSync(keyfile, "utf8")
        const cert = fs.readFileSync(certfile, "utf8")
        return { key, cert }
    } catch (err) {
        console.log("Error reading key/cert files: ", err)
        return null
    }
}

const cutils = {
    getHash,
    getSalt,
    getHashedPassword,
    encrypt,
    decrypt,
    generateKeyPair,
    getCerts
}

export default cutils