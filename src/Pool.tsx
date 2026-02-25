import Character from "./Character"
import type { CharacterProperties } from "./Character"
import { useDroppable } from "@dnd-kit/core"
import { useEffect, useRef, useState, type RefObject } from "react"

type PoolProperties = {
    characters: CharacterProperties[]
    poolRef: RefObject<HTMLDivElement | null>
}

// Pool of characters to sort
function Pool({ characters, poolRef }: PoolProperties)
{
    // Make Pool content droppable 
    const {setNodeRef} = useDroppable({
        id: -1
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

            // Disable sticky if previously sticky and reached the bottom of the page
            if (isSticky && viewportBottom >= documentHeight - 1) {
                newSticky = false
            }
            // Enable sticky if previously not sticky and scrolled up the tierlist
            else if (scrollingUp && viewportBottom < documentHeight - poolTotalHeight + poolHeight) {
                newSticky = true
            }

            // Update sticky and previous position
            if (newSticky !== isSticky) setSticky(newSticky)
            currentPosition.current = scrollY
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [isSticky, poolRef])

    // Resize pool when dragging it upwards or downwards
    function resizePool(e: any) {
        const startY = e.clientY
        const startHeight = poolHeight

        // Stop default browser behavior (select text on drag)
        e.preventDefault();

        function onMove(e: any) {
            const delta = startY - e.clientY
            setPoolHeight(
                Math.max(120, Math.min(500, startHeight + delta))
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
                height: isSticky ? poolHeight : "", 
                position: isSticky ? "sticky" : "relative",
                bottom: isSticky ? 0 : "auto"}}>

            {/* Header : TODO display header differently if not sticky */}
            {isSticky && <div className = "resizeHandle" onMouseDown = {resizePool} />} 
            <div className = "poolHeader">
                <input placeholder="Search..." />
                <span>34 remaining</span>
            </div>

            {/* Actual droppable character pool */}
            <div ref = {setNodeRef} className = "poolContent">
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