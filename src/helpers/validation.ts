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

export function validateInt(value: unknown, name: string): number {
    if (value == null || !value) {
        throw new BadRequest(`${name} is required`)
    }

    const parsed =
        typeof value === 'number'
            ? value
            : typeof value === 'string'
            ? parseFloat(value)
            : undefined

    if (typeof parsed === 'number' && !isNaN(parsed)) {
        return parsed
    }

    throw new BadRequest(`${name} must be number`)
}
