export interface SubPlotRow {
    id?: string;
    name: string;
    areaHectares: string;
    responsibleUserId: string;
}

export interface PlotFormValues {
    name: string;
    sectorId: string;
    ownerUserId: string;
    workerUserId: string;
    areaHectares: string;
    cadastralCode: string;
    subPlots: SubPlotRow[];
}

export const PLOT_FORM_DEFAULT_VALUES: PlotFormValues = {
    name: '',
    sectorId: '',
    ownerUserId: '',
    workerUserId: '',
    areaHectares: '',
    cadastralCode: '',
    subPlots: [],
};