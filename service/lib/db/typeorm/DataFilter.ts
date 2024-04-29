import {
    Not,
    MoreThan,
    MoreThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Equal,
    Like,
    In
} from "typeorm"

export const fromFilterToObject = async (filter: any, manager:any, table:string) => {
    const fakeprofkeys = await manager.connection.entityMetadatas.find((x: any) => x.tableName === table)
    //console.log(fakeprofkeys)
    let ret: any = {}
    for (let i = 0; i < filter.length; i++) {
        let f = filter[i]
        let keys = Object.keys(f)
        // CHECK if keys[0] is a valid column name
        let fakeprofkey = fakeprofkeys.propertiesMap[keys[0]]
        if (fakeprofkey) {
            switch (f.type) {
                case 'gt':
                    ret[keys[0]] = MoreThan(f[keys[0]])
                    break
                case 'gte':
                    ret[keys[0]] = MoreThanOrEqual(f[keys[0]])
                    break
                case 'lt':
                    ret[keys[0]] = LessThan(f[keys[0]])
                    break
                case 'lte':
                    ret[keys[0]] = LessThanOrEqual(f[keys[0]])
                    break
                case 'eq':
                    ret[keys[0]] = Equal(f[keys[0]])
                    break
                case 'neq':
                    ret[keys[0]] = Not(f[keys[0]])
                    break
                case 'in':
                    ret[keys[0]] = In(f[keys[0]])
                    break
                case 'like':
                    const value = "%" + f[keys[0]] + "%"
                    ret[keys[0]] = Like(value)
                    break
                default:
                    break
            }
        }
    }
    return ret
}
