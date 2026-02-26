import { DragOverlay, useDndContext } from "@dnd-kit/core"
import { CHARACTER_HEIGHT, CHARACTER_WIDTH } from "../Utils";

// Preview dragged character
function PreviewDragCharacter()
{
    const {active} = useDndContext();
    const draggedCharacter = active?.data?.current?.character

    return draggedCharacter && (
        <DragOverlay style = {{zIndex: 9999}}>
            <img src = {draggedCharacter.image}
                style = {{
                    width: CHARACTER_WIDTH,
                    height: CHARACTER_HEIGHT,
                    opacity: 0.85
                }}/>
        </DragOverlay>
    )
}

export default PreviewDragCharacter