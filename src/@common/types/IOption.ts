export interface IOption {
    value: string | number
    label: string
    options?: {
        value: string | number
        label: string
    }[]
}