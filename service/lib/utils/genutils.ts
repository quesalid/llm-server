export const getCurrentDate = (type = 'ISO') => {
    let date
    switch (type) {
        case 'ISO':
            date = new Date(Date.now()).toISOString().split("T")[0];
            break;
        case 'LOCAL':
            const t = new Date(Date.now())
            date = getLocalDate(t).split("T")[0]
            break;
        default:
            date = new Date(Date.now()).toISOString().split("T")[0];
            break;
    }

    return date
};

export const getCurrentDateTime = (type = 'ISO') => {
    let date
    switch (type) {
        case 'ISO':
            date = new Date(Date.now()).toISOString().split(".")[0];
            break;
        case 'LOCAL':
            const t = new Date(Date.now())
            date = getLocalDate(t)
            break;
        default:
            date = new Date(Date.now()).toISOString().split(".")[0];
            break;
    }

    return date
};

export const getCurrentDateArray = (type = 'ISO') => {
    
    let year = 0
    let month = 0
    let day = 0
    let hour = 0
    let minute = 0

    const date = new Date(Date.now())

    year = date.getFullYear()
    month = date.getMonth() + 1
    day = date.getDate()
    hour = date.getHours()
    minute = date.getMinutes()

    const array = [year, month, day, hour, minute]
    return (array)
};

function getLocalDate(t:any) {
    const z = t.getTimezoneOffset() * 60 * 1000
    let tShift = t - z
    const tLocal = new Date(tShift)
    let iso = tLocal.toISOString()
    iso = iso.split(".")[0]

    return (iso)

}
