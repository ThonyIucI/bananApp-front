export interface IOption {
    value: string
    label: string
    options?: {
        value: string
        label: string
    }[]
}