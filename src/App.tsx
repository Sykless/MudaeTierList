import type { CharacterProperties } from "./components/Character"
import type { TierProperties } from "./components/Tier"
import Pool from "./components/Pool"
import Panel from "./components/Panel"
import Tierlist from "./components/Tierlist"
import PreviewDragCharacter from "./preview/PreviewDragCharacter"
import PreviewSwapCharacter from "./preview/PreviewSwapCharacter"
import { CHARACTER, TIER, POOL, POOL_ID, findCharacterIndex, findDroppable, getTargetTierId,  simulateCharacterSwap, ScrollRemeasurer  } from "./Utils"

import { useState } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import { DndContext, pointerWithin } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"

const TIERS = [
    {"label": "S", "color": "#ff595e"},
    {"label": "A", "color": "#ff924c"},
    {"label": "B", "color": "#ffca3a"},
    {"label": "C", "color": "#c5ca30"},
    {"label": "D", "color": "#8ac926"},
    {"label": "E", "color": "#52b788"},
    {"label": "F", "color": "#1982c4"},
    {"label": "G", "color": "#4267ac"},
    {"label": "H", "color": "#6a4c93"},
    {"label": "I", "color": "#b5179e"}
]

function App()
{
    // Keep track of pool for collision algorithm
    const [pool, updatePool] = useState<CharacterProperties[]>([])

    // Assign each tier label to a Tier object, id going from 0 to 9
    const [tiers, updateTiers] = useState<TierProperties[]>(
        TIERS.map(({label, color}, index) => ({
            id: index,
            label: label,
            color: color,
            characters: [] as CharacterProperties[]
        }))
    )

    // Character import feature
    function handleImportCharacters(importedCharacters: CharacterProperties[]) {
        updatePool(prev => {
            const existingNames = new Set(prev.map(c => c.name))
            const filtered = importedCharacters.filter(c => !existingNames.has(c.name))
            return [...prev, ...filtered]
        })
    }

    // Called after a character is dropped
    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event
        if (!over) return

        // Retrieve dragged character
        const draggedCharacter = active.data.current?.character as CharacterProperties;
        const characterName = draggedCharacter?.name

        // Retrieve origin tier
        const originTierId = draggedCharacter?.tierId
        const originCharacterList = originTierId == POOL_ID ? pool
            : tiers.find((tier) => tier.id == originTierId)?.characters

        // Retrieve target tier
        const targetTierId = getTargetTierId(over)
        const targetCharacterList = targetTierId == POOL_ID ? pool
            : tiers.find((tier) => tier.id == targetTierId)?.characters

        // No character, origin or target tier found, do nothing
        if (!draggedCharacter || originCharacterList == undefined || targetCharacterList == undefined)
            return

        // Find character indexes in their respective character lists
        const oldIndex = findCharacterIndex(originCharacterList, characterName)
        const newIndex = over.data.current?.type == CHARACTER
            ? findCharacterIndex(targetCharacterList, over.data.current.character.name)
            : targetCharacterList.length

        // Create a copy character for target tier
        const targetCharacter = {...draggedCharacter, tierId: targetTierId}

        updatePool((prev) => 
        {
            // Character moved from pool to tier
            if (originTierId == POOL_ID && targetTierId != POOL_ID) {
                return prev.filter((character) => character.name !== characterName)
            }

            // Character moved from tier to pool
            if (originTierId != POOL_ID && targetTierId == POOL_ID) {
                return prev.some((character) => character.name === characterName)
                    ? prev
                    : [...prev.slice(0, newIndex), targetCharacter, ...prev.slice(newIndex)]
            }

            // Character moved from pool to pool (reorder)
            if (originTierId == POOL_ID && targetTierId == POOL_ID) {
                return arrayMove(prev, oldIndex, newIndex)
            }

            // Default : return original state
            return prev;
        })

        updateTiers((prev) =>
        {
            // Character moved from pool to tier
            if (originTierId == POOL_ID && targetTierId != POOL_ID) {
                return prev.map((tier) =>
                    tier.id === targetTierId
                        ? { ...tier, characters:
                            [...tier.characters.slice(0, newIndex), targetCharacter, ...tier.characters.slice(newIndex)] }
                        : tier
                )
            }

            // Character moved from tier to pool/another tier
            if (originTierId != POOL_ID)
            {
                // Update source and target tiers
                return prev.map((tier) =>
                {
                    // Character moved within the same tier (reorder)
                    if (tier.id === originTierId && originTierId === targetTierId) {
                        return {...tier, characters:
                            arrayMove(tier.characters, oldIndex, newIndex)
                        }
                    }
                    // Character moved from a tier to another
                    else
                    {
                        // Remove character from source tier
                        if (tier.id === originTierId) {
                            return {...tier,
                                characters: tier.characters.filter(
                                    (character) => character.name !== characterName)
                            }
                        }

                        // Add character to target tier
                        if (tier.id === targetTierId) {
                            return {...tier, characters:
                                [...tier.characters.slice(0, newIndex), targetCharacter, ...tier.characters.slice(newIndex)]
                            }
                        }
                    }

                    // Default : keep tier as is
                    return tier;
                })
            }

            // Default : return original state
            return prev;
        })
    }

    // Render app 
    return (
        <DndContext
            autoScroll = {false}
            onDragEnd = {handleDragEnd}
            collisionDetection = {(args) => {
                const collisions = pointerWithin(args) // Default behavior : pointer within
                const droppableCharacter = findDroppable(collisions, CHARACTER)
                const droppablePool = findDroppable(collisions, POOL)
                const droppableTier = findDroppable(collisions, TIER)

                // Drop priority : pool character -> pool -> tier character -> tier
                if (droppableCharacter[0]?.data?.droppableContainer?.data.current.character.tierId == POOL_ID) {
                    return droppableCharacter;
                }
                else if (droppablePool.length) return simulateCharacterSwap(droppablePool, args);
                else if (droppableCharacter.length) return droppableCharacter;
                else if (droppableTier.length) return simulateCharacterSwap(droppableTier, args)
                else return collisions; 
            }}>

            <ScrollRemeasurer />
            <PreviewDragCharacter />
            <PreviewSwapCharacter />
            <Panel onImport = {handleImportCharacters} />
            <Tierlist tiers = {tiers} />
            <Pool characters = {pool} />
        </DndContext>
    )
}

export default App