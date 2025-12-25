import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import Color from 'color';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const extractFillMap = (svgText: string): Record<string, string> => {
    const map: Record<string, string> = {};
    const styleRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = styleRegex.exec(svgText)) !== null) {
        const className = match[1];
        const body = match[2];
        const fillMatch = body.match(/fill\s*:\s*([^;]+);?/);

        if (fillMatch) {
            try {
                const normalized = Color(fillMatch[1].trim())
                    .hex()
                    .toUpperCase();
                map[className] = normalized;
            } catch {
                // skip invalid colors
            }
        }
    }
    return map;
};

export const generateUUID = (): string => {
    // RFC4122 version 4–like UUID (browser-safe)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const rand = (Math.random() * 16) | 0;
        const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
        return value.toString(16);
    });
};
