import type { CharacterProperties } from "./Character"
import type { TierProperties } from "./Tier"
import Pool from "./Pool"
import Import from "./Import"
import Tierlist from "./Tierlist"
import DragCharacterPreview from "./DragCharacterPreview"
import { isInRect, POOL_ID } from "./Utils"

import { useRef, useState } from "react"
import { DndContext, rectIntersection } from "@dnd-kit/core"
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
    const poolRef = useRef<HTMLDivElement | null>(null)

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

    // Called after an image is dropped
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return

        // Retrieve dropped character and tier id
        const characterName = active.id as string
        const targetTierId = over.id as number

        // Check if the character comes from the pool
        const poolCharacter = pool.find((character) => character.name === characterName)
        
        // Check if the character comes from a tier
        const tierCharacter = tiers
            .flatMap(tier => tier.characters)
            .find((character) => character.name === characterName);

        // Make sure character exists
        if (!poolCharacter && !tierCharacter) return
        
        updatePool((prev) => 
        {
            // Character moved from pool to tier
            if (poolCharacter && targetTierId != POOL_ID) {
                return prev.filter((character) => character.name !== characterName)
            }

            // Character moved from tier to pool
            if (tierCharacter && targetTierId == POOL_ID) {
                return prev.some((character) => character.name === characterName)
                    ? prev
                    : [...prev, tierCharacter];
            }

            // Default : return original state
            return prev;
        })

        updateTiers((prev) =>
        {
            // Character moved from pool to tier
            if (poolCharacter && targetTierId != POOL_ID) {
                return prev.map((tier) =>
                    tier.id === targetTierId
                        ? { ...tier, characters: [...tier.characters, poolCharacter] }
                        : tier
                )
            }

            // Character moved from tier to pool/another tier
            if (tierCharacter) {

                // Find source tier
                const sourceTier = prev.find((tier) => tier.characters.some(
                    character => character.name === characterName
                ))

                // Can't find source tier : return original state
                if (!sourceTier)
                    return prev;

                // Update source and target tiers
                return prev.map((tier) =>
                {
                    if (sourceTier.id != targetTierId)
                    {
                        // Remove character from source tier
                        if (tier.id === sourceTier.id) {
                            return {...tier,
                                characters: tier.characters.filter(
                                    (character) => character.name !== characterName)
                            }
                        }

                        // Add character to target tier
                        if (tier.id === targetTierId) {
                            return {...tier,
                                characters: [...tier.characters, tierCharacter]
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
                const { pointerCoordinates } = args;

                // Always drop characters in pool if we're in pool coordinates
                if (isInRect(pointerCoordinates, poolRef?.current?.getBoundingClientRect())) {
                    return [{id: POOL_ID, data: { droppableContainer: { id: POOL_ID }}}]
                }
                // Default behavior : rectIntersection
                else {
                    return rectIntersection(args);
                }
            }}>

            <DragCharacterPreview />
            <Import onImport = {handleImportCharacters} />
            <Tierlist tiers = {tiers} />
            <Pool characters = {pool} poolRef = {poolRef} />
        </DndContext>
    )
}

export default App