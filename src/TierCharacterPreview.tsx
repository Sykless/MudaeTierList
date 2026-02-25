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
                width: 72,
                height: 112,
                opacity: 0.5
            }}
        />
    )
}

export default TierCharacterPreview