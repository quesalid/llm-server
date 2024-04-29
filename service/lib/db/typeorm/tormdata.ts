import { LomDataSource } from "./DataSource.js"
import { Persprofile, Profprofile, New, NewTrans,Event,EventTrans, Message, Group, Company } from "./entities/entities.js"
import {City, Region,Country,Subregion, State } from "./entities/locentities.js"
//import { Profprofile } from "./entities/altentities.js"
import { fromFilterToObject } from "./DataFilter.js"
import sendEmail from '../../utils/emailsender.js'
import { v4 as uuidv4 } from "uuid"
import { Not } from "typeorm";


let db: any
let manager: any

const Timer = async (sec:number) => {
    let counter = 0
    while (counter < sec) {
        const line = "\u25AE"
        await new Promise((res) => setTimeout(res, 1000))
        process.stdout.write(line)
        counter++
    }
}

const sanitize = (value:string) => {
    if (value && value.replace) {
        value = value.replace(/'/g, "''")
    }
    return value
}

const deepConvert:any = (obj:any) => (
    Object.entries(obj)
        .map(([key, value]) => (
            typeof value === 'string' || typeof value === 'number' || typeof value === "boolean"
                ? `"${key}":${retValue(value)},`
                : `"${key}":{${deepConvert(value)}},`
        ))
        .join('')
)

const retValue = (value:any) => {
    let retval
    switch (typeof value) {
        case 'string':
            retval = '"' + value + '"'
            break
        default:
            retval = value
            break
    }
    return (retval)
}

const init = async (dbname: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            db = await new LomDataSource(dbname)
            const ret = await db.init()
            if (ret && ret.options) {
                if(ret.options.password)
                    ret.options.password = "********"
                if(ret.options.username)
                    ret.options.username = "********"
            }
            console.log("DB CONNECTION:",ret.options)
            manager = db.db.manager
            resolve(null)
        } catch (error) {
            reject(error)
        }
    })
}

