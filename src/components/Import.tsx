import { IMPORT_HELPER, POOL_ID, proxifyImageUrl } from "../utils/Shared"
import { TierlistContext, IMPORT_MUDAE, IMPORT_BACKUP, type TierlistContextType } from "../utils/Context"

import { extractJsonFromPng } from "../utils/PngJson"
import { DiscordIcon } from "../svg/DiscordIcon"
import { FileIcon } from "../svg/FileIcon"
import { ImageIcon } from "../svg/ImageIcon"
import Helper from "./Helper"
import type { CharacterProperties } from "./Character"
import type { TierProperties } from "./Tier"

import { useContext, useRef, useState } from "react"
import toast from "react-hot-toast";

const PLACEHOLDER = 
`Itachi Uchiha - https://mudae.net/uploads/4336306/GkQ3Z2Y~sXzj0EE.gif
Tae Takemi - https://mudae.net/uploads/3265646/BGNJdph~KD4MBL5.png
Nico Robin - https://mudae.net/uploads/2705427/WJHPv0S~CfDP3Rd.png
Yennefer - https://mudae.net/uploads/9350707/PAoDW0_~oI1J2Nl.png
...`

type ImportProperties = {
    animate: boolean
    triggerAnimation: () => void;
}

function Import({ animate, triggerAnimation }: ImportProperties)
{
    // Retrieve Tierlist state from Context
    const {dispatch} = useContext(TierlistContext) as TierlistContextType

    const [importText, setImportText] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Import characters from Mudae characters list
    function handleMudaeImport() {
        const lines = importText.split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)

        const importedCharacters: CharacterProperties[] = []

        // Iterate over Mudae export and retrieve name and image url
        for (const line of lines) {
            const parts = line.split(" - https://")

            // Invalid format, skip line
            if (parts.length !== 2)
                continue

            const name = parts[0].replace(/ \| .*/, '').trim(); // Remove aliases
            const imageUrl = parts[1].trim()

            // Empty name or url, skip line
            if (!name || !imageUrl)
                continue

            // Add character in pool
            importedCharacters.push({
                name,
                image: proxifyImageUrl("https://" + imageUrl),
                tierId: POOL_ID
            })
        }

        if (importedCharacters.length === 0) return

        // Update pool in main App
        dispatch({type: IMPORT_MUDAE, importedCharacters: importedCharacters})
        setImportText("")
        toast.success("Données importées")
    }

    // Import characters from previously generated PNG/JSON backup
    function handleBackupImport(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        // Only read JSON and PNG files
        if (file.name.endsWith(".json") || file.name.endsWith(".png")) {
            reader.onload = async () =>
            {
                try {
                    // PNG file provided, retrieve JSON data in it
                    const fileData = file.name.endsWith(".png")
                        ? await extractJsonFromPng(reader.result as string)
                        : reader.result as string;

                    if (!fileData) throw new Error()

                    // Parse JSON data to tiers/pool objects
                    const jsonData = JSON.parse(fileData)
                    const backupData = "tiers" in jsonData && "pool" in jsonData ?
                        jsonData as {tiers: TierProperties[], pool: CharacterProperties[]} : undefined

                    if (!backupData) throw new Error()

                    // Update pool and tiers in main App
                    dispatch({type: IMPORT_BACKUP, pool: backupData.pool, tiers: backupData.tiers})
                    toast.success("Données importées")
                }
                catch (e) {
                    toast.error("Format incorrect, merci d'utiliser l'import Mudae ou un fichier de la section Export", {"duration": 6000})
                    triggerAnimation()
                }
                finally {
                    event.target.value = ""; // Clear input
                }
            };

            // Read data differently if backup file is json or png
            if (file.name.endsWith(".png")) {
                reader.readAsDataURL(file);
            }
            else if (file.name.endsWith(".json")) {
                reader.readAsText(file);
            }
        }
        else {
            toast.error("Les seuls fichiers pris en compte sont de type .png ou .json");
        }
    }

    return (
        <div className = "importSection">
            <div className = "sectionTitle">Import</div>

            {/* Mudae Import */}
            <div className = {`panelBlock largeBlock importBlock ${animate ? "highlightRow" : ""}`}>
                <div className = "blockHeader">
                    <span className = "labelWithIcon">
                        <DiscordIcon />
                        Import depuis Mudae
                    </span>
                    <Helper helperType = {IMPORT_HELPER}/>
                </div>

                <textarea className = "importTextbox"
                    value = {importText}
                    onChange = {(e) => setImportText(e.target.value)}
                    placeholder = {PLACEHOLDER} />

                <button className = "primaryButton" onClick = {handleMudaeImport}>
                    Import
                </button>
            </div>

            {/* File Import */}
            <div className = "fileImportRow">
                <span className = "labelWithIcon">
                    <ImageIcon />
                    /
                    <FileIcon />
                    Import depuis Screenshot ou Backup
                </span>

                <input
                    type = "file"
                    accept = ".json,.png"
                    style = {{display: "none"}}
                    ref = {fileInputRef}
                    onChange = {handleBackupImport}
                />
                <button className = "secondaryButton" onClick={() => fileInputRef.current?.click()}>
                    Parcourir...
                </button>
            </div>
        </div>
    )
}

export default Import