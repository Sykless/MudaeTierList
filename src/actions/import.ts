import type { CharacterProperties } from "../components/Character"
import type { TierlistProperties } from "../utils/Context"

// Character import feature
export function importMudaeCharacters(tierlist: TierlistProperties, importedCharacters: CharacterProperties[]): TierlistProperties
{
    // Map all already present characters' names to asociated characters
    const allCharacters = new Map([
        ...tierlist.tiers.flatMap(tier => tier.characters),
        ...tierlist.pool
    ].map(character => [character.name, character]))

    // Map all imported characters' names to asociated characters
    const importedCharactersMap = new Map(
        importedCharacters.map(character => [character.name, character])
    )

    // Retrieve all new characters in imported data
    const newCharacters = importedCharacters.filter(character => 
        !allCharacters.has(character.name)
    )

    return(
    {
        // Add new imported characters at the bottom of the pool
        pool: [...tierlist.pool.map(character =>
            {
                // Update already present characters image from imported data
                return importedCharactersMap.has(character.name)
                    ? { ...character, image: importedCharactersMap.get(character.name)!.image }
                    : character
            }), ...newCharacters
        ],

        // Iterate on each tier character and compare with imported characters
        tiers: tierlist.tiers.map((tier) => {
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
}