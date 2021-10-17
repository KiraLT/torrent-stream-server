import { Models } from '../openapi'

export class LogsStorage {
    logs: Models['Log'][] = []
    limit: number

    constructor(options: {
        limit: number
    }) {
        this.limit = options.limit
    }

    add(log: Models['Log']): void {
        this.logs = [
            log,
            ...this.logs.filter(v => v.message !== log.message),
        ].slice(0, this.limit)
    }

    get(): Models['Log'][] {
        return this.logs
    }
}
