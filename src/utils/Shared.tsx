
import { type Collision, type Over } from "@dnd-kit/core"
import type { CharacterProperties } from "../components/Character"

export const CHARACTERS_PER_LINE_TIER = 15
export const CHARACTERS_PER_LINE_POOL = 20
export const CHARACTER_HEIGHT = 112
export const CHARACTER_WIDTH = 72
export const POOL_HEADER_HEIGHT = 32
export const POOL_ID = -1

export const CHARACTER = "character"
export const TIER = "tier"
export const POOL = "pool"

const PROXY_URL = "https://super-field-ca48.rakouett-du-56.workers.dev/?url="

export function proxifyImageUrl(originalUrl: string) {
    return PROXY_URL + originalUrl;
}

export function findDroppable(collisionList: Collision[], droppableType: string) {
    return collisionList.filter(droppable => 
            droppable.data?.droppableContainer?.data.current.type == droppableType)
}

export function findCharacterIndex(characterList: CharacterProperties[], characterName: string) {
    return characterList.findIndex(character => character.name === characterName)
            ?? characterList.length - 1
}

export function getTargetTierId(over: Over) {
    return over.data.current?.type == CHARACTER
        ? over.data.current.character.tierId
        : over.id
}