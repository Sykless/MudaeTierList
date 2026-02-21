import { useDroppable } from "@dnd-kit/core"
import Character from "./Character"
import type { CharacterProperties } from "./Character"

export type TierProperties = {
    id: number
    label: string
    color: string
    characters: CharacterProperties[]
}

function Tier({ id, label, color, characters }: TierProperties) {
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
            </div> 
        </div>
    )
}

export default Tier