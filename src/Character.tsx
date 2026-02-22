import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

export type CharacterProperties = {
    name: string
    image: string
}

function Character({ name, image }: CharacterProperties) {

    const {attributes, isDragging, listeners, setNodeRef, transform} = useDraggable({
        id: name
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
        />
    )
}

export default Character