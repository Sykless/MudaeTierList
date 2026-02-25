import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CHARACTER_HEIGHT, CHARACTER_WIDTH } from "./Utils"

export type CharacterProperties = {
    name: string
    image: string
    tierId: number
}

function Character({ name, image, tierId }: CharacterProperties) {

    const {attributes, isDragging, listeners, setNodeRef, transform} = useDraggable({
        id: name,
        data: {name, image, tierId} as CharacterProperties
    })

    const style = isDragging
        ? {opacity: 0}
        : {transform: CSS.Translate.toString(transform)} 

    return (
        <img
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