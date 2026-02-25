import Character from "./Character"
import type { CharacterProperties } from "./Character"
import { useDroppable } from "@dnd-kit/core"
import { useEffect, useRef, useState, type RefObject } from "react"
import { CHARACTER_HEIGHT, CHARACTER_WIDTH, CHARACTERS_PER_LINE_POOL, POOL_ID } from "./Utils"

type PoolProperties = {
    characters: CharacterProperties[]
    poolRef: RefObject<HTMLDivElement | null>
}

// Pool of characters to sort
function Pool({ characters, poolRef }: PoolProperties)
{
    // Make Pool content droppable 
    const {setNodeRef} = useDroppable({
        id: POOL_ID
    })

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
                {characters.map((character) => (
                    <Character key = {character.name}
                        name = {character.name} 
                        image = {character.image} />
                ))}
            </div>
        </div>
    )
}

export default Pool