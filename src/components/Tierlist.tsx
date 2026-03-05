import { Flipped, Flipper } from "react-flip-toolkit";
import type { TierProperties } from "./Tier";
import Tier from "./Tier";

type TierlistProperties = {
    tiers: TierProperties[]
}

// Preview character in target tier
function Tierlist({tiers} : TierlistProperties)
{
    // Use Flipper to auto-animate tier add/remove/swap
    return (
        <Flipper className = "tierlist" flipKey={tiers.map(t => t.id).join()}>
            {tiers.map((tier) => (
                <Flipped key={tier.id} flipId={tier.id}>
                    <div>
                        <Tier key = {tier.id}
                            id = {tier.id} 
                            label = {tier.label}
                            color = {tier.color}
                            characters = {tier.characters} />
                    </div>
                </Flipped>
            ))}
        </Flipper>
    )
}

export default Tierlist