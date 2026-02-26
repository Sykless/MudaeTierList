import Character from "./Character"
import PreviewTierCharacter from "../preview/PreviewTierCharacter"
import { CHARACTER, CHARACTER_HEIGHT, CHARACTER_WIDTH, CHARACTERS_PER_LINE_POOL, POOL, POOL_ID } from "../Utils"
import type { CharacterProperties } from "./Character"
import { useDndContext, useDroppable } from "@dnd-kit/core"
import { rectSortingStrategy , SortableContext } from "@dnd-kit/sortable"
import { Fragment, useEffect, useRef, useState, type RefObject } from "react"

export type PoolProperties = {
    characters: CharacterProperties[]
    poolRef: RefObject<HTMLDivElement | null>
}

// Pool of characters to sort
function Pool({ characters, poolRef }: PoolProperties)
{
    // Make Pool content droppable 
    const {isOver, setNodeRef} = useDroppable({
        id: POOL_ID,
        data: {
            type: POOL,
            pool: {characters, poolRef} as PoolProperties
        }
    })

    // Dragged character data
    const {active, over} = useDndContext();
    const draggedCharacter = active?.data?.current?.character as CharacterProperties
    const moveInOwnTier = draggedCharacter?.tierId === POOL_ID

    // Preview character at its dropped position, -1 if not in this tier
    const previewIndex = over?.data?.current?.type === CHARACTER
        ? characters.findIndex(character => character.name == over?.data?.current?.character.name)
        : isOver ? characters.length : -1

    // Pool adjustable parameters
    const [poolHeight, setPoolHeight] = useState(160)
    const [isSticky, setSticky] = useState(true)
    const currentPosition = useRef(window.scrollY)

    // Pool transition from sticky to set position when scrolling down
    useEffect(() => {
        const handleScroll = () => {
            const yPosition = window.scrollY
            const viewportBottom = yPosition + window.innerHeight
            const documentHeight = document.documentElement.scrollHeight

            const poolTotalHeight = poolRef?.current?.offsetHeight || 0
            const scrollingUp = yPosition < currentPosition.current

            // Default : keep sticky value
            let newSticky = isSticky

            // Only disable sticky if pool has more than one line
            if (characters.length > CHARACTERS_PER_LINE_POOL)
            {
                // Disable sticky if previously sticky and reached the bottom of the page
                if (isSticky && viewportBottom >= documentHeight - 1) {
                    newSticky = false
                }
                // Enable sticky if previously not sticky and scrolled up the tierlist
                else if (scrollingUp && viewportBottom < documentHeight - poolTotalHeight + poolHeight) {
                    newSticky = true
                }
            }
            else {
                newSticky = true
            }

            // Update sticky and previous position
            if (newSticky !== isSticky) setSticky(newSticky)
            currentPosition.current = scrollY
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [isSticky, poolRef, characters])

    // Resize pool when dragging it upwards or downwards
    function resizePool(e: any) {
        const startY = e.clientY
        const startHeight = poolHeight

        // Stop default browser behavior (select text on drag)
        e.preventDefault();

        function onMove(e: any) {
            const delta = startY - e.clientY
            setPoolHeight(
                Math.max(32, Math.min(32 + 5 * CHARACTER_HEIGHT, startHeight + delta))
            )
        }

        function onUp() {
            window.removeEventListener("mousemove", onMove)
            window.removeEventListener("mouseup", onUp)
        }

        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
    }

    return (
        <div ref = {poolRef} className = "characterPool"
            style = {{zIndex: 999,
                maxWidth: CHARACTERS_PER_LINE_POOL * CHARACTER_WIDTH,
                minHeight: isSticky ? "" : poolHeight,
                height: isSticky ? poolHeight : "", 
                position: isSticky ? "sticky" : "relative",
                bottom: isSticky ? 0 : "auto",
                marginBottom: isSticky ? "" : 40,
            }}>

            {/* Header : TODO display header differently if not sticky */}
            <div className = "resizeHandle" onMouseDown = {resizePool} style = {{
                cursor: isSticky ? "ns-resize" : "default",
                ["--handle-color" as any]: `rgba(0,0,0,${isSticky ? 0.45 : 0})`
            }} />

            <div className = "poolHeader">
                {/* <input placeholder="Search..." /> <span>34 remaining</span> */}
            </div>

            {/* Actual droppable character pool */}
            <div ref = {setNodeRef} className = "poolContent" style = {{
                gridTemplateColumns: `repeat(auto-fill, ${CHARACTER_WIDTH}px)`,
                gridAutoRows: CHARACTER_HEIGHT
            }}>

                <SortableContext items = {characters.map(character => character.name)}
                    strategy = {rectSortingStrategy }>

                    {/* Display characters in pool + preview if dragged on */}
                    {characters.map((character, index) => (
                        <Fragment key = {character.name}>
                            {!moveInOwnTier && index == previewIndex && draggedCharacter &&
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
                    {!moveInOwnTier && previewIndex == characters.length && draggedCharacter &&
                        <PreviewTierCharacter characterImage = {draggedCharacter.image} />
                    }
                </SortableContext>
            </div>
        </div>
    )
}

export default Pool