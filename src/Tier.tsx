import { useDndContext, useDroppable } from "@dnd-kit/core"
import type { CharacterProperties } from "./Character"
import Character from "./Character"
import TierCharacterPreview from "./TierCharacterPreview"
import { CHARACTER_HEIGHT, CHARACTER_WIDTH, CHARACTERS_PER_LINE_TIER } from "./Utils"

export type TierProperties = {
    id: number
    label: string
    color: string
    characters: CharacterProperties[]
}

// Sections of tierlist, split between label and characters
function Tier({ id, label, color, characters }: TierProperties)
{
    // Make tiers droppable
    const {isOver, setNodeRef} = useDroppable({id})
    const {active} = useDndContext();
    const draggedCharacter = active?.data?.current

    return (
        <div className="tier">
            <div className = "tierName" style = {{ backgroundColor: color }}>
                {label}
            </div>

            {/* Display all characters in the tier */}
            <div ref = {setNodeRef} className = "tierContent" style = {{
                gridTemplateColumns: `repeat(${CHARACTERS_PER_LINE_TIER}, ${CHARACTER_WIDTH}px)`,
                minHeight: CHARACTER_HEIGHT,
            }}>
                {characters.map((character) => (
                    <Character key = {character.name}
                        name = {character.name}
                        image = {character.image}
                        tierId = {character.tierId} />
                ))}

                {/* Display preview on hovered tier */}
                {isOver && draggedCharacter && draggedCharacter.tierId != id &&
                    <TierCharacterPreview characterImage = {draggedCharacter.image} />}
            </div> 
        </div>
    )
}

export default Tier