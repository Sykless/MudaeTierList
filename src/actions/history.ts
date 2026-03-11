import type { TierlistHistoryProperties } from "../context/TierlistContext";

export function undo(tierlist: TierlistHistoryProperties): TierlistHistoryProperties {
    if (tierlist.past.length === 0)
        return tierlist;

    const previous = tierlist.past[tierlist.past.length - 1];

    return {
        past: tierlist.past.slice(0,-1),
        present: previous,
        future: [tierlist.present, ...tierlist.future]
    };
}

export function redo(tierlist: TierlistHistoryProperties): TierlistHistoryProperties {
    if (tierlist.future.length === 0)
        return tierlist;

    const next = tierlist.future[0];

    return {
        past: [...tierlist.past, tierlist.present],
        present: next,
        future: tierlist.future.slice(1)
    };
}