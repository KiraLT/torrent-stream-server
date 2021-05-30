import React, { useEffect } from 'react'
import { useGlobal } from 'reactn'
import { toast } from 'react-toastify'

import { getLatestVersion } from '../../helpers'
import { packageName, packageVersion, releasesPage } from '../../config'

export function VersionAlertComponent(): JSX.Element {
    const [latestVersionAlert, setLatestVersionAlert] = useGlobal('latestVersionAlert')

    useEffect(() => {
        getLatestVersion(packageName)
            .then((version) => {
                if (latestVersionAlert !== version && packageVersion !== version) {
                    setLatestVersionAlert(version)

                    toast(`A new ${version} version is available, update now!`, {
                        autoClose: false,
                        type: 'info',
                        onClick: () => {
                            window.open(releasesPage)
                        },
                    })
                }
            })
            .catch()
    }, [latestVersionAlert, setLatestVersionAlert])

    return <></>
}
