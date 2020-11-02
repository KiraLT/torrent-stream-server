import { State as ConfigState } from './config'

declare module 'reactn/default' {
    export interface State extends ConfigState {}
}
