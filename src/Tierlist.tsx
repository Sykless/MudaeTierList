import type { TierProperties } from "./Tier";
import Tier from "./Tier";

type TierlistProperties = {
    tiers: TierProperties[]
}

// Preview character in target tier
function Tierlist({tiers} : TierlistProperties)
{
    return (
        <div className = "tierlist">
            {tiers.map((tier) => (
                <Tier key = {tier.id}
                    id = {tier.id} 
                    label = {tier.label}
                    color = {tier.color}
                    characters = {tier.characters} />
            ))}
        </div>
    )
}

export default Tierlist