import Character from "./Character"
import ColorPicker from "./ColorPicker"
import PreviewTierCharacter from "../preview/PreviewTierCharacter"
import { UpwardsIcon } from "../svg/UpwardsIcon"
import { DownwardsIcon } from "../svg/DownwardsIcon"
import { AddIcon } from "../svg/AddIcon"
import { DeleteIcon } from "../svg/DeleteIcon"
import { getTargetTierId, CHARACTER, CHARACTER_HEIGHT, CHARACTER_WIDTH, CHARACTERS_PER_LINE_TIER, TIER, TierContext, UPWARDS, DOWNWARDS } from "../utils/Shared"
import type { CharacterProperties } from "./Character"

import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { useDndContext, useDroppable } from "@dnd-kit/core"
import { Fragment } from "react/jsx-runtime"
import { useContext, useEffect, useState } from "react"

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
    const [validOver, setValidOver] = useState(false)
    const [isEditing, setEditing] = useState(false)
    const draggedCharacter = active?.data?.current?.character as CharacterProperties
    const isDraggingFromHere = draggedCharacter && draggedCharacter.tierId == id

    // Retrieve Tier updates methods from Context
    const context = useContext(TierContext)
    if (!context) throw new Error("Tier must be used inside TierContext.Provider")
    const { updateTier, insertTier, deleteTier, moveTier } = context

    // Make sure over is undefined only if dropping on undroppable container
    useEffect(() => {
        if (!active) setValidOver(false)
        else if (over) setValidOver(true)
    }, [active, over])

    // Preview character at its dropped position, -1 if not in this tier
    const previewIndex = over?.data?.current?.type === CHARACTER
        ? characters.findIndex(character => character.name == over?.data?.current?.character.name)
        : isOver ? characters.length : -1

    // Default : display characters as is
    let visualCharacters = characters

    // If dragging away from the tier, display dragged character at the bottom the tier
    if (draggedCharacter) {
        const targetTierId = getTargetTierId(over)
        const isDraggingOutside = validOver && targetTierId != id

        // Move dragged character at the bottom of the tier
        if (isDraggingFromHere && isDraggingOutside) {
            visualCharacters = [...characters.filter(
                    character => character.name !== draggedCharacter.name
                ), draggedCharacter]
        }
    }

    return (
        <div className="tier">

            {/* Left section : editable label */}
            <div className="tierName" style = {{ backgroundColor: color }}
                onClick = {() => setEditing(true)}
            >
                {isEditing ? (
                    <textarea value = {label}
                        autoFocus
                        onBlur = {() => setEditing(false)}
                        onChange = {e => updateTier(id, {label: e.target.value})}
                        onFocus = {e => {
                            const length = e.target.value.length;
                            e.target.setSelectionRange(length, length);
                        }}
                    />
                ) : (
                    label
                )}
            </div>

            {/* Display all characters in the tier */}
            <div ref = {setNodeRef} className = "tierContent" style = {{
                gridTemplateColumns: `repeat(${CHARACTERS_PER_LINE_TIER}, ${CHARACTER_WIDTH}px)`,
                minHeight: CHARACTER_HEIGHT,
            }}>

                <SortableContext items = {visualCharacters.map(character => character.name)}
                    strategy = {rectSortingStrategy}>

                    {/* Display characters in tier + preview if dragged on */}
                    {visualCharacters.map((character, index) => (
                        <Fragment key = {character.name}>
                            {!isDraggingFromHere && index == previewIndex && draggedCharacter &&
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
                    {!isDraggingFromHere && previewIndex == visualCharacters.length && draggedCharacter &&
                        <PreviewTierCharacter characterImage = {draggedCharacter.image} />
                    }
                </SortableContext>
            </div> 

            {/* Right section : tier controls */}
            <div className = "tierControls">
                <div className = "controlTop">

                    {/* Top left : Color picker */}
                    <div className = "colorSection">
                        <ColorPicker currentColor = {color}
                            onChange = {(newColor) => updateTier(id, {color: newColor})}
                        />
                    </div>

                    {/* Top right : Up/Down arrows */}
                    <div className = "controlArrows">
                        <button className = "tierButton" onClick={() => moveTier(id, UPWARDS)}>
                            <UpwardsIcon />
                        </button>
                        <button className = "tierButton" onClick={() => moveTier(id, DOWNWARDS)}>
                            <DownwardsIcon />
                        </button>
                    </div>
                </div>

                {/* Lower half – Add/Delete */}
                <div className="controlActions">
                    <button className = "tierButton wideButtons" onClick={() => insertTier(id)}>
                        <AddIcon />
                    </button>
                    <button className = "tierButton wideButtons" onClick={() => deleteTier(id)}>
                        <DeleteIcon />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Tier