import { createContext, type Dispatch } from "react";
import type { DragEndEvent } from "@dnd-kit/core"
import type { CharacterProperties } from "../components/Character"
import type { TierProperties } from "../components/Tier";

// Tierlist Context declaration
export const DRAG_CHARACTER = "DRAG_CHARACTER";
export const TIER_UPDATE_ATTRIBUTES = "TIER_UPDATE_ATTRIBUTES";
export const TIER_INSERT = "TIER_INSERT";
export const TIER_DELETE = "TIER_DELETE";
export const TIER_MOVE = "TIER_MOVE";
export const IMPORT_MUDAE = "IMPORT_MUDAE"
export const IMPORT_BACKUP = "IMPORT_BACKUP"
export const HISTORY_UNDO = "HISTORY_UNDO";
export const HISTORY_REDO = "HISTORY_REDO";
export const UPDATE_CHARACTER_IMAGE = "UPDATE_CHARACTER_IMAGE"
export const WIPE_DATA = "WIPE_DATA"

export type TierlistProperties = {
    pool: CharacterProperties[],
    tiers: TierProperties[]
}

export type TierlistHistoryProperties = {
    past: TierlistProperties[],
    present: TierlistProperties,
    future: TierlistProperties[]
}

export type TierlistAction =
    | { type: typeof DRAG_CHARACTER; event: DragEndEvent}
    | { type: typeof TIER_UPDATE_ATTRIBUTES; tierId: number; attributes: {label?: string; color?: string} }
    | { type: typeof TIER_INSERT; tierId: number }
    | { type: typeof TIER_DELETE; tierId: number }
    | { type: typeof TIER_MOVE; tierId: number, direction: number }
    | { type: typeof IMPORT_MUDAE; importedCharacters: CharacterProperties[]}
    | { type: typeof IMPORT_BACKUP; pool: CharacterProperties[], tiers: TierProperties[]}
    | { type: typeof UPDATE_CHARACTER_IMAGE; characterName: string, image: string}
    | { type: typeof WIPE_DATA}

export type HistoryAction =
    | TierlistAction
    | { type: typeof HISTORY_UNDO }
    | { type: typeof HISTORY_REDO };

export type TierlistContextType = {
    tierlist: TierlistHistoryProperties;
    dispatch: Dispatch<HistoryAction>;
}

// Create Tierlist context to let components call dispatch anywhere
export const TierlistContext = createContext<TierlistContextType | null>(null)