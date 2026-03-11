import type { TierlistProperties } from "../context/TierlistContext"

// Update character image
export function updateCharacterImage(tierlist: TierlistProperties, characterName: string, image: string): TierlistProperties
{
    // Update pool if character is in pool
    const updatedPool = tierlist.pool.map((character) => 
        character.name === characterName
            ? {...character, image: image}
            : character
    )

    // Update tiers if character is in a tier
    const updatedTiers = tierlist.tiers.map((tier) => ({
        ...tier, characters: tier.characters.map((character) => 
            character.name === characterName
                ? {...character, image: image}
                : character)
    }))

    // Update tierlist with new state
    return {
        pool: updatedPool,
        tiers: updatedTiers
    }
}