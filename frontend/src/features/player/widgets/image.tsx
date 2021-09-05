export function ImagePlayerWidget({
    url,
    name,
}: {
    url: string
    name: string
}): JSX.Element {
    return (
        <div className="w-100 text-center">
            <img src={url} alt={name} />
        </div>
    )
}
