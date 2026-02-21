import Tier from "./Tier"
import Character from "./Character"
import type { CharacterProperties } from "./Character"
import type { TierProperties } from "./Tier"
import type { DragEndEvent } from "@dnd-kit/core"
import { DndContext } from "@dnd-kit/core"
import { useState } from "react"

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

function App() {
    const [pool, setPool] = useState(INITIAL_CHARACTERS)

    const [tiers, setTiers] = useState(
        TIERS_LABELS.map((label, index) => ({
            id: index,
            label: label,
            color: COLORS[index],
            characters: [] as CharacterProperties[]
        }))
    )

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return

        const characterName = active.id as string
        const targetTierId = over.id as number

        // Remove from pool
        const targetCharacter = pool.find((character) => character.name === characterName)
        if (!targetCharacter) return

        setPool((prev) =>
            prev.filter((character) => character.name !== characterName)
        )

        setTiers((prev) =>
            prev.map((tier) =>
                tier.id === targetTierId
                    ? { ...tier, characters: [...tier.characters, targetCharacter] }
                    : tier
            )
        )
    }

    return (
        <DndContext onDragEnd = {handleDragEnd}>
            <div className="tierlist">
                {tiers.map((tier) => (
                    <Tier key = {tier.id}
                        id = {tier.id} 
                        label = {tier.label}
                        color = {tier.color}
                        characters = {tier.characters} />
                ))}
            </div>

            <div className = "characterPool">
                {pool.map((character) => (
                    <Character key = {character.name}
                        name = {character.name} 
                        image = {character.image} />
                ))}
            </div>
        </DndContext>
    )
}

export default App