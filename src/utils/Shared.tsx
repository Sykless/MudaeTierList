
import { type Collision, type Over } from "@dnd-kit/core"
import type { CharacterProperties } from "../components/Character"
import { createContext } from "react";

export type TierContextType = {
    updateTier: (tierId: number, attributes: {label? : string; color?: string}) => void,
    insertTier: (tierId: number) => void,
    deleteTier: (tierId: number) => void,
    moveTier: (tierId: number, direction: number) => void
}

// Create Tier context to let tiers sub-functions perform updates anywhere
export const TierContext = createContext<TierContextType | null>(null)

export const CHARACTERS_PER_LINE_TIER = 15
export const CHARACTERS_PER_LINE_POOL = 20
export const CHARACTER_HEIGHT = 112
export const CHARACTER_WIDTH = 72
export const POOL_HEADER_HEIGHT = 32

export const IMPORT_HELPER = "IMPORT_HELPER"
export const EXPORT_HELPER = "EXPORT_HELPER"
export const POOL_ID = -1

export const CHARACTER = "character"
export const TIER = "tier"
export const POOL = "pool"

export const UPWARDS = 1
export const DOWNWARDS = -1

export const TIER_COLORS = [
    "#ff595e", // S
    "#ff924c", // A
    "#ffca3a", // B
    "#c5ca30", // C
    "#8ac926", // D
    "#52b788", // E
    "#1982c4", // F
    "#4267ac", // G
    "#6a4c93", // H
    "#b5179e", // I
    "#d9d9d9", // Light Grey
    "#4a4a4a"  // Dark Grey
]

export function proxifyImageUrl(originalUrl: string) {
    return "https://super-field-ca48.rakouett-du-56.workers.dev/?url=" + originalUrl;
}

export function findDroppable(collisionList: Collision[], droppableType: string) {
    return collisionList.filter(droppable => 
            droppable.data?.droppableContainer?.data.current.type == droppableType)
}

export function findCharacterIndex(characterList: CharacterProperties[], characterName: string) {
    return characterList.findIndex(character => character.name === characterName)
            ?? characterList.length - 1
}

export function getTargetTierId(over: Over | null) {
    return over?.data?.current?.type == CHARACTER
        ? over?.data?.current?.character?.tierId
        : over?.id
}