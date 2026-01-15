export function calculateDefaultSize(baseSize: number, multiplier: number): number {
    return baseSize * multiplier;
}

export function applyReset(elements: HTMLElement[], defaultSize: number): void {
    elements.forEach(element => {
        element.style.width = `${defaultSize}px`;
        element.style.height = `${defaultSize}px`;
    });
}