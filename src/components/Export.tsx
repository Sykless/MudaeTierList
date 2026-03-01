import { DiscordIcon } from "../svg/DiscordIcon"
import { FileIcon } from "../svg/FileIcon"
import { ImageIcon } from "../svg/ImageIcon"
import { unproxifyImageUrl } from "../Utils"
import type { CharacterProperties } from "./Character"
import type { TierProperties } from "./Tier"

type ExportProperties = {
    tiers: TierProperties[]
    pool: CharacterProperties[]
}

// Export tierlist to Mudae, an image or a json backup file
function Export({tiers, pool}: ExportProperties)
{
    function exportJSON() {
        const timestamp = new Date().toISOString()
        const saveFile = {
            app: "Mudae Tierlist",
            version: 1,
            createdAt: timestamp,
            // Export tiers data while removing proxy url
            tiers: tiers.map(tier => {
                return {...tier, characters: tier.characters.map(character => {
                    return {...character, image: unproxifyImageUrl(character.image)}
                })}
            }),
            // Export pool data while removing proxy url
            pool: pool.map(character => {
                return {...character, image: unproxifyImageUrl(character.image)}
            })
        }

        // Convert tiers/pool data to json
        const jsonString = JSON.stringify(saveFile, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        // Download json data as json file
        const link = document.createElement("a")
        link.href = url
        link.download = "MudaeTierlist-" + timestamp + ".json"
        link.click()
        URL.revokeObjectURL(url)
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
                    <button className = "infoButton">?</button>
                </div>

                <button className = "primaryButton">Export</button>
                <textarea className = "exportTextbox" disabled />
            </div>

            {/* Image/File Export */}
            <div className = "panelRow" >

                {/* Image Export */}
                <div className = "panelBlock smallBlock exportAction">
                    <ImageIcon />
                    Export vers Image
                </div>

                {/* File Export */}
                <div className = "panelBlock smallBlock exportAction" onClick = {exportJSON}>
                    <FileIcon />
                    Export vers Fichier
                </div>
            </div>
        </div>
    )
}

export default Export