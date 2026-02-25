import type { Coordinates } from "@dnd-kit/utilities"

export const CHARACTERS_PER_LINE_TIER = 15
export const CHARACTERS_PER_LINE_POOL = 20
export const CHARACTER_HEIGHT = 112
export const CHARACTER_WIDTH = 72
export const POOL_ID = -1

export function proxifyImageUrl(originalUrl: string) {
    return `https://super-field-ca48.rakouett-du-56.workers.dev/?url=${originalUrl}`
}

export function isInRect(coordinates: Coordinates | null, rect: DOMRect | undefined) {
    if (coordinates && rect)
    {
        // Check if mouse pointer is between rect coordinates
        if (coordinates.x >= rect.left && coordinates.x <= rect.right
            && coordinates.y >= rect.top && coordinates.y <= rect.bottom) {
            return true;
        }
    }

    // Default : not in rect
    return false;
}