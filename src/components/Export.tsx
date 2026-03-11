
import { DiscordIcon } from "../svg/DiscordIcon"
import { FileIcon } from "../svg/FileIcon"
import { ImageIcon } from "../svg/ImageIcon"
import { CheckmarkIcon } from "../svg/CheckmarkIcon"
import { CopyIcon } from "../svg/CopyIcon"
import { appendJsonToPng, captureTierlist, downloadFile } from "../utils/PngJson"
import { EXPORT_HELPER } from "../utils/Shared"
import { TierlistContext, type TierlistContextType } from "../context/TierlistContext"

import Helper from "./Helper"
import { useContext, useState } from "react"
import toast from "react-hot-toast"

type ExportProperties = {
    animate: boolean;
}

// Export tierlist to Mudae, an image or a json backup file
function Export({animate}: ExportProperties)
{
    // Retrieve Tierlist state from Context
    const {tierlist} = useContext(TierlistContext) as TierlistContextType

    // Default state : empty export box
    const [exportText, setExportText] = useState("")
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (!exportText) return

        try {
            await navigator.clipboard.writeText(exportText)
            toast.success("Commande copiée", {"duration": 1000});
            
            // Update copy icon
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
        } catch (err) {
            toast.error("Erreur dans la copie " + err)
        }
    }

    function getJSONData() {
        const saveFile = {
            app: "Mudae Tierlist",
            version: 1,
            createdAt: new Date().toISOString(),
            tiers: tierlist.present.tiers,
            pool: tierlist.present.pool
        }

        return JSON.stringify(saveFile, null, 2);
    } 

    function exportJSON()
    {
        // Convert tiers/pool data to json
        const jsonString = getJSONData()
        const blob = new Blob([jsonString], { type: "application/json" })

        // Download json data as json file
        downloadFile("MudaeTierlist-" + new Date().toISOString() + ".json", blob)
    }

    async function exportPNG() {
        const jsonData = getJSONData()

        // Capture screenshot of tierlist
        const pngBlob = await captureTierlist()

        // Add json data at the end of png file
        const finalBlob = await appendJsonToPng(pngBlob, jsonData)

        // Download final png + json file data
        downloadFile("MudaeTierlist-" + new Date().toISOString() + ".png", finalBlob)
    }

    function exportMudae() {
        let mudaeCommand = "$sortmarry "

        // Add each character in order to the command
        tierlist.present.tiers.forEach(tier => {
            tier.characters.forEach(character => {
                mudaeCommand += character.name + " $ "
            })
        })

        // Add pool characters at the bottom of the command
        tierlist.present.pool.forEach(character => {
            mudaeCommand += character.name + " $ "
        })

        // Set command text to Export textbox
        setExportText(mudaeCommand.includes(" $ ") ? mudaeCommand.slice(0,-3) : "")
    }

    return (
        <div className = "exportSection">
            <div className = "sectionTitle">Export</div>
    
            {/* Mudae Export */}
            <div className = "panelBlock largeBlock">
                <div className = "blockHeader">
                    <span className = "labelWithIcon">
                        <DiscordIcon />
                        Export vers Mudae
                    </span>
                    <Helper helperType = {EXPORT_HELPER} />
                </div>

                <button className = "primaryButton" onClick = {exportMudae}
                    disabled = {!tierlist.present.tiers.some(tier => tier.characters.length) && !tierlist.present.pool.length}>
                    Export
                </button>

                <div className="exportTextboxWrapper">
                    <textarea className="exportTextbox" readOnly
                        value = {exportText}
                        disabled = {exportText.length == 0}
                    />

                    {exportText.length > 0 && (
                        <button className = {`copyButton ${copied ? "copied" : ""}`} onClick = {handleCopy}>
                            {copied ? <CheckmarkIcon /> : <CopyIcon />}
                        </button>
                    )}
                </div>
            </div>

            {/* Image/File Export */}
            <div className = {`panelRow ${animate ? "highlightRow" : ""}`}>

                {/* Image Export */}
                <div className = "panelBlock smallBlock exportAction" onClick = {exportPNG}>
                    <ImageIcon />
                    Export vers Screenshot
                </div>

                {/* File Export */}
                <div className = "panelBlock smallBlock exportAction" onClick = {exportJSON}>
                    <FileIcon />
                    Export vers Backup
                </div>
            </div>
        </div>
    )
}

export default Export