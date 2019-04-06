import { sign, verify } from 'jsonwebtoken'

export function merge(current: any, update: any): any {
    current = {...current}
    Object.keys(update).forEach(function(key) {
        if (current.hasOwnProperty(key)
          && typeof current[key] === 'object'
          && !(current[key] instanceof Array)) {
            merge(current[key], update[key]);
        } else {
            current[key] = update[key]
        }
    })
    return current
}

export function signJwtToken(data: object | string, key: string): string {
    return sign(data, key)
}

export function verifyJwrRoken<T extends object | string>(token: string, key: string, maxAge: string): T | undefined {
    try {
        return verify(token, key, {
            maxAge
        }) as any
    } catch (error) {
        console.log(error)
        return undefined
    }
}