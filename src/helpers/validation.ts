import { BadRequest } from 'http-errors'

export function validateString(value: unknown, name: string): string {
    if (value == null || !value) {
        throw new BadRequest(`${name} is required`)
    }

    if (typeof value === 'string') {
        return value
    }

    throw new BadRequest(`${name} must be string`)
}
