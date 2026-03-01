import { DiscordIcon } from "../svg/DiscordIcon"
import { FileIcon } from "../svg/FileIcon"
import { ImageIcon } from "../svg/ImageIcon"

// Export tierlist to Mudae, an image or a json backup file
function Export()
{
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
                <div className = "panelBlock smallBlock exportAction">
                    <FileIcon />
                    Export vers Fichier
                </div>
            </div>
        </div>
    )
}

export default Export