import type { CharacterProperties } from "./components/Character"
import type { TierProperties } from "./components/Tier"
import Pool from "./components/Pool"
import Panel from "./components/Panel"
import Tierlist from "./components/Tierlist"
import PreviewDragCharacter from "./preview/PreviewDragCharacter"
import PreviewSwapCharacter from "./preview/PreviewSwapCharacter"
import { CHARACTER, TIER, POOL, POOL_ID, findCharacterIndex, findDroppable, getTargetTierId, TIER_COLORS, UPWARDS, DOWNWARDS, TierContext } from "./utils/Shared"
import { isInRect, ScrollRemeasurer, simulateCharacterSwap } from "./utils/Droppable"

import { useRef, useState } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import { DndContext, pointerWithin } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { Toaster } from "react-hot-toast";

const TIER_LABELS = ["S","A","B","C","D","E","F","G","H","I"]

function App()
{
    // Initialize empty pool
    const [pool, updatePool] = useState<CharacterProperties[]>([])
    const poolContentRef = useRef<HTMLDivElement | null>(null)

    // Assign each tier label to a Tier object, id going from 0 to 9
    const [tiers, updateTiers] = useState<TierProperties[]>(
        TIER_LABELS.map((label, index) => ({
            id: index,
            label: label,
            color: TIER_COLORS[index],
            characters: [] as CharacterProperties[]
        }))
    )

    
    
    /*
    *   TIER UPDATE METHODS
    */

    // Update target tier with provided attributes
    function updateTier(tierId: number, attributes: {label? : string; color?: string}) {
        updateTiers(prev =>
            prev.map(tier =>
                tier.id === tierId
                    ? { ...tier, ...attributes }
                    : tier
            ))
    }
    
    // Insert tier below target tier with same color/label
    function insertTier(tierId: number) {
        updateTiers(prev => {
            const tierPosition = prev.findIndex(tier => tier.id === tierId)
            const newTierId = Math.max(...prev.map(tier => tier.id)) + 1

            // Insert new tier in tierlist
            return [
                ...prev.slice(0, tierPosition + 1),
                {
                    id: newTierId,
                    color: prev[tierPosition].color,
                    label: prev[tierPosition].label,
                    characters: []
                },
                ...prev.slice(tierPosition + 1)]
        })
    }

    // Remove one tier and move its characters to pool
    function deleteTier(tierId: number) {
        const removedTier = tiers.find(tier => tier.id == tierId);
        
        // Put all characters from removed tier in the pool
        if (removedTier && removedTier.characters.length) {
            updatePool(prev => [...prev, ...removedTier.characters])
        }
        
        // Return new tierlist without target tier
        updateTiers(prev => {
            return prev.filter(tier => tier.id != tierId);
        })
    }

    // Move a tier one position upwards or downwards
    function moveTier(tierId: number, direction: number) {
        updateTiers(prev => {
            const tierPosition = prev.findIndex(tier => tier.id === tierId)

            // Moving downwards : swap with tier position + 1
            if (direction == DOWNWARDS) {
                return tierPosition == prev.length - 1 ? prev : arrayMove(prev, tierPosition, tierPosition + 1)
            }
            
            // Moving upwards : swap with tier position - 1
            if (direction == UPWARDS) {
                return tierPosition == 0 ? prev : arrayMove(prev, tierPosition, tierPosition - 1)
            }
            
            // No direction provided : keep tierlist as is
            return prev;
        })
    }



    /*
    *   IMPORT METHODS
    */

    // Character import feature
    function importMudaeCharacters(importedCharacters: CharacterProperties[])
    {
        // Map all already present characters' names to asociated characters
        const allCharacters = new Map([
            ...tiers.flatMap(tier => tier.characters),
            ...pool
        ].map(character => [character.name, character]))

        // Map all imported characters' names to asociated characters
        const importedCharactersMap = new Map(
            importedCharacters.map(character => [character.name, character])
        )

        // Retrieve all new characters in imported data
        const newCharacters = importedCharacters.filter(character => 
            !allCharacters.has(character.name)
        )

        updateTiers(prev =>
        {
            // Iterate on each tier character and compare with imported characters
            return prev.map((tier) => {
                const updatedCharacter = tier.characters.map(character =>
                {
                    // Update already present characters image from imported data
                    return importedCharactersMap.has(character.name)
                        ? { ...character, image: importedCharactersMap.get(character.name)!.image }
                        : character
                })

                return {...tier, characters: updatedCharacter}
            })
        })

        updatePool(prev => {
            const updatedPool = prev.map(character =>
            {
                // Update already present characters image from imported data
                return importedCharactersMap.has(character.name)
                    ? { ...character, image: importedCharactersMap.get(character.name)!.image }
                    : character
            })

            // Add new imported characters at the bottom of the pool
            return [...updatedPool, ...newCharacters]
        })
    }

    // Backup import feature
    function importBackupTierlist(tiers: TierProperties[], pool: CharacterProperties[]) {
        updateTiers(tiers)
        updatePool(pool)
    }



    /*
    *   CHARACTER DRAG AND DROP METHOD
    */

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
                const { pointerCoordinates } = args;
                const collisions = pointerWithin(args) 
                const droppableCharacter = findDroppable(collisions, CHARACTER)
                const droppablePool = findDroppable(collisions, POOL)
                const droppableTier = findDroppable(collisions, TIER)
                const targetCharacterTierId = droppableCharacter[0]?.data?.droppableContainer?.data.current.character.tierId;

                // Cursor in pool, drop priority : pool character -> pool
                if (isInRect(pointerCoordinates, poolContentRef?.current?.getBoundingClientRect())){
                    if (targetCharacterTierId == POOL_ID)
                        return droppableCharacter;
                    else if (droppablePool.length)
                        return simulateCharacterSwap(droppablePool, args);
                }
                // Cursor not in pool, drop priority : tier character -> tier
                else if (targetCharacterTierId > POOL_ID) return droppableCharacter;
                else if (droppableTier.length) return simulateCharacterSwap(droppableTier, args);
                
                // None of the controlled cases : return no droppable found
                return [];
            }}>

            {/* Helpers */}
            <PreviewDragCharacter />
            <PreviewSwapCharacter />
            <ScrollRemeasurer />
            <Toaster toastOptions = {{style: {
                background: "#1e1e1e",
                color: "#9D9D9D",
            }}} />

            {/* Actual displayed components */}
            <Panel tiers = {tiers} pool = {pool} mudaeImport = {importMudaeCharacters} backupImport = {importBackupTierlist} />
            <TierContext.Provider value = {{ updateTier, insertTier, deleteTier, moveTier }}>
                <Tierlist tiers = {tiers} />
            </TierContext.Provider>
            <Pool characters = {pool} poolContentRef = {poolContentRef} numberOfCharacters = {
                tiers.reduce((sum, tier) => sum + tier.characters.length, 0) + pool.length
            } />
        </DndContext>
    )
}

export default App