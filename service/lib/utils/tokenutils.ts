import fetch from "node-fetch";
import https from "https";
import jwt from 'jsonwebtoken';

const agent = new https.Agent({
  rejectUnauthorized: false,
});

export const findKeyInStore = (store:any, token:string) => {
  return new Promise((resolve, reject) => {
    store.all(async (error:any, sessions:any) => {
      let found = false;
      let index = -1;
      if (!error) {
          const keys = Object.keys(sessions);
        for (let i = 0; i < keys.length; i++) {
          if (sessions[keys[i]].apikey == token) {
            // Delete store entry
            found = true;
            index = i;
          }
        }
        if (found) {
          resolve(sessions[keys[index]].apikey);
        } else reject("TOKEN_NOT_FOUND");
      } else reject(error);
    });
  });
};

export const getApiKeyFromServer = (apikey:string, serverurl:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response:any = await callFetchGet(serverurl, apikey);

      if (response.code && response.code >= 400) reject(response.message);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

const callFetchGet = async function (url:string, apikey:string) {
  const headers = { "Content-Type": "application/json", "x-api-key": apikey };

  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "GET",
      headers: headers,
      agent: agent,
    })
      .then((response) => {
        if (response != null && response.status != 500) {
          response
            .json()
            .then((result) => {
              resolve(result);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          reject(response.statusText);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const callFetchPost = async function (url:string, body:any,headers:any) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "POST",
            headers: headers,
            agent: agent,
            body:JSON.stringify(body)
        })
            .then((response) => {
                if (response != null && response.status == 200) {
                    response
                        .json()
                        .then((res) => {
                            resolve(res);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                } else {
                    reject(response.statusText);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const decodeAppToken = async (apptoken:string) => {
    let decoded
    try {
        decoded = await jwt.decode(apptoken);
        return (decoded)
    } catch (error) {
        throw (error)
    }
}