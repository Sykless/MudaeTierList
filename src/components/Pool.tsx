import type { CharacterProperties } from "./Character"
import Character from "./Character"
import PreviewTierCharacter from "../preview/PreviewTierCharacter"
import { getTargetTierId, CHARACTER, CHARACTER_HEIGHT, CHARACTER_WIDTH, CHARACTERS_PER_LINE_POOL, POOL, POOL_HEADER_HEIGHT, POOL_ID } from "../utils/Shared"
import { TierlistContext, type TierlistContextType } from "../context/TierlistContext"
import { useDndContext, useDroppable } from "@dnd-kit/core"
import { rectSortingStrategy , SortableContext } from "@dnd-kit/sortable"
import { Fragment, useContext, useEffect, useRef, useState, type RefObject } from "react"

type PoolProperties = {
    characters: CharacterProperties[]
    poolContentRef: RefObject<HTMLDivElement | null>
}

// Pool of characters to sort
function Pool({poolContentRef, characters}: PoolProperties)
{
    // Make Pool droppable 
    const {isOver, setNodeRef} = useDroppable({
        id: POOL_ID,
        data: {
            type: POOL,
            pool: {characters, poolContentRef} as PoolProperties
        }
    })

    // Retrieve Tierlist state from Context
    const {tierlist} = useContext(TierlistContext) as TierlistContextType

    // Searchbar value
    const [searchText, setSearchText] = useState("");

    // Dragged character data
    const {active, over} = useDndContext();
    const draggedCharacter = active?.data?.current?.character as CharacterProperties
    const moveInOwnTier = draggedCharacter?.tierId === POOL_ID
    const [validOver, setValidOver] = useState(false)

    // Make sure over is undefined only if dropping on undroppable container
    useEffect(() => {
        if (!active) setValidOver(false)
        else if (over) setValidOver(true)
    }, [active, over])

    // Preview character at its dropped position, -1 if not in this tier
    const previewIndex = over?.data?.current?.type === CHARACTER
        ? characters.findIndex(character => character.name == over?.data?.current?.character.name)
        : isOver ? characters.length : -1

    // Pool adjustable parameters
    const [poolHeight, setPoolHeight] = useState(POOL_HEADER_HEIGHT + CHARACTER_HEIGHT + 10)
    const [isSticky, setSticky] = useState(true)
    const currentPosition = useRef(window.scrollY)

    // Pool transition from sticky to set position when scrolling down
    useEffect(() => {
        const handleScroll = () => {
            const yPosition = window.scrollY
            const viewportBottom = yPosition + window.innerHeight
            const documentHeight = document.documentElement.scrollHeight

            const poolTotalHeight = poolContentRef?.current?.offsetHeight || 0
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
    }, [isSticky, poolContentRef, characters])

    // Resize pool when dragging it upwards or downwards
    function resizePool(e: any) {
        const startY = e.clientY
        const startHeight = poolHeight

        // Stop default browser behavior (select text on drag)
        e.preventDefault();

        function onMove(e: any) {
            const delta = startY - e.clientY
            setPoolHeight(
                Math.max(POOL_HEADER_HEIGHT,
                         Math.min(POOL_HEADER_HEIGHT + 5 * CHARACTER_HEIGHT, startHeight + delta))
            )
        }

        function onUp() {
            window.removeEventListener("mousemove", onMove)
            window.removeEventListener("mouseup", onUp)
        }

        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
    }

    // Default : display characters as is
    let visualCharacters = characters

    // If dragging away from the pool, display dragged character at the bottom the pool
    if (draggedCharacter) {
        const targetTierId = getTargetTierId(over)
        const isDraggingFromHere = draggedCharacter.tierId == POOL_ID
        const isDraggingOutside = validOver && targetTierId != POOL_ID

        // Move dragged character at the bottom of the pool
        if (isDraggingFromHere && isDraggingOutside) {
            visualCharacters = [...characters.filter(
                    character => character.name !== draggedCharacter.name
                ), draggedCharacter]
        }
    }

    return (
        <div ref = {setNodeRef} className = "characterPool"
            style = {{zIndex: 99,
                maxWidth: CHARACTERS_PER_LINE_POOL * CHARACTER_WIDTH,
                minHeight: isSticky ? "" : poolHeight,
                height: isSticky ? poolHeight : "", 
                position: isSticky ? "sticky" : "relative",
                bottom: isSticky ? 0 : "auto",
                marginBottom: isSticky ? "" : 40,
            }}>

            {/* Pool header with search bar and draggable handle to resize */}
            <div style = {{height: POOL_HEADER_HEIGHT}}>
                <div className = "resizeHandle" onMouseDown = {resizePool} style = {{
                    cursor: isSticky ? "ns-resize" : "default",
                    ["--handle-color" as any]: `rgba(0,0,0,${isSticky ? 0.45 : 0})`
                }} />

                <div className = "poolHeader">
                    <input id = "poolSearchbar" className = "poolSearchbar" placeholder = "Recherche..." 
                        value = {searchText} onChange={(e) => setSearchText(e.target.value)}/>
                    <span className = "regularText">
                        {characters.length} / {tierlist.present.tiers.reduce((sum, tier) => sum + tier.characters.length, 0) + characters.length}
                    </span>
                </div>
            </div>

            {/* Actual droppable character pool */}
            <div ref = {poolContentRef} className = "poolContent" style = {{
                gridTemplateColumns: `repeat(auto-fill, ${CHARACTER_WIDTH}px)`,
                gridAutoRows: CHARACTER_HEIGHT
            }}>

                <SortableContext items = {visualCharacters.map(character => character.name)}
                    strategy = {rectSortingStrategy}>

                    {/* Display characters in pool + preview if dragged on */}
                    {visualCharacters.map((character, index) => (
                        <Fragment key = {character.name}>
                            {!moveInOwnTier && index == previewIndex && draggedCharacter &&
                                <PreviewTierCharacter characterImage = {draggedCharacter.image} />
                            }

                            <Character
                                name = {character.name}
                                image = {character.image}
                                tierId = {character.tierId}
                                opacity = {character.name.toLowerCase().includes(searchText.toLowerCase()) ? undefined : 0.2}
                            />
                        </Fragment>
                    ))}

                    {/* Preview character is at the end of tier */}
                    {!moveInOwnTier && previewIndex == visualCharacters.length && draggedCharacter &&
                        <PreviewTierCharacter characterImage = {draggedCharacter.image} />
                    }
                </SortableContext>
            </div>
        </div>
    )
}

export default Pool