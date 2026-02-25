import { DragOverlay, useDndContext } from "@dnd-kit/core"

// Preview dragged character
function DragCharacterPreview()
{
    const {active} = useDndContext();
    const draggedCharacter = active?.data?.current

    return draggedCharacter && (
        <DragOverlay style = {{zIndex: 9999}}>
            <img src = {draggedCharacter.image}
                style = {{
                    width: 72,
                    height: 112,
                    opacity: 0.8
                }}/>
        </DragOverlay>
    )
}

export default DragCharacterPreview