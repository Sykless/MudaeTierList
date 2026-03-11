import { CHARACTER_WIDTH, CHARACTERS_PER_LINE_POOL, POOL_HEADER_HEIGHT } from "../utils/Shared"
import { HISTORY_REDO, HISTORY_UNDO, TierlistContext, WIPE_DATA, type TierlistContextType } from "../context/TierlistContext"
import { useContext, useEffect, useRef, useState } from "react"
import Import from "./Import"
import Export from "./Export"
import { UndoIcon } from "../svg/UndoIcon"
import { RedoIcon } from "../svg/RedoIcon"
import { TrashIcon } from "../svg/TrashIcon"
import { ImageEditContext, type ImageEditContextType } from "../context/ImageEditContext"


// Import/Export Panel
function Panel()
{
    // Retrieve Tierlist state and Image Edit Mode from Context
    const {tierlist, dispatch} = useContext(TierlistContext) as TierlistContextType
    const {imageEditMode, toggleImageEditMode} = useContext(ImageEditContext) as ImageEditContextType

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
                    <Import animate = {animate} triggerAnimation = {triggerAnimation} />
                    <Export animate = {animate} />
                </div>
            </div>

            <div
                className = "closeHandle"
                style={{ height: POOL_HEADER_HEIGHT + 8 }}
                >
                <div className = "footerIcons">
                    <button className = "iconButton"
                            onClick = {() => dispatch({type: HISTORY_UNDO})}
                            disabled = {tierlist.past.length == 0}>
                        <UndoIcon />
                    </button>

                    <button className = "iconButton"
                            onClick = {() => dispatch({type: HISTORY_REDO})}
                            disabled = {tierlist.future.length == 0}>
                        <RedoIcon />
                    </button>

                    <button className = "iconButton danger" onClick = {() => dispatch({type: WIPE_DATA})}>
                        <TrashIcon />
                    </button>
                </div>

                <button
                    className="togglePool"
                    onClick={() => setOpen(!isOpen)}
                />

                <div className = "footerImageEdit">
                    <span className = "regularText">Mode Édition d'Image</span>
                    <label className = "editToggle">
                        <input type = "checkbox"
                            checked = {imageEditMode}
                            onChange = {toggleImageEditMode}
                        />
                        <span className = "slider"/>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default Panel