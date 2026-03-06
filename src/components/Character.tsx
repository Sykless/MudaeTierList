import { CHARACTER, CHARACTER_HEIGHT, CHARACTER_WIDTH } from "../utils/Shared"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export type CharacterProperties = {
    name: string
    image: string
    tierId: number
    opacity?: number
}

function Character({ name, image, tierId, opacity }: CharacterProperties)
{
    // Make Character sortable
    const {attributes, isDragging, listeners, setNodeRef, transform, transition} = useSortable({
        id: name,
        data:{
            type: CHARACTER,
            character: {name, image, tierId} as CharacterProperties
        },
        animateLayoutChanges: () => false // Only leave default swap animations
    })

    // Hide original character when dragged
    const style = isDragging
        ? {opacity: 0}
        : {
            transform: CSS.Translate.toString(transform),
            opacity: opacity,
            transition} 

    return (
        <img id = {name}
            ref = {setNodeRef}
            {...listeners}
            {...attributes}
            style = {style}
            className = "character"
            src = {image}
            alt = {name}
            title = {name}
            width = {CHARACTER_WIDTH}
            height = {CHARACTER_HEIGHT}
        />
    )
}

export default Character