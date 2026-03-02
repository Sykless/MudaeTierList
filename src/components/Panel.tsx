import { CHARACTER_WIDTH, CHARACTERS_PER_LINE_POOL, POOL_HEADER_HEIGHT } from "../utils/Shared"
import { useEffect, useRef, useState } from "react"
import Import from "./Import"
import Export from "./Export"
import type { CharacterProperties } from "./Character"
import type { TierProperties } from "./Tier"

type PanelProperties = {
    tiers: TierProperties[]
    pool: CharacterProperties[]
    mudaeImport: (characters: CharacterProperties[]) => void
    backupImport: (tiers: TierProperties[], pool: CharacterProperties[]) => void
}

// Import/Export Panel
function Panel({tiers, pool, mudaeImport, backupImport}: PanelProperties)
{
    // Keep track of open/closed state
    const [isOpen, setOpen] = useState(false)
    const [panelHeight, setPanelHeight] = useState(0)
    const panelContentRef = useRef<HTMLDivElement>(null)
    const [animate, setAnimate] = useState(false);

    // Animate Mudae Import and File/Screenshot Export
    function triggerAnimation() {
        requestAnimationFrame(() => setAnimate(true));
        setTimeout(() => setAnimate(false), 800);
    }
    
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
                overflow: animate ? "visible" : "hidden"
            }}>
                <div className = "panelGrid">
                    <Import mudaeImport = {mudaeImport} backupImport = {backupImport} triggerAnimation = {triggerAnimation} animate = {animate} />
                    <Export tiers = {tiers} pool = {pool} animate = {animate} />
                </div>
            </div>

            <button className = "closeHandle" style = {{height: POOL_HEADER_HEIGHT}}
                 onClick={() => setOpen(!isOpen)} />
        </div>
    )
}

export default Panel