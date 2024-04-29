import { callFetchPost } from '../../utils/tokenutils.js'
//import tormdata from './tormdata.js'
import tormdata from './tormdata.js'
import { v4 as uuidv4 } from "uuid"
import { getCurrentDateTime, getCurrentDateArray } from "../../utils/genutils.js"
import  cutils  from "../../utils/cryptoutils.js" 

let cryptokey: string


const init = async (subtype:any='sqlite') => {
    const tables = await tormdata.init(subtype)
    // To encrypt and decrypt sensitive data
    cryptokey = process.env.CRIPTOKEY ? process.env.CRIPTOKEY : '6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50'
};



const testApi = (credential:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const ret = "OK, you got it!";
            resolve(ret);
        } catch (error) {
            reject(error);
        }
    });
};

const checkNullOwner = (table:any, param:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checked: any = false
            checked = await tormdata.checkNullOwner(table, param)
            resolve(checked)
        } catch (error) {
            console.log("checkNullOwner", error)
            resolve(false);
        }
    })
}

const login = async (cmd:any, options:any) => {
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

const getProfile = (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // ENCRYPT SEBSITIVE DATA IN FILTERS
            const filters = cmd.options
            for (let i = 0; i < filters.length; i++){
                const filter = filters[i]
                const keys = Object.keys(filter)
                if (keys[0] == 'mobile')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'otherphone')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'name')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'surname')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'address')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'bdate')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'idnumber')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'othersocial')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'linkedin')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'facebook')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'twitter')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'instagram')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'skype')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'whatsapp')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'telegram')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'shortbio')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'profexp1')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'profexp2')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'profexp3')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'education')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'website')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'profession')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
                if (keys[0] == 'taxcode')
                    filters[keys[0]] = cutils.encrypt(filter[keys[0]], cryptokey)
            }

            const profiles = []
            const persprofile: any = await tormdata.getPersprofile(cmd.options, chkperm);
            const profprofile: any = await tormdata.getProfprofile(cmd.options, chkperm);


            // DECRYPT SENSITIVE DATA
            for (let i = 0; i < persprofile.length; i++) {
                const pers = persprofile[i]
                const prof = profprofile[i]
                if (pers.mobile)
                    pers.mobile = cutils.decrypt(pers.mobile, cryptokey)
                if (pers.otherphone)
                    pers.otherphone = cutils.decrypt(pers.otherphone, cryptokey)
                if (pers.name)
                    pers.name = cutils.decrypt(pers.name, cryptokey)
                if (pers.surname)
                    pers.surname = cutils.decrypt(pers.surname, cryptokey)
                if (pers.bdate)
                    pers.bdate = cutils.decrypt(pers.bdate, cryptokey)
                if (pers.address)
                    pers.address = cutils.decrypt(pers.address, cryptokey)
                if (pers.idnumber)
                    pers.idnumber = cutils.decrypt(pers.idnumber, cryptokey)
                if (pers.linkedin)
                    pers.linkedin = cutils.decrypt(pers.linkedin, cryptokey)
                if (pers.facebook)
                    pers.facebook = cutils.decrypt(pers.facebook, cryptokey)
                if (pers.twitter)
                    pers.twitter = cutils.decrypt(pers.twitter, cryptokey)
                if (pers.instagram)
                    pers.instagram = cutils.decrypt(pers.instagram, cryptokey)
                if (pers.skype)
                    pers.skype = cutils.decrypt(pers.skype, cryptokey)
                if (pers.whatsapp)
                    pers.whatsapp = cutils.decrypt(pers.whatsapp, cryptokey)
                if (pers.telegram)
                    pers.telegram = cutils.decrypt(pers.telegram, cryptokey)
                if (pers.othersocial)
                    pers.othersocial = cutils.decrypt(pers.othersocial, cryptokey)
                if (prof.shortbio)
                    prof.shortbio = cutils.decrypt(prof.shortbio, cryptokey)
                if (prof.profexp1)
                    prof.profexp1 = cutils.decrypt(prof.profexp1, cryptokey)
                if (prof.profexp2)
                    prof.profexp2 = cutils.decrypt(prof.profexp2, cryptokey)
                if (prof.profexp3)
                    prof.profexp3 = cutils.decrypt(prof.profexp3, cryptokey)
                if (prof.education)
                    prof.education = cutils.decrypt(prof.education, cryptokey)
                if (prof.website)
                    prof.website = cutils.decrypt(prof.website, cryptokey)
                if (prof.profession)
                    prof.profession = cutils.decrypt(prof.profession, cryptokey)
                if (prof.taxcode)
                    prof.taxcode = cutils.decrypt(prof.taxcode, cryptokey)
            }

            // MERGE PROFILES
            for (let i = 0; i < persprofile.length; i++) {
                for (let j = 0; j < profprofile.length; j++) {
                    if (persprofile[i].uid == profprofile[j].uid) {
                        let merged = { ...persprofile[i], ...profprofile[j] };
                        profiles.push(merged)
                    }
                }
            }
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { profiles: profiles },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const insertProfile = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // ENCRYPT SEBSITIVE DATA
            if (cmd.options.mobile) { 
                if (typeof cmd.options.mobile != 'string')
                    cmd.options.mobile = cmd.options.mobile.toString()
                cmd.options.mobile = cutils.encrypt(cmd.options.mobile, cryptokey)
            }
            if (cmd.options.otherphone) {
                if (typeof cmd.options.otherphone != 'string')
                    cmd.options.otherphone = cmd.options.otherphone.toString()
                cmd.options.otherphone = cutils.encrypt(cmd.options.otherphone, cryptokey)
            }
            if (cmd.options.name)
                cmd.options.name = cutils.encrypt(cmd.options.name, cryptokey)
            if (cmd.options.surname)
                cmd.options.surname = cutils.encrypt(cmd.options.surname, cryptokey)
            if (cmd.options.address)
                cmd.options.address = cutils.encrypt(cmd.options.address, cryptokey)
            if (cmd.options.bdate)
                cmd.options.bdate = cutils.encrypt(cmd.options.bdate, cryptokey)
            if (cmd.options.idnumber)
                cmd.options.idnumber = cutils.encrypt(cmd.options.idnumber, cryptokey)
            if (cmd.options.linkedin)
                cmd.options.linkedin = cutils.encrypt(cmd.options.linkedin, cryptokey)
            if (cmd.options.facebook)
                cmd.options.facebook = cutils.encrypt(cmd.options.facebook, cryptokey)
            if (cmd.options.twitter)
                cmd.options.twitter = cutils.encrypt(cmd.options.twitter, cryptokey)
            if (cmd.options.instagram)
                cmd.options.instagram = cutils.encrypt(cmd.options.instagram, cryptokey)
            if (cmd.options.skype)
                cmd.options.skype = cutils.encrypt(cmd.options.skype, cryptokey)
            if (cmd.options.whatsapp)
                cmd.options.whatsapp = cutils.encrypt(cmd.options.whatsapp, cryptokey)
            if (cmd.options.telegram)
                cmd.options.telegram = cutils.encrypt(cmd.options.telegram, cryptokey)
            if (cmd.options.othersocial)
                cmd.options.othersocial = cutils.encrypt(cmd.options.othersocial, cryptokey)
            if (cmd.options.image) {
                const image: any = cmd.options.image 
                const bufimg = (typeof (image) == 'object') ? new (Buffer.from as any)(image.data).toString('base64') : image
                cmd.options.image = bufimg
            }

            if (cmd.options.shortbio)
                cmd.options.shortbio = cutils.encrypt(cmd.options.shortbio, cryptokey)
            if (cmd.options.profexp1)
                cmd.options.profexp1 = cutils.encrypt(cmd.options.profexp1, cryptokey)
            if (cmd.options.profexp2)
                cmd.options.profexp2 = cutils.encrypt(cmd.options.profexp2, cryptokey)
            if (cmd.options.profexp3)
                cmd.options.profexp3 = cutils.encrypt(cmd.options.profexp3, cryptokey)
            if (cmd.options.education)
                cmd.options.education = cutils.encrypt(cmd.options.education, cryptokey)
            if (cmd.options.website)
                cmd.options.website = cutils.encrypt(cmd.options.website, cryptokey)
            if (cmd.options.profession)
                cmd.options.profession = cutils.encrypt(cmd.options.profession, cryptokey)
            if (cmd.options.taxcode) {
                if (typeof cmd.options.taxcode != 'string')
                    cmd.options.taxcode = cmd.options.taxcode.toString()
                cmd.options.taxcode = cutils.encrypt(cmd.options.taxcode, cryptokey)
            }

            // DEEP CONVERT SECTORS
            if (cmd.options.sectors)
                cmd.options.sectors = JSON.stringify(cmd.options.sectors)
            cmd.options.createdAt = getCurrentDateTime()
            cmd.options.uid = cmd.options.uid ? cmd.options.uid : chkperm.useruid
            if (!cmd.options.owner)
                cmd.options.owner = chkperm.useruid
            const profile = await tormdata.insertProfile(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { profile: profile },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateProfile = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // ENCRYPT SENSITIVE DATA
            if (cmd.options.mobile) {
                if (typeof cmd.options.mobile != 'string')
                    cmd.options.mobile = cmd.options.mobile.toString()
                cmd.options.mobile = cutils.encrypt(cmd.options.mobile, cryptokey)
            }
            if (cmd.options.otherphone) {
                if (typeof cmd.options.otherphone != 'string')
                    cmd.options.otherphone = cmd.options.otherphone.toString()
                cmd.options.otherphone = cutils.encrypt(cmd.options.otherphone, cryptokey)
            }
            if (cmd.options.name)
                cmd.options.name = cutils.encrypt(cmd.options.name, cryptokey)
            if (cmd.options.surname)
                cmd.options.surname = cutils.encrypt(cmd.options.surname, cryptokey)
            if (cmd.options.address)
                cmd.options.address = cutils.encrypt(cmd.options.address, cryptokey)
            if (cmd.options.bdate)
                cmd.options.bdate = cutils.encrypt(cmd.options.bdate, cryptokey)
            if (cmd.options.idnumber)
                cmd.options.idnumber = cutils.encrypt(cmd.options.idnumber, cryptokey)
            if (cmd.options.linkedin)
                cmd.options.linkedin = cutils.encrypt(cmd.options.linkedin, cryptokey)
            if (cmd.options.facebook)
                cmd.options.facebook = cutils.encrypt(cmd.options.facebook, cryptokey)
            if (cmd.options.twitter)
                cmd.options.twitter = cutils.encrypt(cmd.options.twitter, cryptokey)
            if (cmd.options.instagram)
                cmd.options.instagram = cutils.encrypt(cmd.options.instagram, cryptokey)
            if (cmd.options.skype)
                cmd.options.skype = cutils.encrypt(cmd.options.skype, cryptokey)
            if (cmd.options.whatsapp)
                cmd.options.whatsapp = cutils.encrypt(cmd.options.whatsapp, cryptokey)
            if (cmd.options.telegram)
                cmd.options.telegram = cutils.encrypt(cmd.options.telegram, cryptokey)
            if (cmd.options.othersocial)
                cmd.options.othersocial = cutils.encrypt(cmd.options.othersocial, cryptokey)

            if (cmd.options.shortbio)
                cmd.options.shortbio = cutils.encrypt(cmd.options.shortbio, cryptokey)
            if (cmd.options.profexp1)
                cmd.options.profexp1 = cutils.encrypt(cmd.options.profexp1, cryptokey)
            if (cmd.options.profexp2)
                cmd.options.profexp2 = cutils.encrypt(cmd.options.profexp2, cryptokey)
            if (cmd.options.profexp3)
                cmd.options.profexp3 = cutils.encrypt(cmd.options.profexp3, cryptokey)
            if (cmd.options.education)
                cmd.options.education = cutils.encrypt(cmd.options.education, cryptokey)
            if (cmd.options.website)
                cmd.options.website = cutils.encrypt(cmd.options.website, cryptokey)
            if (cmd.options.profession)
                cmd.options.profession = cutils.encrypt(cmd.options.profession, cryptokey)
            if (cmd.options.taxcode) {
                if (typeof cmd.options.taxcode != 'string')
                    cmd.options.taxcode = cmd.options.taxcode.toString()
                cmd.options.taxcode = cutils.encrypt(cmd.options.taxcode, cryptokey)
            }
            const ret = await tormdata.updateProfile(cmd.options, chkperm);
            const options = [{ uid: cmd.options.uid, type: 'eq' }]
            const res: any = await getProfile(cmd, chkperm);
            let profile:any = null
            if (res.data && res.data.profiles && res.data.profiles.length > 0)
                profile = res.data.profiles[0]
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { profile: profile },
            };
            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const changeStatement = (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const statement = cmd.options.statement
            const options = [{ uid: cmd.options.uid, type: 'eq' }]
            cmd['options'] = options
            const res: any = await getProfile(cmd, chkperm);
            let profile: any = null
            if (res.data && res.data.profiles &&  res.data.profiles.length > 0) {
                profile = res.data.profiles[0]
                profile.statement = statement
                cmd['options'] = profile
                const response = await updateProfile(cmd, chkperm);
                resolve(response)
            } else {
                reject("UID_NOT_FOUND_ERROR")
            }
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

const deleteProfile = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteProfile(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const groups:any = await tormdata.getGroup(cmd.options, chkperm);

            /*for (let i = 0; i < groups.length; i++) {
                // DEEP CONVERT TAGS
                if (groups[i].tags)
                    groups[i].tags = JSON.parse(groups[i].tags)
            }*/

            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { groups: groups },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const insertGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // DEEP CONVERT TAGS
            /*if (cmd.options.tags)
                cmd.options.tags = JSON.stringify(cmd.options.tags)*/

            cmd.options.uid = cmd.options.uid ? cmd.options.uid : uuidv4()
            cmd.options.createdAt = getCurrentDateTime()
            //cmd.options.owner = chkperm.useruid
            const group = await tormdata.insertGroup(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { group: group },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // ADJUST GROUP OBJECT
            /*const keys = Object.keys(cmd.options)
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] == 'tags')
                    // DEEP CONVERT TAGS
                    cmd.options.tags = JSON.stringify(cmd.options.tags)
            }*/
            const group = await tormdata.updateGroup(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { group: group },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const deleteGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteGroup(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const addProfilesToGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.addProfilesToGroup(cmd.options.profiles, cmd.options.groupname, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteProfilesFromGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteProfilesFromGroup(cmd.options.profiles, cmd.options.groupname, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const deleteGroupFromProfilesGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        reject("NOT_IMPLEMENTED");
    });
};

const deleteProfileFromProfilesGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        reject("NOT_IMPLEMENTED");
    });
};

const getProfilesByGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let profiles:any = await tormdata.getProfilesByGroup(cmd.options, chkperm)
            // DECRYPT SEBSITIVE DATA
            for (let i = 0; i < profiles.length; i++) {
                if (profiles[i].mobile)
                    profiles[i].mobile = cutils.decrypt(profiles[i].mobile, cryptokey)
                if (profiles[i].otherphone)
                    profiles[i].otherphone = cutils.decrypt(profiles[i].otherphone, cryptokey)
                if (profiles[i].name)
                    profiles[i].name = cutils.decrypt(profiles[i].name, cryptokey)
                if (profiles[i].surname)
                    profiles[i].surname = cutils.decrypt(profiles[i].surname, cryptokey)
                if (profiles[i].bdate)
                    profiles[i].bdate = cutils.decrypt(profiles[i].bdate, cryptokey)
                if (profiles[i].address)
                    profiles[i].address = cutils.decrypt(profiles[i].address, cryptokey)
                if (profiles[i].idnumber)
                    profiles[i].idnumber = cutils.decrypt(profiles[i].idnumber, cryptokey)
                if (profiles[i].linkedin)
                    profiles[i].linkedin = cutils.decrypt(profiles[i].linkedin, cryptokey)
                if (profiles[i].facebook)
                    profiles[i].facebook = cutils.decrypt(profiles[i].facebook, cryptokey)
                if (profiles[i].twitter)
                    profiles[i].twitter = cutils.decrypt(profiles[i].twitter, cryptokey)
                if (profiles[i].instagram)
                    profiles[i].instagram = cutils.decrypt(profiles[i].instagram, cryptokey)
                if (profiles[i].skype)
                    profiles[i].skype = cutils.decrypt(profiles[i].skype, cryptokey)
                if (profiles[i].whatsapp)
                    profiles[i].whatsapp = cutils.decrypt(profiles[i].whatsapp, cryptokey)
                if (profiles[i].telegram)
                    profiles[i].telegram = cutils.decrypt(profiles[i].telegram, cryptokey)
                if (profiles[i].othersocial)
                    profiles[i].othersocial = cutils.decrypt(profiles[i].othersocial, cryptokey)
                if (profiles[i].shortbio)
                    profiles[i].shortbio = cutils.decrypt(profiles[i].shortbio, cryptokey)
                if (profiles[i].profexp1)
                    profiles[i].profexp1 = cutils.decrypt(profiles[i].profexp1, cryptokey)
                if (profiles[i].profexp2)
                    profiles[i].profexp2 = cutils.decrypt(profiles[i].profexp2, cryptokey)
                if (profiles[i].profexp3)
                    profiles[i].profexp3 = cutils.decrypt(profiles[i].profexp3, cryptokey)
                if (profiles[i].education)
                    profiles[i].education = cutils.decrypt(profiles[i].education, cryptokey)
                if (profiles[i].website)
                    profiles[i].website = cutils.decrypt(profiles[i].website, cryptokey)
                if (profiles[i].profession)
                    profiles[i].profession = cutils.decrypt(profiles[i].profession, cryptokey)
                if (profiles[i].taxcode)
                    profiles[i].taxcode = cutils.decrypt(profiles[i].taxcode, cryptokey)
            }
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { profiles: profiles },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getGroupsByProfile = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let groups = await tormdata.getGroupsByProfile(cmd.options, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { groups: groups },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const insertNew = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            /*
            // DEEP CONVERT TAGS
            if (cmd.options.tags)
                cmd.options.tags = JSON.stringify(cmd.options.tags)
            // DEEP CONVERT LINKS
            if (cmd.options.links)
                cmd.options.links = JSON.stringify(cmd.options.links)
            */
            cmd.options.uid = cmd.options.uid ? cmd.options.uid : uuidv4()
            cmd.options.published = getCurrentDateTime()
            const _new = await tormdata.insertNew(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { new: _new },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateNew = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            /*
            // ADJUST NEW OBJECT
            const keys = Object.keys(cmd.options)
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] == 'tags')
                    // DEEP CONVERT TAGS
                    cmd.options.tags = JSON.stringify(cmd.options.tags)
                if (keys[i] == 'links')
                    // DEEP CONVERT LINKS
                    cmd.options.links = JSON.stringify(cmd.options.links)
            }*/

            const _new = await tormdata.updateNew(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { new: _new },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getNew = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const news:any = await tormdata.getNew(cmd.options, chkperm);
            /*
            for (let i = 0; i < news.length; i++) {
                // DEEP CONVERT TAGS
                if (news[i].tags)
                    news[i].tags = JSON.parse(news[i].tags)
                // DEEP CONVERT LINKS
                if (news[i].links)
                    news[i].links = JSON.parse(news[i].links)
            }*/

            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { news: news },
            };


            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const addProfilesToNew = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.addProfilesToNew(cmd.options.profiles, cmd.options.newuid, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const addGroupsToNew = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.addGroupsToNew(cmd.options.groups, cmd.options.newuid, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const addGroupsToEvent = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.addGroupsToEvent(cmd.options.groups, cmd.options.eventuid, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getNewsByProfile = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let news = await tormdata.getNewsByProfile(cmd.options, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { news: news },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getNewsByGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let news = await tormdata.getNewsByGroup(cmd.options, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { news: news },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getEventsByGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let events:any = await tormdata.getEventsByGroup(cmd.options, chkperm)
            for (let i = 0; i < events.length; i++) {
                for (let j = 0; j < events[i].attendees.length; j++) {
                    events[i].attendees[j] = events[i].attendees[j].replaceAll(';', ',')
                    events[i].attendees[j] = JSON.parse(events[i].attendees[j])
                }
                if (events[i].alarms && events[i].alarms.trigger) {
                    events[i].alarms.trigger = JSON.parse(events[i].alarms.trigger)
                }

            }
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { events: events },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};



const deleteNewFromProfile = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteNewFromProfile(cmd.options, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteNewFromGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteNewFromGroup(cmd.options, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteEventFromGroup = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteEventFromGroup(cmd.options, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteNew = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const _new = await tormdata.deleteNew(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { new: _new },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const insertEvent = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (cmd.options.attendees) {
                for (let j = 0; j < cmd.options.attendees.length; j++) {
                    cmd.options.attendees[j] = JSON.stringify(cmd.options.attendees[j]).replaceAll(',', ';')
                }
            }
            // DEEP CONVERT ALARMS
            if (cmd.options.alarms && cmd.options.alarms.trigger) {
                const trigger = JSON.stringify(cmd.options.alarms.trigger)
                cmd.options.alarms.trigger = trigger
            }

            cmd.options.createdAt = getCurrentDateTime()
            cmd.options.uid = cmd.options.uid ? cmd.options.uid : uuidv4()

            const event = await tormdata.insertEvent(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { event: event },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateEvent = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // ADJUST EVENT OBJECT
            const keys = Object.keys(cmd.options)
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] == 'attendees') {
                    for (let j = 0; j < cmd.options.attendees.length; j++) {
                        cmd.options.attendees[j] = JSON.stringify(cmd.options.attendees[j]).replaceAll(',', ';')
                    }
                }
                
                if (keys[i] == 'alarms') {
                    // DEEP CONVERT ATENDEES
                    if (cmd.options.alarms && cmd.options.alarms.trigger) {
                        const trigger = JSON.stringify(cmd.options.alarms.trigger)
                        cmd.options.alarms.trigger = trigger
                    }
                }
            }


            const event = await tormdata.updateEvent(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { event: event },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};
const getEvent = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const events:any = await tormdata.getEvent(cmd.options, chkperm);
            for (let i = 0; i < events.length; i++) {
                for (let j = 0; j < events[i].attendees.length; j++) {
                    events[i].attendees[j] =events[i].attendees[j].replaceAll(';', ',')
                    events[i].attendees[j] = JSON.parse(events[i].attendees[j])
                }
                if (events[i].alarms && events[i].alarms.trigger) {
                    events[i].alarms.trigger = JSON.parse(events[i].alarms.trigger)
                }
                
            }

            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { events: events },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const addProfilesToEvent = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.addProfilesToEvent(cmd.options.profiles, cmd.options.eventuid, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getEventsByProfile = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let events:any = await tormdata.getEventsByProfile(cmd.options, chkperm)
            for (let i = 0; i < events.length; i++) {
                for (let j = 0; j < events[i].attendees.length; j++) {
                    events[i].attendees[j] = events[i].attendees[j].replaceAll(';', ',')
                    events[i].attendees[j] = JSON.parse(events[i].attendees[j])
                }
                if (events[i].alarms && events[i].alarms.trigger) {
                    events[i].alarms.trigger = JSON.parse(events[i].alarms.trigger)
                }

            }
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { events: events },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteEventFromProfile = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteEventFromProfile(cmd.options, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteEvent = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const event = await tormdata.deleteEvent(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { event: event },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const insertMessage = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // ADJUST MESSAGE OBJECT
            // DEEP CONVERT ATTACHEMENT
            if (cmd.options.attachments) {
                for (let j = 0; j < cmd.options.attachments.length; j++) {
                    cmd.options.attachments[j] = '{' + tormdata.deepConvert(cmd.options.attachments[j]) + '}'
                }
            }
            cmd.options.attachments = JSON.stringify(cmd.options.attachments)
            // DEEP CONVERT LIST
            if (cmd.options.list)
                cmd.options.list = '{' + tormdata.deepConvert(cmd.options.list) + '}'

            cmd.options.date = getCurrentDateTime()
            cmd.options.uid = cmd.options.uid ? cmd.options.uid : uuidv4()

            const message = await tormdata.insertMessage(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { message: message },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateMessage = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            // ADJUST EVENT OBJECT
            const keys = Object.keys(cmd.options)
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] == 'attachments') {
                    // DEEP CONVERT ATTACHMENTS
                    for (let j = 0; j < cmd.options.attachments.length; j++) {
                        cmd.options.attachments[j] = '{' + tormdata.deepConvert(cmd.options.attachments[j]) + '}'
                    }
                }
                if (keys[i] == 'list') {
                    // DEEP CONVERT LIST
                    cmd.options.list = '{' + tormdata.deepConvert(cmd.options.list) + '}'
                }

            }
            const message = await tormdata.updateMessage(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { message: message },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};
const getMessage = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const messages:any = await tormdata.getMessage(cmd.options, chkperm);
            for (let i = 0; i < messages.length; i++) {
                messages[i].attachments = JSON.parse(messages[i].attachments)
                // RECOVER EVENT ATTENDEES
                for (let j = 0; j < messages[i].attachments.length; j++) {
                    messages[i].attachments[j] = messages[i].attachments[j].replaceAll(',}', '}')
                    messages[i].attachments[j] = JSON.parse(messages[i].attachments[j])
                }
                if (messages[i].list) {
                    messages[i].list = messages[i].list.replaceAll(',}', '}')
                    messages[i].list = JSON.parse(messages[i].list)
                }
            }

            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { messages: messages },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteMessage = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const message = await tormdata.deleteMessage(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { message: message },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const sendMessage = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const message = await tormdata.sendMessage(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { message: message },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    });
};

const backupDb = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const message = await tormdata.backupDb(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { message: message },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

const restoreDb = async (cmd:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const message = await tormdata.restoreDb(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { message: message },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

const getCompany = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const companies: any = await tormdata.getCompany(cmd.options, chkperm);



            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { companies: companies },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const insertCompany = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            
            cmd.options.uid = cmd.options.uid ? cmd.options.uid : uuidv4()
            if (!cmd.options.owner)
                cmd.options.owner = chkperm.useruid
            
            const company = await tormdata.insertCompany(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { company: company },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateCompany = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const company = await tormdata.updateCompany(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { company: company },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const deleteCompany = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteCompany(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const addProfilesToCompany = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.addProfilesToCompany(cmd.options.profiles, cmd.options.groupname, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteProfilesFromCompany = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteProfilesFromCompany(cmd.options.profiles, cmd.options.groupname, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getProfilesByCompany = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let profiles: any = await tormdata.getProfilesByCompany(cmd.options, chkperm)
            // DECRYPT SEBSITIVE DATA
            for (let i = 0; i < profiles.length; i++) {
                if (profiles[i].mobile)
                    profiles[i].mobile = cutils.decrypt(profiles[i].mobile, cryptokey)
                if (profiles[i].otherphone)
                    profiles[i].otherphone = cutils.decrypt(profiles[i].otherphone, cryptokey)
                if (profiles[i].name)
                    profiles[i].name = cutils.decrypt(profiles[i].name, cryptokey)
                if (profiles[i].surname)
                    profiles[i].surname = cutils.decrypt(profiles[i].surname, cryptokey)
                if (profiles[i].bdate)
                    profiles[i].bdate = cutils.decrypt(profiles[i].bdate, cryptokey)
                if (profiles[i].address)
                    profiles[i].address = cutils.decrypt(profiles[i].address, cryptokey)
                if (profiles[i].idnumber)
                    profiles[i].idnumber = cutils.decrypt(profiles[i].idnumber, cryptokey)
                if (profiles[i].linkedin)
                    profiles[i].linkedin = cutils.decrypt(profiles[i].linkedin, cryptokey)
                if (profiles[i].facebook)
                    profiles[i].facebook = cutils.decrypt(profiles[i].facebook, cryptokey)
                if (profiles[i].twitter)
                    profiles[i].twitter = cutils.decrypt(profiles[i].twitter, cryptokey)
                if (profiles[i].instagram)
                    profiles[i].instagram = cutils.decrypt(profiles[i].instagram, cryptokey)
                if (profiles[i].skype)
                    profiles[i].skype = cutils.decrypt(profiles[i].skype, cryptokey)
                if (profiles[i].whatsapp)
                    profiles[i].whatsapp = cutils.decrypt(profiles[i].whatsapp, cryptokey)
                if (profiles[i].telegram)
                    profiles[i].telegram = cutils.decrypt(profiles[i].telegram, cryptokey)
                if (profiles[i].othersocial)
                    profiles[i].othersocial = cutils.decrypt(profiles[i].othersocial, cryptokey)
                if (profiles[i].shortbio)
                    profiles[i].shortbio = cutils.decrypt(profiles[i].shortbio, cryptokey)
                if (profiles[i].profexp1)
                    profiles[i].profexp1 = cutils.decrypt(profiles[i].profexp1, cryptokey)
                if (profiles[i].profexp2)
                    profiles[i].profexp2 = cutils.decrypt(profiles[i].profexp2, cryptokey)
                if (profiles[i].profexp3)
                    profiles[i].profexp3 = cutils.decrypt(profiles[i].profexp3, cryptokey)
                if (profiles[i].education)
                    profiles[i].education = cutils.decrypt(profiles[i].education, cryptokey)
                if (profiles[i].website)
                    profiles[i].website = cutils.decrypt(profiles[i].website, cryptokey)
                if (profiles[i].profession)
                    profiles[i].profession = cutils.decrypt(profiles[i].profession, cryptokey)
                if (profiles[i].taxcode)
                    profiles[i].taxcode = cutils.decrypt(profiles[i].taxcode, cryptokey)
            }
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { profiles: profiles },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getCompaniesByProfile = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let companies = await tormdata.getCompaniesByProfile(cmd.options, chkperm)
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { companies: companies },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const getRegion = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const regions: any = await tormdata.getRegion(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { regions: regions },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const insertRegion = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!cmd.options.owner)
                cmd.options.owner = chkperm.useruid

            const region = await tormdata.insertRegion(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { region: region },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateRegion = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const region = await tormdata.updateRegion(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { region: region },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const deleteRegion = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteRegion(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getSubregion = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const subregions: any = await tormdata.getSubregion(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { subregions: subregions },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const insertSubregion = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!cmd.options.owner)
                cmd.options.owner = chkperm.useruid

            const subregion = await tormdata.insertSubregion(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { subregion: subregion },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateSubregion = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const subregion = await tormdata.updateSubregion(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { subregion: subregion },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const deleteSubregion = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteSubregion(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getCountry = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const countries: any = await tormdata.getCountry(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { countries: countries },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const insertCountry = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!cmd.options.owner)
                cmd.options.owner = chkperm.useruid

            const country = await tormdata.insertCountry(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { country: country },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateCountry = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const country = await tormdata.updateCountry(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { country: country },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const deleteCountry = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteCountry(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getState = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const states: any = await tormdata.getState(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { states: states },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const insertState = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!cmd.options.owner)
                cmd.options.owner = chkperm.useruid

            const state = await tormdata.insertState(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { state: state },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateState = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const state = await tormdata.updateState(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { state: state },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const deleteState = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteState(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getCity = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const cities: any = await tormdata.getCity(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { cities: cities },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const insertCity = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!cmd.options.owner)
                cmd.options.owner = chkperm.useruid

            const city = await tormdata.insertCity(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { city: city },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateCity = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const city = await tormdata.updateCity(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { city: city },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};


const deleteCity = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await tormdata.deleteCity(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { count: count },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const insertNewTrans = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            cmd.options.uid = cmd.options.uid ? cmd.options.uid : uuidv4()
            cmd.options.published = getCurrentDateTime()
            cmd.options.author = chkperm.useruid
            console.log("TORMDB INSERT NEW TRANS", cmd.options,chkperm)
            const _new = await tormdata.insertNewTrans(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { new: _new },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateNewTrans = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const _new = await tormdata.updateNewTrans(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { new: _new },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getNewTrans = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const news: any = await tormdata.getNewTrans(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { news: news },
            };


            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteNewTrans = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const _new = await tormdata.deleteNewTrans(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { new: _new },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const insertEventTrans = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            cmd.options.uid = cmd.options.uid ? cmd.options.uid : uuidv4()
            cmd.options.published = getCurrentDateTime()
            cmd.options.author = chkperm.useruid
            console.log("TORMDB INSERT NEW TRANS", cmd.options, chkperm)
            const event = await tormdata.insertEventTrans(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { event: event },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const updateEventTrans = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const event = await tormdata.updateEventTrans(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { event: event },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const getEventTrans = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const events: any = await tormdata.getEventTrans(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { events: events },
            };


            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};

const deleteEventTrans = async (cmd: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const event = await tormdata.deleteEventTrans(cmd.options, chkperm);
            const response = {
                type: cmd.type,
                version: cmd.version,
                command: cmd.command,
                result: true,
                error: null,
                data: { event: event },
            };

            resolve(response);
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
};



const tormdb = {
    init,
    testApi,
    login,
    getProfile,
    insertProfile,
    updateProfile,
    deleteProfile,
    changeStatement,
    getGroup,
    insertGroup,
    updateGroup,
    deleteGroup,
    addProfilesToGroup,
    deleteProfilesFromGroup,
    deleteGroupFromProfilesGroup,
    deleteProfileFromProfilesGroup,
    getProfilesByGroup,
    getGroupsByProfile,
    insertNew,
    updateNew,
    getNew,
    addProfilesToNew,
    addGroupsToNew,
    addGroupsToEvent,
    getNewsByProfile,
    getNewsByGroup,
    getEventsByGroup,
    deleteNewFromProfile,
    deleteNew,
    insertEvent,
    updateEvent,
    getEvent,
    addProfilesToEvent,
    getEventsByProfile,
    deleteEventFromProfile,
    deleteNewFromGroup,
    deleteEventFromGroup,
    deleteEvent,
    insertMessage,
    updateMessage,
    getMessage,
    deleteMessage,
    sendMessage,
    backupDb,
    restoreDb,
    checkNullOwner,
    getCompany,
    insertCompany,
    updateCompany,
    deleteCompany,
    addProfilesToCompany,
    deleteProfilesFromCompany,
    getProfilesByCompany,
    getCompaniesByProfile,
    getRegion,
    insertRegion,
    updateRegion,
    deleteRegion,
    getSubregion,
    insertSubregion,
    updateSubregion,
    deleteSubregion,
    getCountry,
    insertCountry,
    updateCountry,
    deleteCountry,
    getState,
    insertState,
    updateState,
    deleteState,
    getCity,
    insertCity,
    updateCity,
    deleteCity,
    insertNewTrans,
    updateNewTrans,
    getNewTrans,
    deleteNewTrans,
    insertEventTrans,
    updateEventTrans,
    getEventTrans,
    deleteEventTrans,
};
export default tormdb;
