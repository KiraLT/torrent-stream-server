import * as timeago from 'timeago.js'

export function formatDate(date: Date): string {
    timeago.register(
        'short',
        (_, index) =>
            [
                ['now', 'right now'],
                ['%ss ago', 'in %s seconds'],
                ['1min ago', 'in 1 minute'],
                ['%smin ago', 'in %s minutes'],
                ['1h ago', 'in 1 hour'],
                ['%sh ago', 'in %s hours'],
                ['1d ago', 'in 1 day'],
                ['%sd ago', 'in %s days'],
                ['1w ago', 'in 1 week'],
                ['%sw ago', 'in %s weeks'],
                ['1m ago', 'in 1 month'],
                ['%sm ago', 'in %s months'],
                ['1y ago', 'in 1 year'],
                ['%sy ago', 'in %s years'],
            ][index] as [string, string]
    )

    return timeago.format(date, 'short')
}
