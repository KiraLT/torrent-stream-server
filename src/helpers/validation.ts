import { HttpError, HttpStatusCodes } from 'common-stuff'
import Ajv from 'ajv'

export function validateString(value: unknown, name: string): string {
    if (value == null || !value) {
        throw new HttpError(HttpStatusCodes.BAD_REQUEST, `${name} is required`)
    }

    if (typeof value === 'string') {
        return value
    }

    throw new HttpError(HttpStatusCodes.BAD_REQUEST, `${name} must be string`)
}

export function validateInt(value: unknown, name: string): number {
    if (value == null || !value) {
        throw new HttpError(HttpStatusCodes.BAD_REQUEST, `${name} is required`)
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

    throw new HttpError(HttpStatusCodes.BAD_REQUEST, `${name} must be number`)
}

export function validateSchema<T>(schema: object, data: unknown, options?: { name: string }): T {
    const { name = 'data' } = options || {}
    const ajv = new Ajv({ allErrors: true })
    if (!ajv.validate(schema, data)) {
        throw new HttpError(
            HttpStatusCodes.BAD_REQUEST,
            ajv.errorsText(null, {
                dataVar: name,
            })
        )
    }
    return data as T
}
