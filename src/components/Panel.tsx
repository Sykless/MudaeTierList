import { CHARACTER_WIDTH, CHARACTERS_PER_LINE_POOL, POOL_HEADER_HEIGHT } from "../Utils"
import { useEffect, useRef, useState } from "react"
import Import from "./Import"
import Export from "./Export"
import type { CharacterProperties } from "./Character"
import type { TierProperties } from "./Tier"

type PanelProperties = {
    tiers: TierProperties[]
    pool: CharacterProperties[]
    onImport: (characters: CharacterProperties[]) => void
}

// Import/Export Panel
function Panel({tiers, pool, onImport}: PanelProperties)
{
    // Keep track of open/closed state
    const [isOpen, setOpen] = useState(false)
    const [panelHeight, setPanelHeight] = useState(0)
    const panelContentRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        if (panelContentRef.current) {
            setPanelHeight(panelContentRef.current.scrollHeight)
        }
    }, [isOpen])

    return (
        <div className = {`panel ${isOpen ? "open" : "closed"}`} style = {{zIndex: 999,
            maxWidth: (CHARACTERS_PER_LINE_POOL + 5) * CHARACTER_WIDTH
        }}>
            <div ref = {panelContentRef} className = "panelContent" style = {{
                height: isOpen ? panelHeight : 0,
            }}>
                <div className = "panelGrid">
                    <Import onImport = {onImport} />
                    <Export tiers = {tiers} pool = {pool} />
                </div>
            </div>

            <button className = "closeHandle" style = {{height: POOL_HEADER_HEIGHT}}
                 onClick={() => setOpen(!isOpen)} />
        </div>
    )
}

export default Panel