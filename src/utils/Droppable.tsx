
import { useEffect } from "react"
import { useDndContext, type Active, type Collision, type DroppableContainer } from "@dnd-kit/core"
import { TIER } from "./Shared"

// Override default behavior when dropping character in tier, simulate swap with last character in tier
export function simulateCharacterSwap(droppableContainer: Collision[], args: {droppableContainers: DroppableContainer[], active: Active}) {
    const originTierId = args.active.data.current?.character?.tierId
    const targetTierId = droppableContainer[0].id

    // When reordering characters within the same tier
    if (originTierId == targetTierId)
    {
        // Retrieve character list from tier/pool
        const characterList = droppableContainer[0]?.data?.droppableContainer?.data.current.type == TIER
            ? droppableContainer[0]?.data?.droppableContainer?.data.current.tier.characters
            : droppableContainer[0]?.data?.droppableContainer?.data.current.pool.characters

        // Replace tier/pool drop with last character in tier to simulate swap
        if (characterList.length) {
            const lastCharacterInTier = characterList[characterList.length - 1]

            const lastDroppableCharacter = args.droppableContainers.filter(
                container => container.data.current?.character?.name === lastCharacterInTier.name
            )

            return [{
                id: lastDroppableCharacter[lastDroppableCharacter.length - 1].id,
                data: { droppableContainer: lastDroppableCharacter[lastDroppableCharacter.length - 1] }
            }]
        }
    }

    // Default : return the container and apply normal drop
    return droppableContainer
}

// Invert transform to put the object to its original position
export function invertTranslate3d(transform: string) {
    if (!transform || transform === "none")
        return "matrix(1, 0, 0, 1, 0, 0)"

    const values = transform.match(/matrix\(([^)]+)\)/)?.[1]
        .split(",")
        .map(v => v.trim())

    if (!values) return transform
    const [a, b, c, d, tx, ty] = values

    // Invert x and y values
    return `matrix(${a}, ${b}, ${c}, ${d}, ${-parseFloat(tx)}, ${-parseFloat(ty)})`
}

// Remeasure Droppable containers when scrolling (not enabled by default)
export function ScrollRemeasurer() {
  const { measureDroppableContainers, droppableRects, active } = useDndContext()

  useEffect(() => {
        if (!active) return

        const handleScroll = () => {
            measureDroppableContainers(Array.from(droppableRects.keys()))
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [active, droppableRects, measureDroppableContainers])

  return null
}