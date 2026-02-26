import { CHARACTER_HEIGHT, CHARACTER_WIDTH } from "../Utils"

type PreviewTierCharacterProperties = {
    characterImage: string
}

// Preview character in target tier
function PreviewTierCharacter({characterImage}: PreviewTierCharacterProperties)
{
    return (
        <img src = {characterImage}
            style = {{
                width: CHARACTER_WIDTH,
                height: CHARACTER_HEIGHT,
                opacity: 0.4
            }}
        />
    )
}

export default PreviewTierCharacter