import checkDiskSpace from 'check-disk-space'
import { BadRequest } from 'http-errors'

const trammel = require('trammel')

export function exists(json: any, key: string) {
    const value = json[key];
    return value !== null && value !== undefined;
}

export function mapValues(data: any, fn: (item: any) => any) {
    return Object.keys(data).reduce(
        (acc, key) => ({ ...acc, [key]: fn(data[key]) }),
        {}
    );
}

export async function getUsedSpace(path: string): Promise<number> {
    return await trammel(path, {type: 'raw'})
}

export function validateString(value: unknown, name: string): string {
    if (value == null || !value) {
        throw new BadRequest(`${name} is required`)
    }

    if (typeof value === 'string') {
        return value
    }

    throw new BadRequest(`${name} must be string`)
}