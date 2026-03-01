// @ts-ignore
import domtoimage from 'dom-to-image-more'; // Does not ship its type, ignore generated warning
import { useEffect } from "react"

import { useDndContext, type Active, type Collision, type DroppableContainer, type Over } from "@dnd-kit/core"
import type { CharacterProperties } from "./components/Character"

export const CHARACTERS_PER_LINE_TIER = 15
export const CHARACTERS_PER_LINE_POOL = 20
export const CHARACTER_HEIGHT = 112
export const CHARACTER_WIDTH = 72
export const POOL_HEADER_HEIGHT = 32
export const POOL_ID = -1

export const CHARACTER = "character"
export const TIER = "tier"
export const POOL = "pool"

const PROXY_URL = "https://super-field-ca48.rakouett-du-56.workers.dev/?url="

export function proxifyImageUrl(originalUrl: string) {
    return PROXY_URL + originalUrl;
}

export function unproxifyImageUrl(proxiedUrl: string) {
    return proxiedUrl.replace(PROXY_URL, "");
}

export function findDroppable(collisionList: Collision[], droppableType: string) {
    return collisionList.filter(droppable => 
            droppable.data?.droppableContainer?.data.current.type == droppableType)
}

export function findCharacterIndex(characterList: CharacterProperties[], characterName: string) {
    return characterList.findIndex(character => character.name === characterName)
            ?? characterList.length - 1
}

export function getTargetTierId(over: Over) {
    return over.data.current?.type == CHARACTER
        ? over.data.current.character.tierId
        : over.id
}

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

// Screenshot tierlist and return as blob
export async function captureTierlist(): Promise<Blob> {
    const element = document.querySelector(".tierlist") as HTMLElement;
    const rect = element.getBoundingClientRect();

    // Convert cloned tierlist to PNG using dom-to-image-more
    const dataUrl = await domtoimage.toPng(element, {
        width: rect.width,
        height: rect.height,
        bgcolor: "#1e1e1e",
        cacheBust: true,
        style: {
            margin: "0",
        }
    });

    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    return await response.blob();
}

// Edit PNG file to add json data in it
export async function appendJsonToPng(pngBlob: Blob, jsonData: string): Promise<Blob> {
    const pngBuffer = await pngBlob.arrayBuffer()

    const encoder = new TextEncoder()
    const jsonBytes = encoder.encode(jsonData)
    const marker = encoder.encode("\nMUDAE_TIERLIST_JSON_START\n")

    const combined = new Uint8Array(
        pngBuffer.byteLength + marker.byteLength + jsonBytes.byteLength
    )

    combined.set(new Uint8Array(pngBuffer), 0)
    combined.set(marker, pngBuffer.byteLength)
    combined.set(jsonBytes, pngBuffer.byteLength + marker.byteLength)

    return new Blob([combined], { type: "image/png" })
}

export function downloadFile(fileName: string, file: Blob)
{
    // Create link from file contents
    const url = URL.createObjectURL(file)
    const link = document.createElement("a")

    // Simulate click on generated link
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
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