const insertGroup = (group:any, chkperm:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Group, { where: { name: group.name } })
            if (found) {
                reject("ERR_GROUPNAME_ALREADY_EXISTS")
            } else {
                const newgroup: any = new Group()
                // SANITIZE
                newgroup.owner = group.owner ? group.owner : chkperm.useruid
                newgroup.name = sanitize(group.name)
                newgroup.description = sanitize(group.description)
                newgroup.type = group.type ? group.type : 'USER'
                newgroup.uid = group.uid ? group.uid : uuidv4(),
                newgroup.tags = group.tags ? group.tags : []
                const result = await manager.insert(Group, newgroup)
                const sync = await manager.findOne(Group, { where: { name: newgroup.name } })
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const getGroup = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters:any = await fromFilterToObject(options,manager,'group')
            if (!chkperm.checked === true)
                filters['owner'] = chkperm.useruid
            const result = await manager.find(Group, { where: filters })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateGroup = (group: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Group, { where: { uid: group.uid } })
            if (!found) {
                reject("ERR_GROUP_NOT_FOUND")
            } else {
                const filters:any = { name: group.name }
                if (!chkperm.checked === true)
                    filters['owner'] = chkperm.useruid
                // SANITIZE
                group.name = sanitize(group.name)
                group.description = sanitize(group.description)
                const result = await manager.update(Group, filters, group)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const addProfilesToGroup = (profiles: any, groupname: string, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Group, { where: { name: groupname } })
            if (!found) {
                reject("ERR_GROUP_NOT_FOUND")
            } else {
                if (chkperm.checked != true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                const persprofiles = await manager.findByIds(Persprofile, profiles)
                // ADD NEW PROFILES TO OLD ONES
                const oldprofiles = await found.profiles
                for (let i = 0; i < persprofiles.length; i++) {
                    const index = oldprofiles.findIndex((item:any)=> item.uid == persprofiles[i].uid)
                    if (index == -1) {
                        oldprofiles.push(persprofiles[i])
                    }
                }
                found.profiles = oldprofiles
                //found.profiles = persprofiles
                const result = await manager.save(Group,found)
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const getProfilesByGroup = (group: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let name = group.name
            const found = await manager.findOne(Group, { where: { name: name } })
            if (!found) {
                reject("ERR_GROUP_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                //const result = await manager.find(Persprofile, { where: { groups: found } })
                resolve(found.profiles)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const getGroupsByProfile = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let owner = ""
            let uid = options.uid
            let profile = await manager.findOne(Persprofile, { where: { uid: uid } })
            if (!profile)
                reject("ERR_PROFILE_NOT_FOUND")
            owner = profile.owner
            let filters: any = {}
            filters['uid'] = options.uid
            if (chkperm.checked != true && owner != chkperm.useruid)
                reject("PERMISSION_DENIED")
            
            else {
                const groups = await profile.groups
                resolve(groups)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteProfilesFromGroup = (profiles: any, groupname: string, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Group, { where: { name: groupname } })
            if (!found) {
                reject("ERR_GROUP_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                const persprofiles = await manager.findByIds(Persprofile, profiles)
                // delete profils fron group
                for (let i = 0; i < persprofiles.length; i++) {
                    const index = profiles.indexOf(persprofiles[i])
                    if (index > -1) {
                        profiles.splice(index, 1)
                    }
                }
                found.profiles = profiles
                const result = await manager.save(Group,found)
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteGroup = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = options.uid
            switch(uid){
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(Group, { uid: Not(uid) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(Group, { where: { uid: uid } })
                    if (!found) {
                        reject("ERR_GROUP_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true && found.owner != chkperm.useruid)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(Group, { uid: uid })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}

const insertProfile = (profile: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const persprofile = new Persprofile()
            const profprofile = new Profprofile()
            persprofile.uid = profile.uid ? profile.uid : reject("NO_UID_IN_NEW_PROFILE")
            if (!profile.name)
                reject("NO_NAME_IN_NEW_PROFILE")
            persprofile.name = sanitize(profile.name)
            if (!profile.surname)
                reject("NO_SURNAME_IN_NEW_PROFILE")
            persprofile.surname = sanitize(profile.surname)
            persprofile.statement = profile.statement ? profile.statement : ''
            persprofile.language = profile.language ? profile.language : 'en'
            persprofile.nlsubscription = profile.nlsubscription ? profile.nlsubscription : false
            persprofile.ppolicy = profile.ppolicy ? profile.ppolicy : false
            persprofile.gender = profile.gender ? profile.gender : 'ND'
            persprofile.address = profile.address ? sanitize(profile.address) : ''
            persprofile.city = profile.city ? sanitize(profile.city) : ''
            persprofile.region = profile.region ? sanitize(profile.region) : ''
            persprofile.country = profile.country ? sanitize(profile.country) : ''
            persprofile.zip = profile.zip ? sanitize(profile.zip) : ''
            persprofile.bcountry = profile.bcountry ? sanitize(profile.bcountry) : ''
            persprofile.bdate = profile.bdate ? profile.bdate : ''
            persprofile.bstate = profile.bstate ? sanitize(profile.bstate) : ''
            persprofile.bprovince = profile.bprovince ? sanitize(profile.bprovince) : ''
            persprofile.bcity = profile.bcity ? sanitize(profile.bcity) : ''
            persprofile.idnumber = profile.idnumber ? sanitize(profile.idnumber) : ''
            persprofile.idtype = profile.idtype ? sanitize(profile.idtype) : ''
            persprofile.idvalidity = profile.idvalidity ? sanitize(profile.idvalidity) : ''
            persprofile.mobile = profile.mobile ? sanitize(profile.mobile) : ''
            persprofile.otherphone = profile.otherphone ? sanitize(profile.otherphone) : ''
            persprofile.image = profile.image ? sanitize(profile.image) : ''
            persprofile.linkedin = profile.linkedin ? sanitize(profile.linkedin) : ''
            persprofile.facebook = profile.facebook ? sanitize(profile.facebook) : ''
            persprofile.twitter = profile.twitter ? sanitize(profile.twitter) : ''
            persprofile.instagram = profile.instagram ? sanitize(profile.instagram) : ''
            persprofile.skype = profile.skype ? sanitize(profile.skype) : ''
            persprofile.whatsapp = profile.whatsapp ? sanitize(profile.whatsapp) : ''
            persprofile.telegram = profile.telegram ? sanitize(profile.telegram) : ''
            persprofile.othersocial = profile.othersocial ? sanitize(profile.othersocial) : ''
            persprofile.owner = profile.owner ? profile.owner : chkperm.useruid

            profprofile.uid = profile.uid ? profile.uid : reject("NO_UID_IN_NEW_PROFILE")
            profprofile.owner = profile.owner ? profile.owner : chkperm.useruid
            profprofile.shortbio = profile.shortbio ? sanitize(profile.shortbio) : ''
            profprofile.sectors = profile.sectors ? profile.sectors : []
            profprofile.skills = profile.skills ? profile.skills : []
            profprofile.languages = profile.languages ? profile.languages : []
            profprofile.profexp1 = profile.profexp1 ? sanitize(profile.profexp1) : ''
            profprofile.profexp2 = profile.profexp2 ? sanitize(profile.profexp2) : ''
            profprofile.profexp3 = profile.profexp3 ? sanitize(profile.profexp3) : ''
            profprofile.website = profile.website ? sanitize(profile.website) : ''
            profprofile.education = profile.education ? sanitize(profile.education) : ''
            profprofile.owner = profile.owner ? profile.owner : chkperm.useruid
            profprofile.profession = profile.profession ? sanitize(profile.profession) : ''
            profprofile.taxcode = profile.taxcode ? sanitize(profile.taxcode) : ''

            const ret2 = await manager.insert(Profprofile, profprofile)
            const insertedProf = await manager.findOne(Profprofile, { where: { uid: profile.uid } })
            persprofile.profprofile = await insertedProf
            //profprofile.persprofile = persprofile

            const ret1 = await manager.insert(Persprofile, persprofile)
            const insertedPers = await manager.findOne(Persprofile, { where: { uid: profile.uid } })
            //MERGE RET1 AND RET2
            const result = { ...insertedPers, ...insertedProf }
            resolve(result)
        } catch (error) {
                reject(error)
        }
    })
}

const getPersprofile = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters:any = await fromFilterToObject(options,manager,'persprofile')
            if (chkperm.checked != true)
                filters['owner'] = chkperm.useruid
            const result = await manager.find(Persprofile, { where: filters })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const getProfprofile = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters = await fromFilterToObject(options,manager,'profprofile')
            if (chkperm.checked != true)
                filters['owner'] = chkperm.useruid
            const result = await manager.find(Profprofile, { where: filters })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateProfile = async (profile: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
        try {
            const persprofile = await manager.findOne(Persprofile, { where: { uid: profile.uid } })
            const profprofile = await manager.findOne(Profprofile, { where: { uid: profile.uid } })
            if (!persprofile || !profprofile) {
                reject("ERR_PROFILE_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && persprofile.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                const keys = Object.keys(profile)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in persprofile
                    if (persprofile.hasOwnProperty(key)) {
                        // SANITIZE
                        if(typeof profile[key] === 'string')
                            persprofile[key] = sanitize(profile[key])
                        else
                            persprofile[key] = profile[key]
                    }
                    // if key is in profprofile
                    if (profprofile.hasOwnProperty(key)) {
                        // SANITIZE
                        if(typeof profile[key] === 'string')
                            profprofile[key] = sanitize(profile[key])
                        else
                            profprofile[key] = profile[key]
                    }
                }
                // UPDATE PERSPROFILE
                const result1 = await manager.update(Persprofile, { uid: persprofile.uid }, persprofile)
                // UPDATE PROFPROFILE
                const result2 = await manager.update(Profprofile, { uid: profprofile.uid }, profprofile)
                resolve(1)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteProfile = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = options.uid
            switch (uid) {
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(Persprofile, { uid: Not(uid) })
                    const result1 = await manager.delete(Profprofile, { uid: Not(uid) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(Persprofile, { where: { uid: uid } })
                    if (!found) {
                        reject("ERR_PROFILE_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true && found.owner != chkperm.useruid)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(Persprofile, { uid: uid })
                        const result1 = await manager.delete(Profprofile, { uid: uid })
                        resolve(1)
                    }
                 break
            }
        } catch (error) {
            reject(error)
        }
    })
}

const insertEvent = (event: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
        try {
            const newevent = new Event()
            
            // SANITIZE
            newevent.uid = event.uid ? event.uid : reject("NO_UID_IN_NEW_EVENT")
            console.log("NEW EVENT TITLE BEFORE:", event.title)
            newevent.title = event.title ? sanitize(event.title) : ''
            console.log("NEW EVENT TITLE AFTER:", newevent.title)
            newevent.start = event.start ? event.start : []
            newevent.startInputType = event.startInputType ? sanitize(event.startInputType) : 'local'
            newevent.startOutputType = event.startOutputType ? sanitize(event.startOutputType) : 'utc'
            newevent.duration = event.duration ? event.duration : { days: 0, hours: 0, minutes: 0 }
            newevent.description = event.description ? sanitize(event.description) : ''
            newevent.location = event.location ? sanitize(event.location) : ''
            newevent.url = event.url ? sanitize(event.url) : ''
            newevent.geo = event.geo ? event.geo : { lat: 0, lon: 0 }
            newevent.categories = event.categories ? event.categories : []
            newevent.status = event.status ? sanitize(event.status) : 'TENTATIVE'
            newevent.busyStatus = event.busyStatus ? sanitize(event.busyStatus) : 'TENTATIVE'
            newevent.organizer = event.organizer ? event.organizer : { name: '', email: '', dir: '', sentBy: '' }
            newevent.alarms = event.alarms ? event.alarms : { action: '', trigger: '{ "hours": "0", "minutes": "0", "before": "true" }' }
            newevent.classification = event.classification ? sanitize(event.classification) : 'PUBLIC'
            newevent.calName = event.calName ? sanitize(event.calName) : ''
            newevent.method = event.method ? sanitize(event.method) : 'PUBLISH'
            newevent.attendees = event.attendees ? event.attendees : []
            newevent.productId = event.productId ? event.productId : 'marscalendar/ics'

            const result = await manager.insert(Event, newevent)
            const sync = await manager.findOne(Event, { where: { uid: event.uid } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getEvent = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters:any = await fromFilterToObject(options,manager,'event')
            const result = await manager.find(Event, { where: filters })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateEvent = (event: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Event, { where: { uid: event.uid } })
            if (!found) {
                reject("ERR_EVENT_NOT_FOUND")
            } else {
                const keys = Object.keys(event)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in event
                    if (found[key]) {
                        // SANITIZE
                        //if (key == 'attendees')
                            //found[key] = JSON.stringify(JSON.parse(found[key]))

                        if (typeof event[key] === 'string') {
                            found[key] = sanitize(event[key])
                        }
                        else {
                            found[key] = event[key]
                        }
                    }
                }
                const result = await manager.update(Event, { uid: event.uid }, found)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const addProfilesToEvent = (profiles: any, eventid: string, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Event, { where: { uid: eventid } })
            if (!found) {
                reject("ERR_EVENT_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                const persprofiles = await manager.findByIds(Persprofile, profiles)
                //const persprofiles = await manager.find(Persprofile, profiles)
                for (let i = 0; i < persprofiles.length; i++){
                    const persprofile = persprofiles[i]
                    const oldevents = await persprofile.events
                    oldevents.push(found)
                    persprofile.events = oldevents
                    await manager.save(Persprofile,persprofile)
                }
                resolve(found)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const getEventsByProfile = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = options.uid
            const found = await manager.findOne(Persprofile, { where: { uid: uid } })
            if (!found) {
                reject("ERR_PROFILE_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                //const result = await manager.find(Persprofile, { where: { groups: found } })
                resolve(found.events)
            }
        } catch (error) {
            reject(error)
        }
    })

}

const deleteEventFromProfile = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let puid = options.puid
            let euid = options.euid
            const found = await manager.findOne(Persprofile, { where: { uid: puid } })
            if (!found) {
                reject("ERR_EVENT_NOT_FOUND")
            } else {
                if (!chkperm.checked === true )
                    reject("PERMISSION_DENIED")
                const events = await found.events
                const index = events.findIndex((item:any)=> item.uid == euid)
                if (index > -1) {
                    events.splice(index, 1)
                }
                found.events = events
                const result = await manager.save(Persprofile,found)
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteEvent = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = options.uid
            switch(uid){
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(Event, { uid: Not(uid) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(Event, { where: { uid: uid } })
                    if (!found) {
                        reject("ERR_EVENT_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(Event, { uid: uid })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}

const insertNew = (_new: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
    try {
            const newnew:any = new New()
            // SANITIZE
            newnew.uid = _new.uid ? _new.uid : uuidv4()
            newnew.title = _new.title ? sanitize(_new.title):''
            newnew.subtitle = _new.subtitle ? sanitize(_new.subtitle) : ''
            newnew.text = _new.text ? sanitize(_new.text) : ''
            newnew.html = _new.html ? sanitize(_new.html) : ''
            newnew.tags = _new.tags ? _new.tags : []
            newnew.links = _new.links ? _new.links : []
            newnew.published = _new.published ? _new.published : new Date()
            const result = await manager.insert(New, newnew)
            const sync = await manager.findOne(New, { where: { uid: newnew.uid } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getNew = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters:any = await fromFilterToObject(options,manager,'new')
            const result = await manager.find(New, { where: filters, order: {published:'DESC'} })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateNew = (newnew: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = newnew.uid
            const found = await manager.findOne(New, { where: { uid: uid } })
            if (!found) {
                reject("ERR_NEW_NOT_FOUND")
            } else {
                const keys = Object.keys(newnew)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in new
                    if (found[key]) {
                        // SANITIZE
                        if (typeof newnew[key] === 'string')
                            found[key] = sanitize(newnew[key])
                        else
                            found[key] = newnew[key]
                    }
                }
                const result = await manager.update(New, { uid: newnew.uid }, newnew)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const addProfilesToNew = (profiles: any, newid: string, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(New, { where: { uid: newid } })
            if (!found) {
                reject("ERR_NEW_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                const persprofiles = await manager.findByIds(Persprofile, profiles)
                //const persprofiles = await manager.find(Persprofile, profiles)
                for (let i = 0; i < persprofiles.length; i++) {
                    const persprofile = persprofiles[i]
                    const oldnews = await persprofile.news
                    oldnews.push(found)
                    persprofile.news = oldnews
                    await manager.save(Persprofile,persprofile)
                }
                resolve(found)
            }
        } catch (error) {
            reject(error)
        }
    })

}

const addGroupsToNew = (newgroups: any, newid: string, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(New, { where: { uid: newid } })
            if (!found) {
                reject("ERR_NEW_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                // Get groups objects
                const groups: any = await manager.findByIds(Group, newgroups)
                for (let i = 0; i < groups.length; i++){
                    const group = groups[i]
                    const oldnews = await group.news
                    // Get groups in new
                    oldnews.push(found)
                    group.news = oldnews
                    await manager.save(Group, group)
                }
               
                resolve(groups.length)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const addGroupsToEvent = (newgroups: any, eventuid: string, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Event, { where: { uid: eventuid } })
            if (!found) {
                reject("ERR_EVENT_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                // Get groups objects
                const groups: any = await manager.findByIds(Group, newgroups)
                for (let i = 0; i < groups.length; i++) {
                    const group = groups[i]
                    const oldevents = await group.events
                    // Get groups in new
                    oldevents.push(found)
                    group.events = oldevents
                    await manager.save(Group, group)
                }

                resolve(found)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const getNewsByProfile = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let filters: any = {}
            let uid = options.uid
            filters['uid'] = uid
            if (!chkperm.checked === true)
                filters['owner'] = chkperm.useruid
            const found = await manager.findOne(Persprofile, { where: filters })
            if (!found) {
               reject("ERR_PROFILE_NOT_FOUND")
            } else {
                const news = await found.news
                resolve(news)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const getNewsByGroup = (options: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
    try {
        let filters: any = {}
        let uid = options.uid
        filters['uid'] = uid
        const found = await manager.findOne(Group, { where: { uid: uid } })
        if (!found) {
            reject("ERR_GROUP_NOT_FOUND")
        } else {
            if (chkperm.checked != true && found.owner != chkperm.useruid)
                reject("PERMISSION_DENIED")
            else {
                const news = await found.news
                if (news) {
                    resolve(news)
                } else {
                    resolve([])
                }
            }
        }
        } catch (error) {
            reject(error)
        }
    })
}

const getEventsByGroup = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let filters: any = {}
        let uid = options.uid
        filters['uid'] = uid
        const found = await manager.findOne(Group, { where: { uid: uid } })
        if (!found) {
            reject("ERR_GROUP_NOT_FOUND")
        } else {
            if (chkperm.checked != true && found.owner != chkperm.useruid)
                reject("PERMISSION_DENIED")
            else {
                const events = await found.events
                if (events) {
                    resolve(events)
                } else {
                    resolve([])
                }
            }
        }
    } catch (error) {
        reject(error)
    }
    })
}

const deleteNewFromProfile = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let puid = options.puid
            let uid = options.uid
            const found = await manager.findOne(Persprofile, { where: { uid: puid } })
            if (!found) {
                reject("ERR_NEW_NOT_FOUND")
            } else {
                if (!chkperm.checked === true)
                    reject("PERMISSION_DENIED")
                const news = await found.news
                const index = news.findIndex((item: any) => item.uid == uid)
                if (index > -1) {
                    news.splice(index, 1)
                }
                found.news = news
                const result = await manager.save(Persprofile, found)
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteNewFromGroup = (options: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
    try {
        let guid = options.guid
            let uid = options.uid
            // Get Group object
            const found = await manager.findOne(Group, { where: { uid: guid } })
            if (!found) {
                reject("ERR_NEW_NOT_FOUND")
            } else {
                if (!chkperm.checked === true)
                    reject("PERMISSION_DENIED")
                const news = await found.news
                const index = news.findIndex((item: any) => item.uid == uid)
                if (index > -1) {
                    news.splice(index, 1)
                }
                found.news = news
                const result = await manager.save(Group, found)
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
})

}

const deleteEventFromGroup = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let guid = options.guid
            let uid = options.uid

            const found = await manager.findOne(Group, { where: { uid: guid } })
            if (!found) {
                reject("ERR_EVENT_NOT_FOUND")
            } else {
                if (!chkperm.checked === true)
                    reject("PERMISSION_DENIED")
                const events = await found.events
                const index = events.findIndex((item: any) => item.uid == uid)
                if (index > -1) {
                    events.splice(index, 1)
                }
                found.events = events
                const result = await manager.save(Group,found)
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    })

}

const deleteNew = (options: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
    try {
            let uid = options.uid
            switch(uid){
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(New,{ uid: Not(uid) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(New, { where: { uid: uid } })
                    if (!found) {
                        reject("ERR_NEW_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(New, { uid: uid })
                        resolve(result)
                    }
                    break
            }
            
        } catch (error) {
            reject(error)
        }
    })
}

const insertMessage = (message: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
        try {
            const newmessage:any = new Message()
            // SANITIZE
            newmessage.uid = message.uid ? message.uid : reject("NO_UID_IN_NEW_MESSAGE")
            newmessage.to = message.to ? sanitize(message.to) : ''
            newmessage.subject = message.subject ? sanitize(message.subject) : ''
            newmessage.subtitle = message.subtitle ? sanitize(message.subtitle) : ''
            newmessage.text = message.text ? sanitize(message.text) : ''
            newmessage.html = message.html ? sanitize(message.html) : ''
            newmessage.tags = message.tags ? message.tags : []
            newmessage.links = message.links ? message.links : []
            newmessage.list = message.list? message.list : null
            newmessage.attachments = message.attachments ? message.attachments : null
            newmessage.sent = message.sent ? message.sent : false
            newmessage.date = message.date ? message.date : null
            const result = await manager.insert(Message, newmessage)
            const sync = await manager.findOne(Message, { where: { uid: newmessage.uid } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getMessage = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters:any = await fromFilterToObject(options,manager,'message')
            const result = await manager.find(Message, { where: filters, order: { date: 'DESC' } })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateMessage = (message: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
    try {   
        let uid = message.uid
        let found = await manager.findOne(Message, { where: { uid: uid } })
            found = await found
            if (!found) {
                reject("ERR_MESSAGE_NOT_FOUND")
            } else {
                const keys = Object.keys(found)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in message
                    if (message[key]) {
                        // SANITIZE
                        if (typeof message[key] === 'string')
                            found[key] = sanitize(message[key])
                        else {
                            found[key] = message[key]
                        }
                    }
                }
                const result = await manager.update(Message, { uid: uid }, found)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteMessage = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = options.uid
            switch(options.uid){
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(Message, { uid: Not(uid) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(Message, { where: { uid: uid } })
                    if (!found) {
                        reject("ERR_MESSAGE_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(Message, { uid: uid })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}

const sendMessage = (opts: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
    try {
        let uid = opts.uid
        const message: any = await manager.findOne(Message, { where: { uid: uid } })
        if (!message)
            reject("ERR_MESSAGE_NOT_FOUND")


        if (message.attachments) {
            message.attachments = JSON.parse(message.attachments)
            // RECOVER EVENT ATTENDEES
            for (let j = 0; j < message.attachments.length; j++) {
                message.attachments[j] = message.attachments[j].replaceAll(',}', '}')
                message.attachments[j] = JSON.parse(message.attachments[j])
            }
        }
        if (message.list) {
            message.list = message.list.replaceAll(',}', '}')
            message.list = JSON.parse(message.list)
        }
        if (chkperm.checked === true || message.owner == chkperm.useruid) {
            //SEND EMAIL
            for (let i = 0; i < message.attachments.length; i++) {
                if (typeof (message.attachments[i].content == 'object') && message.attachments[i].content.type == 'Buffer')
                    message.attachments[i].content = new Uint8Array(message.attachments[i].content.data)
            }
            if (process.env.NOSEND == 'false' && process.env.TARGETSTATUS != 'development') { 
                const result = await sendEmail(message)
                message.sent = true
                message.date = new Date()
            }
            // DEEP CONVERT ATTACHMENTS
            for (let j = 0; j < message.attachments.length; j++) {
                message.attachments[j] = '{' + deepConvert(message.attachments[j]) + '}'
            }
            message.attachments = JSON.stringify(message.attachments)
            // DEEP CONVERT ATTENDEES
            message.list = '{' + deepConvert(message.list) + '}'
            const result2 = await manager.update(Message, { uid: message.uid }, message)
            resolve(result2)
        } else {
            resolve("PERMISSION_DENIED")
        }
    } catch (error) {
        reject(error)
    }
    })
}

const backupDb = (opts: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
        reject("NOT_IMPLEMENTED")
    })
}

const restoreDb = (opts: any, chkperm: any) => {
return new Promise(async (resolve, reject) => {
        reject("NOT_IMPLEMENTED")
    })
}

const checkNullOwner = (table: string, param: any) => {
    return new Promise(async (resolve, reject) => {
        const nullOwner = "00000000-0000-0000-0000-000000000000"
        let filter: any = { owner: nullOwner }
        switch (table) {
            case "group":
                filter['name'] = param
                break
            default:
                filter['uid'] = param
                break
        }
        try {
            let found:any = null
            switch (table) {
                    case "event":
                    found = await manager.findOne(Event, { where: filter })
                    break;
                case "new":
                    found = await manager.findOne(New, { where: filter })
                    break;
                case "message":
                    found = await manager.findOne(Message, { where: filter })
                    break;
                case "company":
                    found = await manager.findOne(Company, { where: filter })
                    break;
                case "group":
                    found = await manager.findOne(Group, { where: filter })
                    break;
                case "persprofile":
                    found = await manager.findOne(Persprofile, { where: filter })
                    break;
                case "profprofile":
                    found = await manager.findOne(Profprofile, { where: filter })
                    break;
            }
            if (!found) {
                resolve(false)
            } else {
                resolve(true)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const insertCompany = (company: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newcompany = new Company()
            newcompany.uid = company.uid ? company.uid : reject("NO_UID_IN_NEW_PROFILE")
            if (!company.name)
                reject("NO_NAME_IN_NEW_PROFILE")
            newcompany.name = sanitize(company.name)
            newcompany.sectors = company.sectors ? company.sectors : []
            newcompany.country = company.country ? sanitize(company.country) : ''
            newcompany.state = company.state ? sanitize(company.state) : ''
            newcompany.province = company.province ? sanitize(company.province) : ''
            newcompany.city = company.city ? sanitize(company.city) : ''
            newcompany.address = company.address ? sanitize(company.address) : ''
            newcompany.zip = company.zip ? sanitize(company.zip) : ''
            newcompany.startdate = company.startdate ? sanitize(company.startdate) : ''
            newcompany.uoc = company.uoc ? sanitize(company.uoc) : ''
            newcompany.uoctype = company.uoctype ? sanitize(company.uoctipe) : ''
            newcompany.taxcode = company.taxcode ? sanitize(company.taxcode) : ''
            newcompany.vatcode = company.vatcode ? sanitize(company.vatcode) : ''
            newcompany.note = company.note ? sanitize(company.note) : ''
            newcompany.owner = company.owner ? company.owner : chkperm.useruid

            const ret = await manager.insert(Company, company)
            const insertedCompany = await manager.findOne(Company, { where: { uid: company.uid } })
           
            resolve(insertedCompany)
        } catch (error) {
            reject(error)
        }
    })
}

const updateCompany = (company: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Company, { where: { uid: company.uid } })
            if (!found) {
                reject("ERR_COMPANY_NOT_FOUND")
            } else {
                const keys = Object.keys(company)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in event
                    if (found[key]) {

                        if (typeof company[key] === 'string') {
                            found[key] = sanitize(company[key])
                        }
                        else {
                            found[key] = company[key]
                        }
                    }
                }
                const result = await manager.update(Company, { uid: company.uid }, found)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const getCompany = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters: any = await fromFilterToObject(options, manager, 'company')
            if (chkperm.checked != true)
                filters['owner'] = chkperm.useruid
            const result = await manager.find(Company, { where: filters })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const addProfilesToCompany = (profiles: any, cuid: string, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Company, { where: { uid: cuid } })
            if (!found) {
                reject("ERR_COMPANY_NOT_FOUND")
            } else {
                if (chkperm.checked != true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                const persprofiles = await manager.findByIds(Persprofile, profiles)
                found.profiles = persprofiles
                const result = await manager.save(Company,found)
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const getProfilesByCompany = (company: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = company.uid
            const found = await manager.findOne(Company, { where: { uid: uid } })
            if (!found) {
                reject("ERR_COMPANY_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                resolve(found.profiles)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const getCompaniesByProfile = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = options.uid
            let owner = ""
            let profile = await manager.findOne(Persprofile, { where: { uid: uid } })
            owner = profile.owner
            let filters: any = {}
            filters['uid'] = options.uid
            if (chkperm.checked != true && owner != chkperm.useruid)
                reject("PERMISSION_DENIED")
            else {
                /*const result = await manager.find(Company, { relations: { profiles: true }, where: { profiles: profile } })
                // return Company ids
                let ret: any = []
                for (let i = 0; i < result.length; i++) {
                    ret.push(result[i].uid)
                }*/
                const companies = await profile.companies
                resolve(companies)
                
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteProfilesFromCompany = (profiles: any, cuid: string, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const found = await manager.findOne(Company, { where: { uid: cuid } })
            if (!found) {
                reject("ERR_COMPANY_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                const persprofiles = await manager.findByIds(Persprofile, profiles)
                // delete profils fron company
                for (let i = 0; i < persprofiles.length; i++) {
                    const index = profiles.indexOf(persprofiles[i])
                    if (index > -1) {
                        profiles.splice(index, 1)
                    }
                }
                found.profiles = profiles
                const result = await manager.save(Company, found)
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteCompany = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = options.uid
            switch(uid){
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(Company, { uid: Not(uid) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(Company, { where: { uid: uid } })
                    if (!found) {
                        reject("ERR_COMPANY_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true && found.owner != chkperm.useruid)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(Company, { uid: uid })
                        resolve(result)
                    }
                    break
            }/*
            const found = await manager.findOne(Company, { where: { uid: options.uid } })
            if (!found) {
                reject("ERR_COMPANY_NOT_FOUND")
            } else {
                if (!chkperm.checked === true && found.owner != chkperm.useruid)
                    reject("PERMISSION_DENIED")
                const result = await manager.delete(Company, { uid: options.uid })
                resolve(result)
            }*/
        } catch (error) {
            reject(error)
        }
    })
}


const insertRegion = (region: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newregion: any = new Region()
            // SANITIZE
            //newregion.id = region.id ? region.id : reject("NO_ID_IN_NEW_REGION")
            newregion.name = region.name ? sanitize(region.name) : ''
            newregion.translation = region.translation ? sanitize(region.translation) : ''
            newregion.flag = region.flag ? region.flag : 0
            newregion.wikiDataId = region.wikiDataId ? sanitize(region.wikiDataId) : ''
            const result = await manager.insert(Region, newregion)
            const sync = await manager.findOne(Region, { where: { id: newregion.id } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getRegion = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters: any = await fromFilterToObject(options, manager, 'regions')
            const result = await manager.find(Region, { where: filters, order: { name: 'DESC' },limit:1000,offset:0 })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateRegion = (region: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = region.id
            let found = await manager.findOne(Region, { where: { id: id } })
            found = await found
            if (!found) {
                reject("ERR_REGION_NOT_FOUND")
            } else {
                const keys = Object.keys(found)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in message
                    if (region[key]) {
                        // SANITIZE
                        if (typeof region[key] === 'string')
                            found[key] = sanitize(region[key])
                        else {
                            found[key] = region[key]
                        }
                    }
                }
                const result = await manager.update(Region, { id: id }, found)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteRegion = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = options.id
            switch (options.uid) {
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(Region, { id: Not(id) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(Region, { where: { id: id } })
                    if (!found) {
                        reject("ERR_REGION_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(Region, { id: id })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}

const insertSubregion = (subregion: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newsubregion: any = new Subregion()
            // SANITIZE
            //newsubregion.id = subregion.id ? subregion.id : reject("NO_ID_IN_NEW_SUBREGION")
            newsubregion.name = subregion.name ? sanitize(subregion.name) : ''
            newsubregion.translation = subregion.translation ? sanitize(subregion.translation) : ''
            newsubregion.flag = subregion.flag ? subregion.flag : 0
            newsubregion.wikiDataId = subregion.wikiDataId ? sanitize(subregion.wikiDataId) : ''
            newsubregion.region_id = subregion.region_id ? subregion.region_id : 0
            const result = await manager.insert(Subregion, newsubregion)
            const sync = await manager.findOne(Subregion, { where: { id: newsubregion.id } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getSubregion = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters: any = await fromFilterToObject(options, manager, 'subregions')
            const result = await manager.find(Subregion, { where: filters, order: { name: 'DESC' },limit: 1000, offset: 0 })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateSubregion = (subregion: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = subregion.id
            let found = await manager.findOne(Subregion, { where: { id: id } })
            found = await found
            if (!found) {
                reject("ERR_SUBREGION_NOT_FOUND")
            } else {
                const keys = Object.keys(found)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in message
                    if (subregion[key]) {
                        // SANITIZE
                        if (typeof subregion[key] === 'string')
                            found[key] = sanitize(subregion[key])
                        else {
                            found[key] = subregion[key]
                        }
                    }
                }
                const result = await manager.update(Subregion, { id: id }, found)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteSubregion = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = options.id
            switch (options.uid) {
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(Subregion, { id: Not(id) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(Subregion, { where: { id: id } })
                    if (!found) {
                        reject("ERR_SUBREGION_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(Subregion, { id: id })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}

const insertCountry = (country: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newcountry: any = new Country()
            // SANITIZE
            //newcountry.id = country.id ? country.id : reject("NO_ID_IN_NEW_COUNTRY")
            newcountry.name = country.name ? sanitize(country.name) : ''
            newcountry.iso3 = country.iso3 ? sanitize(country.iso3) : ''
            newcountry.numeric_code = country.numeric_code ? sanitize(country.numeric_code) : ''
            newcountry.iso2 = country.iso2 ? sanitize(country.iso2) : ''
            newcountry.phonecode = country.phonecode ? sanitize(country.phonecode) : ''
            newcountry.capital = country.capital ? sanitize(country.capital) : ''
            newcountry.currency = country.currency ? sanitize(country.currency) : ''
            newcountry.currency_name = country.currency_name ? sanitize(country.currency_name) : ''
            newcountry.currency_symbol = country.currency_symbol ? sanitize(country.currency_symbol) : ''
            newcountry.tld = country.tld ? sanitize(country.tld) : ''
            newcountry.region = country.region ? sanitize(country.region) : ''
            newcountry.subregion = country.subregion ? sanitize(country.subregion) : ''
            newcountry.nationality = country.nationality ? sanitize(country.nationality) : ''
            newcountry.timezones = country.timezones ? sanitize(country.timezones) : ''
            newcountry.translation = country.translation ? sanitize(country.translation) : ''
            newcountry.latitude = country.latitude ? country.latitude : 0.0
            newcountry.longitude = country.longitude ? country.longitude : 0.0
            newcountry.emoji = country.emoji ? sanitize(country.emoji) : ''
            newcountry.emojiU = country.emojiU ? sanitize(country.emojiU) : ''
            newcountry.flag = country.flag ? country.flag: 0
            newcountry.wikiDataId = country.wikiDataId ? sanitize(country.wikiDataId) : ''
            newcountry.region_id = country.region_id ? country.region_id : 0
            newcountry.subregion_id = country.subregion_id ? country.subregion_id : 0
            const result = await manager.insert(Country, newcountry)
            const sync = await manager.findOne(Country, { where: { id: newcountry.id } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getCountry = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters: any = await fromFilterToObject(options, manager, 'countries')
            const result = await manager.find(Country, { where: filters, order: { name: 'DESC' }, limit: 1000, offset: 0 })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateCountry = (country: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = country.id
            let found = await manager.findOne(Country, { where: { id: id } })
            found = await found
            if (!found) {
                reject("ERR_COUNTRY_NOT_FOUND")
            } else {
                const keys = Object.keys(found)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in message
                    if (country[key]) {
                        // SANITIZE
                        if (typeof country[key] === 'string')
                            found[key] = sanitize(country[key])
                        else {
                            found[key] = country[key]
                        }
                    }
                }
                const result = await manager.update(Country, { id: id }, found)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteCountry = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = options.id
            switch (options.uid) {
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(Country, { id: Not(id) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(Country, { where: { id: id } })
                    if (!found) {
                        reject("ERR_COUNTRY_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(Country, { id: id })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}

const insertState = (state: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newstate: any = new State()
            // SANITIZE
            //newcountry.id = country.id ? country.id : reject("NO_ID_IN_NEW_COUNTRY")
            newstate.name = state.name ? sanitize(state.name) : ''
            newstate.fps_code = state.fps_code ? sanitize(state.fps_code) : ''
            newstate.iso2 = state.iso2 ? sanitize(state.iso2) : ''
            newstate.type = state.type ? sanitize(state.type) : ''
            newstate.wikiDataId = state.wikiDataId ? sanitize(state.wikiDataId) : ''
            newstate.country_code = state.country_code ? sanitize(state.country_code) : ''
            newstate.latitude = state.latitude ? state.latitude : 0.0
            newstate.longitude = state.longitude ? state.longitude : 0.0
            newstate.flag = state.flag ? state.flag : 0
            newstate.country_id = state.country_id ? state.country_id : 0
            const result = await manager.insert(State, newstate)
            const sync = await manager.findOne(State, { where: { id: newstate.id } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getState = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters: any = await fromFilterToObject(options, manager, 'states')
            const result = await manager.find(State, { where: filters, order: { name: 'DESC' }, limit: 2000, offset: 0 })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateState = (state: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = state.id
            let found = await manager.findOne(State, { where: { id: id } })
            found = await found
            if (!found) {
                reject("ERR_STATE_NOT_FOUND")
            } else {
                const keys = Object.keys(found)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in message
                    if (state[key]) {
                        // SANITIZE
                        if (typeof state[key] === 'string')
                            found[key] = sanitize(state[key])
                        else {
                            found[key] = state[key]
                        }
                    }
                }
                const result = await manager.update(State, { id: id }, found)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteState = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = options.id
            switch (options.uid) {
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(State, { id: Not(id) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(State, { where: { id: id } })
                    if (!found) {
                        reject("ERR_STATE_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(State, { id: id })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}

const insertCity = (city: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newcity: any = new City()
            // SANITIZE
            //newcountry.id = country.id ? country.id : reject("NO_ID_IN_NEW_COUNTRY")
            newcity.name = city.name ? sanitize(city.name) : ''
            newcity.state_code = city.state_code ? sanitize(city.state_code) : ''
            newcity.country_code = city.country_code ? sanitize(city.country_code) : ''
            newcity.wikiDataId = city.wikiDataId ? sanitize(city.wikiDataId) : ''
            newcity.latitude = city.latitude ? city.latitude : 0.0
            newcity.longitude = city.longitude ? city.longitude : 0.0
            newcity.flag = city.flag ? city.flag : 0
            newcity.country_id = city.country_id ? city.country_id : 0
            newcity.state_id = city.state_id ? city.state_id : 0
            const result = await manager.insert(City, newcity)
            const sync = await manager.findOne(City, { where: { id: newcity.id } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getCity = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters: any = await fromFilterToObject(options, manager, 'cities')
            const result = await manager.find(City, { where: filters, order: { name: 'DESC' }, limit: 2000, offset: 0 })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateCity = (city: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = city.id
            let found = await manager.findOne(City, { where: { id: id } })
            found = await found
            if (!found) {
                reject("ERR_CITY_NOT_FOUND")
            } else {
                const keys = Object.keys(found)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in message
                    if (city[key]) {
                        // SANITIZE
                        if (typeof city[key] === 'string')
                            found[key] = sanitize(city[key])
                        else {
                            found[key] = city[key]
                        }
                    }
                }
                const result = await manager.update(City, { id: id }, found)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteCity = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = options.id
            switch (options.uid) {
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(City, { id: Not(id) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(City, { where: { id: id } })
                    if (!found) {
                        reject("ERR_STATE_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(City, { id: id })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}



const insertNewTrans = (_new: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newnew: any = new NewTrans()
            // SANITIZE
            newnew.uid = _new.uid ? _new.uid : uuidv4()
            newnew.title = _new.title ? sanitize(_new.title) : ''
            newnew.subtitle = _new.subtitle ? sanitize(_new.subtitle) : ''
            newnew.text = _new.text ? sanitize(_new.text) : ''
            newnew.language = _new.language
            newnew.author = _new.author
            newnew.origin = _new.origin
            const result = await manager.insert(NewTrans, newnew)
            const sync = await manager.findOne(NewTrans, { where: { uid: newnew.uid } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getNewTrans = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters: any = await fromFilterToObject(options, manager, 'newtrans')
            const result = await manager.find(NewTrans, { where: filters, order: { published: 'DESC' } })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateNewTrans = (newnew: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = newnew.uid
            const found = await manager.findOne(NewTrans, { where: { uid: uid } })
            if (!found) {
                reject("ERR_NEWTRANS_NOT_FOUND")
            } else {
                const keys = Object.keys(newnew)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in new
                    if (found[key]) {
                        // SANITIZE
                        if (typeof newnew[key] === 'string')
                            found[key] = sanitize(newnew[key])
                        else
                            found[key] = newnew[key]
                    }
                }
                const result = await manager.update(NewTrans, { uid: newnew.uid }, newnew)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteNewTrans = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = options.uid
            switch (uid) {
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(NewTrans, { uid: Not(uid) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(NewTrans, { where: { uid: uid } })
                    if (!found) {
                        reject("ERR_NEW_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(NewTrans, { uid: uid })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}

const insertEventTrans = (_new: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newevent: any = new EventTrans()
            // SANITIZE
            newevent.uid = _new.uid ? _new.uid : uuidv4()
            newevent.title = _new.title ? sanitize(_new.title) : ''
            newevent.description = _new.description ? sanitize(_new.description) : ''
            newevent.language = _new.language
            newevent.author = _new.author
            newevent.origin = _new.origin
            const result = await manager.insert(EventTrans, newevent)
            const sync = await manager.findOne(EventTrans, { where: { uid: newevent.uid } })
            resolve(sync)
        } catch (error) {
            reject(error)
        }
    })
}

const getEventTrans = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filters: any = await fromFilterToObject(options, manager, 'eventtrans')
            const result = await manager.find(EventTrans, { where: filters, order: { published: 'DESC' } })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

const updateEventTrans = (newevent: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = newevent.uid
            const found = await manager.findOne(EventTrans, { where: { uid: uid } })
            if (!found) {
                reject("ERR_NEWTRANS_NOT_FOUND")
            } else {
                const keys = Object.keys(newevent)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // if key is in new
                    if (found[key]) {
                        // SANITIZE
                        if (typeof newevent[key] === 'string')
                            found[key] = sanitize(newevent[key])
                        else
                            found[key] = newevent[key]
                    }
                }
                const result = await manager.update(EventTrans, { uid: newevent.uid }, newevent)
                const sync = await result
                resolve(sync)
            }
        } catch (error) {
            reject(error)
        }
    })
}

const deleteEventTrans = (options: any, chkperm: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let uid = options.uid
            switch (uid) {
                case 'all':
                    if (!chkperm.checked === true)
                        reject("PERMISSION_DENIED")
                    const result = await manager.delete(EventTrans, { uid: Not(uid) })
                    resolve(result)
                    break
                default:
                    const found = await manager.findOne(EventTrans, { where: { uid: uid } })
                    if (!found) {
                        reject("ERR_NEW_NOT_FOUND")
                    } else {
                        if (!chkperm.checked === true)
                            reject("PERMISSION_DENIED")
                        const result = await manager.delete(EventTrans, { uid: uid })
                        resolve(result)
                    }
                    break
            }
        } catch (error) {
            reject(error)
        }
    })
}



const tormdata =
{
    init,
    insertGroup,
    insertProfile,
    insertEvent,
    insertNew,
    getEvent,
    getGroup,
    getNew,
    getPersprofile,
    getProfprofile,
    updateProfile,
    updateGroup,
    updateNew,
    updateEvent,
    deleteEvent,
    deleteNew,
    deleteGroup,
    deleteProfile,
    insertMessage,
    updateMessage,
    getMessage,
    deleteMessage,
    sendMessage,
    addProfilesToGroup,
    getProfilesByGroup,
    getGroupsByProfile,
    deleteProfilesFromGroup,
    addProfilesToNew,
    addGroupsToNew,
    addGroupsToEvent,
    getNewsByProfile,
    getNewsByGroup,
    getEventsByGroup,
    deleteNewFromProfile,
    deleteNewFromGroup,
    deleteEventFromGroup,
    addProfilesToEvent,
    getEventsByProfile,
    deleteEventFromProfile,
    deepConvert,
    backupDb,
    restoreDb,
    checkNullOwner,
    insertCompany,
    updateCompany,
    getCompany,
    addProfilesToCompany,
    getProfilesByCompany,
    getCompaniesByProfile,
    deleteProfilesFromCompany,
    deleteCompany,
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
}

export default tormdata