import Character from "./Character"
import PreviewTierCharacter from "../preview/PreviewTierCharacter"
import type { CharacterProperties } from "./Character"
import { CHARACTER, CHARACTER_HEIGHT, CHARACTER_WIDTH, CHARACTERS_PER_LINE_TIER, TIER } from "../utils/Shared"
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { useDndContext, useDroppable } from "@dnd-kit/core"
import { Fragment } from "react/jsx-runtime"

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
    const {isOver, setNodeRef} = useDroppable({
        id,
        data: {
            type: TIER,
            tier: {id, label, color, characters} as TierProperties
        },
    })

    const {active, over} = useDndContext();
    const draggedCharacter = active?.data?.current?.character as CharacterProperties
    const moveInOwnTier = draggedCharacter?.tierId === id

    // Preview character at its dropped position, -1 if not in this tier
    const previewIndex = over?.data?.current?.type === CHARACTER
        ? characters.findIndex(character => character.name == over?.data?.current?.character.name)
        : isOver ? characters.length : -1

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

                <SortableContext items = {characters.map(character => character.name)}
                    strategy = {rectSortingStrategy }>

                    {/* Display characters in tier + preview if dragged on */}
                    {characters.map((character, index) => (
                        <Fragment key = {character.name}>
                            {!moveInOwnTier && index == previewIndex && draggedCharacter &&
                                <PreviewTierCharacter characterImage = {draggedCharacter.image} />
                            }

                            <Character
                                name = {character.name}
                                image = {character.image}
                                tierId = {character.tierId}
                            />
                        </Fragment>
                    ))}

                    {/* Preview character is at the end of tier */}
                    {!moveInOwnTier && previewIndex == characters.length && draggedCharacter &&
                        <PreviewTierCharacter characterImage = {draggedCharacter.image} />
                    }
                </SortableContext>
            </div> 
        </div>
    )
}

export default Tier