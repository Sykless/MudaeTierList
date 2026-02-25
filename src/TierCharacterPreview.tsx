import { CHARACTER_HEIGHT, CHARACTER_WIDTH } from "./Utils"

type TierCharacterPreviewProperties = {
    characterImage: string
}

// Preview character in target tier
function TierCharacterPreview({characterImage}: TierCharacterPreviewProperties)
{
    return (
        <img
            src = {characterImage}
            style = {{
                width: CHARACTER_WIDTH,
                height: CHARACTER_HEIGHT,
                opacity: 0.5
            }}
        />
    )
}

export default TierCharacterPreview