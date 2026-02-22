import Character, { type CharacterProperties } from "./Character"

import { useState } from "react"
import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core"
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"

const TIERS_LABELS = ["S","A","B","C","D","E","F","G","H","I"]
const COLORS = [
  "#ff595e",
  "#ff924c",
  "#ffca3a",
  "#c5ca30",
  "#8ac926",
  "#52b788",
  "#1982c4",
  "#4267ac",
  "#6a4c93",
  "#b5179e"
]

const INITIAL_CHARACTERS = [
    {
        name: "Itachi Uchiha",
        image: "https://mudae.net/uploads/4336306/GkQ3Z2Y~sXzj0EE.gif"
    },
    {
        name: "Sasori",
        image: "https://mudae.net/uploads/3661665/MAUDvXx~Z8i5acH.png"
    },
    {
        name: "Shanks",
        image: "https://mudae.net/uploads/3167820/GamnNwB~ajuItI3.png"
    },
    {
        name: "Aster Phoenix",
        image: "https://mudae.net/uploads/1205751/NENq6fV~ndY9Vtg.png"
    },
    {
        name: "Ariel",
        image: "https://mudae.net/uploads/3078400/zPFEDDL~szgCU1g.png"
    },
    {
        name: "Yennefer",
        image: "https://mudae.net/uploads/9350707/PAoDW0_~oI1J2Nl.png"
    },
    {
        name: "Radagon",
        image: "https://mudae.net/uploads/7675404/hHJUzYL~5aBbANE.gif"
    },
]

type TierProperties = {
    id: number
    label: string
    color: string
    characters: CharacterProperties[]
}

type PoolProperties = {
    id: number
    characters: CharacterProperties[]
}

function App()
{
    // Assign each initial character to the pool
    const [pool, updatePool] = useState<CharacterProperties[]>(
        INITIAL_CHARACTERS.map((character) => ({
            name: character.name,
            image: proxifyImageUrl(character.image)
        }))
    )

    // Assign each tier label to a Tier object, id going from 0 to 9
    const [tiers, updateTiers] = useState(
        TIERS_LABELS.map((label, index) => ({
            id: index,
            label: label,
            color: COLORS[index],
            characters: [] as CharacterProperties[]
        }))
    )

    // Keep track of the picked character and hovererd tier for preview
    const [activeCharacter, setActiveCharacter] = useState<CharacterProperties | null>(null)
    const [hoveredTier, setHoveredTier] = useState<number | null>(null)

    // Generate character preview when an image is dragged
    function handleDragStart(event: DragStartEvent)
    {
        // Find original character from name
        const characterName = event.active.id as string
        const character = pool.find(character => character.name === characterName) ||
            tiers.flatMap(tier => tier.characters).find(character => character.name === characterName)

        // If a character is found, display it as preview
        if (character)
            setActiveCharacter(character)
    }

    // Generate character placeholder preview in the hovered tier
    function handleDragOver(event: DragOverEvent) {
        setHoveredTier(event.over?.id as number ?? null)
    }

    // Erase character preview
    function handleDragCancel() {
        setActiveCharacter(null)
        setHoveredTier(null)
    }

    // Called after an image is dropped
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return
        
        // Erase character preview
        setActiveCharacter(null)
        setHoveredTier(null)

        // Retrieve dropped character and tier id
        const characterName = active.id as string
        const targetTierId = over.id as number

        // Check if the character comes from the pool
        const poolCharacter = pool.find((character) => character.name === characterName)
        
        // Check if the character comes from a tier
        const tierCharacter = tiers
            .flatMap(tier => tier.characters)
            .find((character) => character.name === characterName);

        // Make sure character exists
        if (!poolCharacter && !tierCharacter) return
        
        updatePool((prev) => 
        {
            // Character moved from pool to tier
            if (poolCharacter && targetTierId >= 0) {
                return prev.filter((character) => character.name !== characterName)
            }

            // Character moved from tier to pool
            if (tierCharacter && targetTierId == -1) {
                return prev.some((character) => character.name === characterName)
                    ? prev
                    : [...prev, tierCharacter];
            }

            // Default : return original state
            return prev;
        })

        updateTiers((prev) =>
        {
            // Character moved from pool to tier
            if (poolCharacter && targetTierId >= 0) {
                return prev.map((tier) =>
                    tier.id === targetTierId
                        ? { ...tier, characters: [...tier.characters, poolCharacter] }
                        : tier
                )
            }

            // Character moved from tier to pool/another tier
            if (tierCharacter) {

                // Find source tier
                const sourceTier = prev.find((tier) => tier.characters.some(
                    character => character.name === characterName
                ))

                // Can't find source tier : return original state
                if (!sourceTier)
                    return prev;

                // Update source and target tiers
                return prev.map((tier) =>
                {
                    if (sourceTier.id != targetTierId)
                    {
                        // Remove character from source tier
                        if (tier.id === sourceTier.id) {
                            return {...tier,
                                characters: tier.characters.filter(
                                    (character) => character.name !== characterName)
                            }
                        }

                        // Add character to target tier
                        if (tier.id === targetTierId) {
                            return {...tier,
                                characters: [...tier.characters, tierCharacter]
                            }
                        }
                    }

                    // Default : keep tier as is
                    return tier;
                })
            }

            // Default : return original state
            return prev;
        })
    }

    // Sections of tierlist, split between label and characters
    function Tier({ id, label, color, characters }: TierProperties)
    {
        // Make tiers droppable
        const {setNodeRef} = useDroppable({
            id: id
        })

        return (
            <div className="tier">
                <div className = "tierName" style = {{ backgroundColor: color }}>
                    {label}
                </div>

                <div ref = {setNodeRef} className = "tierContent">
                    {characters.map((character) => (
                        <Character key = {character.name}
                            name = {character.name}
                            image = {character.image} />
                    ))}

                    {hoveredTier === id && <CharacterPreview />}
                </div> 
            </div>
        )
    }

    // Pool of characters to sort
    function Pool({ characters }: PoolProperties)
    {
        // Make Pool droppable 
        const {setNodeRef} = useDroppable({
            id: -1
        })

        return (
            <div ref = {setNodeRef} className = "characterPool">
                {characters.map((character) => (
                    <Character key = {character.name}
                        name = {character.name} 
                        image = {character.image} />
                ))}
            </div>
        )
    }

    // Preview character in target tier
    function CharacterPreview()
    {
        // No picked character : don't display preview
        if (!activeCharacter)
            return null;

        // Generate draggable character preview
        return (
            <img
                src = {activeCharacter.image}
                style = {{
                    width: 72,
                    height: 112,
                    opacity: 0.5
                }}
            />
        )
    }

    // Render app 
    return (
        <DndContext
            onDragStart = {handleDragStart}
            onDragEnd = {handleDragEnd}
            onDragOver = {handleDragOver}
            onDragCancel = {handleDragCancel}>

            <DragOverlay>
                {activeCharacter
                && <img src = {activeCharacter.image}
                        style = {{
                            width: 72,
                            height: 112,
                            opacity: 0.8
                        }}/>}
            </DragOverlay>

            <div className = "tierlist">
                {tiers.map((tier) => (
                    <Tier key = {tier.id}
                        id = {tier.id} 
                        label = {tier.label}
                        color = {tier.color}
                        characters = {tier.characters} />
                ))}
            </div>

            <Pool id = {-1} characters = {pool} />
        </DndContext>
    )
}

function proxifyImageUrl(originalUrl: string) {
    const cleanUrl = originalUrl.replace(/^https?:\/\//, "")
    return `https://images.weserv.nl/?url=${cleanUrl}`
}

export default App