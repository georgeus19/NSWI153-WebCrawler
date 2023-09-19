export function fromNumber(value: number): string {
    const days = Math.floor(value / 86_400_000);
    const hours = Math.floor((value % 86_400_000) / 3_600_000);
    const minutes = Math.floor(((value % 86_400_000) % 3_600_000) / 60_000);
    return `${days}-${hours}-${minutes}`;
}

export function toNumber(value: string): number {
    const a = value.split('-');
    const daysPart = Number(a[0]) * 86_400_000;
    const hoursPart = Number(a[1]) * 3_600_000;
    const minutesPart = Number(a[2]) * 60_000;
    return daysPart + hoursPart + minutesPart;
}
