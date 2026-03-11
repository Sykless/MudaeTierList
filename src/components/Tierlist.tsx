import Tier from "./Tier";
import { TierlistContext, type TierlistContextType } from "../context/TierlistContext";
import { useContext } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";

// Preview character in target tier
function Tierlist()
{
    // Retrieve Tierlist state from Context
    const {tierlist} = useContext(TierlistContext) as TierlistContextType

    // Use Flipper to auto-animate tier add/remove/swap
    return (
        <Flipper className = "tierlist" flipKey = {tierlist.present.tiers.map(tier => tier.id).join()}>
            {tierlist.present.tiers.map((tier) => (
                <Flipped key = {tier.id} flipId = {tier.id}>
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