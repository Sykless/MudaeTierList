import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

export type CharacterProperties = {
    name: string
    image: string
}

function proxifyImageUrl(originalUrl: string) {
    const cleanUrl = originalUrl.replace(/^https?:\/\//, "")
    return `https://images.weserv.nl/?url=${cleanUrl}`
}

function Character({ name, image }: CharacterProperties) {

    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: name
    })

    const style = {
        transform: CSS.Translate.toString(transform)
    }

    return (
        <img
            ref = {setNodeRef}
            {...listeners}
            {...attributes}
            style = {style}
            className = "character"
            src = {proxifyImageUrl(image)}
            alt = {name}
        />
    )
}

export default Character