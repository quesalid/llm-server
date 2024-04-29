import cq from "./cqueue.js";
import { decodeAppToken } from '../utils/tokenutils.js'
import permissions from './permissions.js'

/*
 * Use injection
 * function used by injected object:
 *
 *
 */

class DbAbstract {
    dbname: string;
    cq: cq;
    db: any;
    permissions:any

  constructor(dbname:string, dbinject:any, bsize = 100) {
    this.dbname = dbname;
    this.cq = new cq(bsize);
      this.db = dbinject;
    this.permissions = permissions
  }

    
/*
    * hasPremissions
    * use token to identify command issuer uid and role
    * if issuer role ADMIN return true
    * if permission = OWNER and issuer id = record uid return true
    * else return false
    */

    hasPermissions(req:any) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!req.headers["authorization"]) {
                    reject("NO_AUTH_TOKEN")
                }
                const token = req.headers["authorization"].split(' ')[1]
                const decoded:any = await decodeAppToken(token)
                const useruid = decoded.uuid
                const userrole = decoded.auth
                const perm = this.permissions.find((item:any) => { return (item.function == req.body.command) })
                let checked = false
                // IF USER ROLE == ADMIN OR SADMIN RETURN TRUE
                if (userrole == 'ADMIN' || userrole == 'SADMIN')
                    checked = true
                // IF perm.permissions contains ALL retrun true
                if (perm && perm.permissions.includes('ALL'))
                    checked = true
                // IF req table has owner == "00000000-0000-0000-0000-000000000000" return true
                if (!checked && perm && perm.checkNullOwner && perm.param)
                    checked = await this.db.checkNullOwner(perm.checkTable, req.body.options[perm.param])
                const perms = perm?.permissions
                resolve({ checked: checked,useruid: useruid, userrole: userrole, permissions: perms })
            } catch (error) {
                reject(error);
            }
        });
    }

  /*
   * testApi
   * Protected test entry point
   */
  testApi(req:any) {
    return new Promise(async (resolve, reject) => {
      try {
          const response:any = {
              type: req.body.type,
              version: req.body.version,
              command: req.body.command,
              result: true,
              error: null,
              data: 'Alive and kicking!...',
          };
          resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }

  /*
   * u2pCommand
   * up2pahrma api endpoint
   */
  restCommand(req:any,options:any) {
      return new Promise(async (resolve, reject) => {
          try {
              let result;
              let permresult:any = false
            // Check body for command
            if (!req.body || !req.body.command || !(req.body.type == "api"))
                  reject("LOM_BAD_COMMAND_FORMAT_ERROR");
            // Check if command is in db
              if (!this.db[req.body.command] && !(req.body.command=='testApi') )
                  reject("LOM_COMMAND_NOT_IMPLEMENTED");

              if (process.env.PERMCHECK == 'false')
                  console.log("**> WARNING: NO PERM CHECK for COMMAND ", req.body.command)
              else
                  permresult = await this.hasPermissions(req)

                  result = this.db[req.body.command](req.body,permresult);
              resolve(result);
            } catch (error) {
            reject(error);
            }
        });
      }


    /*
       * u2pCommand
       * login endpoint
       */
    login(req:any, options:any) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = this.db['login'](req.body, options);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

}
  

export default DbAbstract;
