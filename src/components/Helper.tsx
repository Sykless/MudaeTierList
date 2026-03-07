import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast";
import { IMPORT_HELPER, EXPORT_HELPER } from "../utils/Shared";

const HELPER_WIDTH = 660
const IMPORT_HELPER_SCREENSHOT_PATH = "mudae-import.png"
const EXPORT_HELPER_SCREENSHOT_PATH = "mudae-export.png"

type HelperProperties = {
    helperType: string
}

function Helper({helperType}: HelperProperties) {
    const [isOpen, setOpen] = useState(false)
    const [isFixed, setFixed] = useState(false)
    const [position, setPosition] = useState({ top: 0, right: 0 })
    const buttonRef = useRef<HTMLButtonElement>(null)
    const helperRef = useRef<HTMLDivElement>(null)
    const hoverTimeoutRef = useRef<number>(undefined)
    
    // Clicking info button makes helper fixed, or closes it if already fixed
    const togglePopover = () =>
    {
        if (isFixed) {
            setFixed(false)
            setOpen(false)
        }
        else {
            setFixed(true)
        }
    }

    // Open helper as long as cursor is on info button or helper
    const openHelper = () => {
        clearTimeout(hoverTimeoutRef.current)
        setOpen(true)
    }

    // Close helper if not fixed and cursor away for 100ms
    const closeHelper = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setOpen(isFixed)
        }, 100)
    }

    // Copy Discord command to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText("$mmsi-");
            toast.success("Commande copiée", {"duration": 1000});
        } catch (err) {
            toast.error("Erreur dans la copie " + err);
        }
    }

    // Close helper when clicking outside
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: any) => {
            if (!helperRef?.current?.contains(event.target) && !buttonRef?.current?.contains(event.target)) {
                setFixed(false)
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {document.removeEventListener("mousedown", handleClickOutside)}
    }, [isOpen])

    // Set helper position according to info button position
    useEffect(() => {
        if (!isOpen)
            return

        const buttonRect = buttonRef?.current?.getBoundingClientRect()
        const margin = 12

        if (buttonRect) {
            let right = buttonRect.left - margin
            let top = buttonRect.top

            if (right - HELPER_WIDTH < 0) {
                right = buttonRect.left + HELPER_WIDTH + margin
            }

            setPosition({ top: top + window.scrollY, right: right + window.scrollX })
        }
    }, [isOpen])

    return (
        <>
            <button ref = {buttonRef} className = "infoButton"
                onClick = {togglePopover}
                onMouseEnter = {openHelper}
                onMouseLeave = {closeHelper}
            >
                ?
            </button>

            {/* Open Helper on document body */}
            {isOpen && createPortal(
                <div ref = {helperRef} className = "helper"
                    onMouseEnter = {openHelper} onMouseLeave = {closeHelper}             
                    style = {{
                        width: HELPER_WIDTH,
                        top: position.top,
                        left: position.right - HELPER_WIDTH
                    }}
                >
                    {/* Display Mudae Import helper */}
                    {helperType == IMPORT_HELPER &&
                        <>
                            <div className = "helperTitle">
                                Import Mudae
                            </div>

                            <div className = "helperText">
                                Lancez la commande
                                <span className = "inlineCommand" onClick = {copyToClipboard}>
                                    $mmsi-
                                </span>
                                dans le serveur Discord pour recevoir la liste des personnages par message privé :
                            </div>

                            <img src = {IMPORT_HELPER_SCREENSHOT_PATH}
                                alt = "Mudae Import"
                                className = "helperImage"
                            />

                            <div className = "helperText secondary">
                                Copier ensuite l'intégralité des personnages dans le formulaire et cliquer sur
                                <span className = "textButton">Import</span>
                            </div>
                        </>    
                    }

                    {/* Display Mudae Export helper */}
                    {helperType == EXPORT_HELPER &&
                        <>
                            <div className = "helperTitle">
                                Export Mudae
                            </div>

                            <div className = "helperText">
                                Cliquer sur 
                                <span className = "textButton">Export</span>
                                pour générer la commande Discord de tri des personnages
                            </div>

                            <img src = {EXPORT_HELPER_SCREENSHOT_PATH}
                                alt = "Mudae Export"
                                className = "helperImage"
                            />

                            <div className = "helperText secondary">
                                Copier puis lancer la commande sur le serveur Discord pour réorganiser les personnages
                            </div>
                        </>
                    }
                </div>,document.body
            )}
        </>
    )
}

export default Helper