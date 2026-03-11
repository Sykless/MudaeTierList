import { useContext, useEffect, useState } from "react"
import { CHARACTER_HEIGHT, CHARACTER_WIDTH, proxifyImageUrl } from "../utils/Shared"
import { fetchCharacterImages } from "../utils/HtmlParse"
import { DiscordIcon } from "../svg/DiscordIcon"
import toast from "react-hot-toast"
import { TierlistContext, UPDATE_CHARACTER_IMAGE, type TierlistContextType } from "../context/TierlistContext"

type Props = {
    name: string
    onClose: () => void
}

export default function ImagePicker({ name, onClose }: Props)
{
    // Retrieve Tierlist state from Context
    const {dispatch} = useContext(TierlistContext) as TierlistContextType

    const [loading, setLoading] = useState(true)
    const [timeoutReached, setTimeoutReached] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [command, setCommand] = useState<string>("")

    useEffect(() => {
        setLoading(true)
        setTimeoutReached(false)

        // No response after 7 seconds : display error
        const timer = setTimeout(() => {
            setTimeoutReached(true)
        }, 7000)

        // Retrieve characters images from Mudae api
        fetchCharacterImages(name).then((characterImages) => {
            clearTimeout(timer)
            setLoading(false)

            // Found character images : display them
            if (characterImages.length) {
                setImages(characterImages.map(img => img.getAttribute("src"))
                    .filter((src): src is string => src !== null))
            }
            else {
                setTimeoutReached(true)
            }
        })

        return () => clearTimeout(timer)
    }, [name])

    async function handleCopy(text: string) {
        try {
            await navigator.clipboard.writeText(text)
            toast.success("Commande copiée", {"duration": 2000});
        } catch (err) {
            toast.error("Erreur dans la copie " + err)
        }
    }

    async function onSelect(imageId: number, imageUrl: string)
    {
        // Update character image in the tierlist
        dispatch({type: UPDATE_CHARACTER_IMAGE, characterName: name, image: proxifyImageUrl(imageUrl)})

        // Generate command to update character on Discord
        const command = "$changeimg " + name + " $" + imageId
        setCommand(command)
        handleCopy(command)
    }

    return (
        <div className = "pickerOverlay" onClick = {onClose}>
            <div className = "pickerWindow" onClick = {(e) => e.stopPropagation()}>
                <div className = "pickerHeader">
                    <div className = "pickerCharacterName">
                        {name}
                    </div>

                    <div className = {`pickerCommand ${command ? "hovered" : ""}`}>
                        <DiscordIcon />

                        <div className = "pickerCommandText" onClick = {() => command ? handleCopy(command) : {}} >
                            {command || <span className="pickerCommandPlaceholder">Commande Discord de changement d'image...</span>}
                        </div>
                    </div>
                </div>
                
                <div className = "pickerGrid" style = {{width: 10 * 1.75 * CHARACTER_WIDTH + 9 * 12}}>

                    {loading && !timeoutReached && (
                        <div className="pickerLoading">Chargement des images...</div>
                    )}

                    {timeoutReached && (
                        <div className="pickerError">
                            Allo je me suis fait ban de Mudae ou leur site marche pas ?

                            <div className="pickerErrorLink">
                                <a href = {"https://mudae.net/search?type=character&name=" + name} target="_blank" rel="noopener noreferrer">
                                    {"https://mudae.net/search?type=character&name=" + name}
                                </a>
                            </div>
                        </div>
                    )}

                    {!loading && images.map((src, index) => (
                        <img id = {`characterimage-${index + 1}`} className = "pickerImage" loading = "lazy"
                            width = {1.75 * CHARACTER_WIDTH} height = {1.75 * CHARACTER_HEIGHT}
                            src = {proxifyImageUrl(src)} key = {src}
                            onClick = {() => onSelect(index + 1, src)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}