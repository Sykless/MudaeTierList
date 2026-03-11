import { CHARACTER, CHARACTER_HEIGHT, CHARACTER_WIDTH } from "../utils/Shared"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useContext, useState } from "react"
import { ImageEditContext, type ImageEditContextType } from "../context/ImageEditContext"
import ImagePicker from "./ImagePicker"

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

    // Retrieve Image Edit Mode from Context
    const {imageEditMode} = useContext(ImageEditContext) as ImageEditContextType

    // Hide original character when dragged
    const style = isDragging ? {opacity: 0}
        : {opacity: opacity,
            transform: CSS.Translate.toString(transform),
            transition: imageEditMode ? "opacity 0.25s" : transition} 


    const [pickerOpen, setPickerOpen] = useState(false)
    function handleClick() {if (imageEditMode) setPickerOpen(true)}

    return (
        <>
            <img id = {name} ref = {setNodeRef} className = {`character ${imageEditMode ? "editMode" : ""}`}
                style = {style} width = {CHARACTER_WIDTH} height = {CHARACTER_HEIGHT}
                src = {image} title = {name} alt = {name}
                onClick = {handleClick}
                {...listeners}
                {...attributes}
            />

            {pickerOpen &&
                <ImagePicker name = {name}
                    onClose = {() => setPickerOpen(false)}
                />
            }
        </>
    )
}

export default Character