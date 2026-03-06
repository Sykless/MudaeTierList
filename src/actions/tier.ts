

import { arrayMove } from "@dnd-kit/sortable";
import { DOWNWARDS, UPWARDS } from "../utils/Shared";
import type { TierlistProperties } from "../utils/Context"

export const tier =
{
    // Update target tier with provided attributes
    updateAttributes(tierlist: TierlistProperties, tierId: number, attributes: {label? : string; color?: string}): TierlistProperties {
        return {...tierlist, tiers: 
            tierlist.tiers.map(tier =>
                tier.id === tierId
                    ? { ...tier, ...attributes }
                    : tier
            )
        };
    },

    // Insert tier below target tier with same color/label
    insert(tierlist: TierlistProperties, tierId: number): TierlistProperties {
        const tierPosition = tierlist.tiers.findIndex(tier => tier.id === tierId)
        const newTierId = Math.max(...tierlist.tiers.map(tier => tier.id)) + 1

        // Insert new tier in tierlist
        return {...tierlist, tiers: [
            ...tierlist.tiers.slice(0, tierPosition + 1),
            {
                id: newTierId,
                color: tierlist.tiers[tierPosition].color,
                label: tierlist.tiers[tierPosition].label,
                characters: []
            },
            ...tierlist.tiers.slice(tierPosition + 1)
        ]}
    },

    // Remove one tier and move its characters to pool
    delete(tierlist: TierlistProperties, tierId: number): TierlistProperties {
        const removedTier = tierlist.tiers.find(tier => tier.id === tierId);

        return (
        {
            // Put all characters from removed tier in the pool
            pool: [...tierlist.pool, ...(
                removedTier && removedTier.characters.length ? removedTier.characters : []
            )],

            // Return new tierlist without target tier
            tiers: [...tierlist.tiers.filter(tier => tier.id != tierId)]
        })
    },

    // Move a tier one position upwards or downwards
    move(tierlist: TierlistProperties, tierId: number, direction: number): TierlistProperties {
        const tierPosition = tierlist.tiers.findIndex(tier => tier.id === tierId)

        // Moving downwards : swap with tier position + 1
        if (direction == DOWNWARDS){
            return tierPosition === tierlist.tiers.length - 1 ? tierlist
                : {...tierlist, tiers: arrayMove(tierlist.tiers, tierPosition, tierPosition + 1)}
                
        }

        // Moving upwards : swap with tier position - 1
        if (direction == UPWARDS){
            return tierPosition === 0 ? tierlist
                : {...tierlist, tiers: arrayMove(tierlist.tiers, tierPosition, tierPosition - 1)}
                
        }

        // No direction provided : keep tierlist as is
        return tierlist;
    }
}

