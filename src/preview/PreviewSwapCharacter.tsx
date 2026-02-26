import { useDndContext } from "@dnd-kit/core";
import { CHARACTER, invertTranslate3d } from "../Utils";

// Preview character when swapping
function PreviewSwapCharacter()
{
    const {active, over} = useDndContext();
    const draggedCharacter = active?.data?.current?.character

    // Retrieve droppable character and its position to mimic it
    const targetCharacter = over?.data.current?.type == CHARACTER ? over?.data.current?.character : null
    const targetCharacterElement = document.getElementById(targetCharacter?.name)
    const targetCharacterRect = targetCharacterElement?.getBoundingClientRect()

    // Only display swap preview when moving a character within the same tier
    const withinSameTier = draggedCharacter && draggedCharacter.tierId == targetCharacter?.tierId

    return withinSameTier && targetCharacterElement && targetCharacterRect && (
        <img style = {{
            position: "fixed",
            left: targetCharacterRect.left,
            top: targetCharacterRect.top,
            width: targetCharacterRect.width,
            height: targetCharacterRect.height,
            opacity: 0.4,
            pointerEvents: "none",
            zIndex: 1000,
            transform: invertTranslate3d(window.getComputedStyle(targetCharacterElement).transform)
        }}
            src = {draggedCharacter.image}
            width = {targetCharacterRect.width}
            height = {targetCharacterRect.height}
        />
    )
}

export default PreviewSwapCharacter