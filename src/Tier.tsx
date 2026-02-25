import { useDndContext, useDroppable } from "@dnd-kit/core"
import type { CharacterProperties } from "./Character"
import Character from "./Character"
import TierCharacterPreview from "./TierCharacterPreview"

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
            <div ref = {setNodeRef} className = "tierContent">
                {characters.map((character) => (
                    <Character key = {character.name}
                        name = {character.name}
                        image = {character.image} />
                ))}

                {/* Display preview on hovered tier */}
                {isOver && draggedCharacter &&
                    <TierCharacterPreview characterImage = {draggedCharacter.image} />}
            </div> 
        </div>
    )
}

export default Tier