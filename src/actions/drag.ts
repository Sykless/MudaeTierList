import { CHARACTER, POOL_ID, findCharacterIndex, getTargetTierId } from "../utils/Shared";
import type { TierlistProperties } from "../context/TierlistContext"
import type { CharacterProperties } from "../components/Character";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

// Update pool and tiers when a dragged charater is dropped
export function dragCharacter(tierlist: TierlistProperties, event: DragEndEvent): TierlistProperties
{
    // Dropped on invalid target : keep same tierlist state
    const {active, over} = event
    if (!over) return tierlist

    // Retrieve dragged character
    const draggedCharacter = active.data.current?.character as CharacterProperties;
    const characterName = draggedCharacter?.name

    // Retrieve origin tier
    const originTierId = draggedCharacter?.tierId
    const originCharacterList = originTierId == POOL_ID ? tierlist.pool
        : tierlist.tiers.find((tier) => tier.id == originTierId)?.characters

    // Retrieve target tier
    const targetTierId = getTargetTierId(over)
    const targetCharacterList = targetTierId == POOL_ID ? tierlist.pool
        : tierlist.tiers.find((tier) => tier.id == targetTierId)?.characters

    // No character, origin or target tier found, keep same tierlist state
    if (!draggedCharacter || originCharacterList == undefined || targetCharacterList == undefined)
        return tierlist

    // Find character indexes in their respective character lists
    const oldIndex = findCharacterIndex(originCharacterList, characterName)
    const newIndex = over.data.current?.type == CHARACTER
        ? findCharacterIndex(targetCharacterList, over.data.current.character.name)
        : targetCharacterList.length

    // Create a copy character for target tier
    const targetCharacter = {...draggedCharacter, tierId: targetTierId}


    /*
    /* POOL MANAGEMENT
    */

    // Default : keep old pool state
    let updatedPool = tierlist.pool;

    // Character moved from pool to tier
    if (originTierId == POOL_ID && targetTierId != POOL_ID) {
        updatedPool = tierlist.pool.filter((character) => character.name !== characterName)
    }

    // Character moved from tier to pool
    if (originTierId != POOL_ID && targetTierId == POOL_ID) {
        updatedPool = tierlist.pool.some((character) => character.name === characterName)
            ? tierlist.pool
            : [...tierlist.pool.slice(0, newIndex), targetCharacter, ...tierlist.pool.slice(newIndex)]
    }

    // Character moved from pool to pool (reorder)
    if (originTierId == POOL_ID && targetTierId == POOL_ID) {
        updatedPool = arrayMove(tierlist.pool, oldIndex, newIndex)
    }


    /*
    /* TIERS MANAGEMENT
    */

    // Default : keep old tiers state
    let updatedTiers = tierlist.tiers;

    // Character moved from pool to tier
    if (originTierId == POOL_ID && targetTierId != POOL_ID) {
        updatedTiers = tierlist.tiers.map((tier) =>
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
        updatedTiers = tierlist.tiers.map((tier) =>
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


    // Update tierlist with new state
    return {
        pool: updatedPool,
        tiers: updatedTiers
    }
}