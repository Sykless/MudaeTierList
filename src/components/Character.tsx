import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CHARACTER, CHARACTER_HEIGHT, CHARACTER_WIDTH } from "../utils/Shared"

export type CharacterProperties = {
    name: string
    image: string
    tierId: number
}

function Character({ name, image, tierId }: CharacterProperties) {

    const {attributes, isDragging, listeners, setNodeRef, transform, transition} = useSortable({
        id: name,
        data:{
            type: CHARACTER,
            character: {name, image, tierId} as CharacterProperties
        }
    })

    const style = isDragging
        ? {opacity: 0}
        : {transform: CSS.Translate.toString(transform), transition} 

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