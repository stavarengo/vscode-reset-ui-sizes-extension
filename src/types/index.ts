export interface SizeConfig {
    element: string;
    defaultSize: number;
    currentSize: number;
}

export interface ResetOptions {
    resetAll: boolean;
    specificElements?: string[];
}