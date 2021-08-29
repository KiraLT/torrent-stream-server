export async function getLatestVersion(packageName: string): Promise<string> {
    const response = await fetch(
        `https://unpkg.com/${packageName}/package.json`
    )

    if (response.ok) {
        const data = await response.json()
        const version = data.version

        if (version) {
            return version
        }
    }

    throw new Error('Failed to fetch version')
}
