import { DiscordIcon } from "../svg/DiscordIcon"
import { FileIcon } from "../svg/FileIcon"
import { ImageIcon } from "../svg/ImageIcon"
import { appendJsonToPng, captureTierlist, downloadFile, unproxifyImageUrl } from "../Utils"
import type { CharacterProperties } from "./Character"
import type { TierProperties } from "./Tier"

type ExportProperties = {
    tiers: TierProperties[]
    pool: CharacterProperties[]
}

// Export tierlist to Mudae, an image or a json backup file
function Export({tiers, pool}: ExportProperties)
{
    function getJSONData() {
        const saveFile = {
            app: "Mudae Tierlist",
            version: 1,
            createdAt: new Date().toISOString(),
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
                <div className = "panelBlock smallBlock exportAction" onClick = {exportPNG}>
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