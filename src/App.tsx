import { tier } from "./actions/tier"
import { importMudaeCharacters } from "./actions/import"
import { dragCharacter } from "./actions/drag"
import { redo, undo } from "./actions/history"
import type { CharacterProperties } from "./components/Character"
import Pool from "./components/Pool"
import Panel from "./components/Panel"
import Tierlist from "./components/Tierlist"
import PreviewDragCharacter from "./preview/PreviewDragCharacter"
import PreviewSwapCharacter from "./preview/PreviewSwapCharacter"
import { CHARACTER, TIER, POOL, POOL_ID, TIER_COLORS, TIERLIST_STATE } from "./utils/Shared"
import { TierlistContext, TIER_UPDATE_ATTRIBUTES, TIER_INSERT, TIER_DELETE, TIER_MOVE, type TierlistAction, type TierlistProperties, IMPORT_MUDAE, IMPORT_BACKUP, DRAG_CHARACTER, type TierlistHistoryProperties, type HistoryAction, HISTORY_REDO, HISTORY_UNDO, WIPE_DATA } from "./utils/Context"
import { findDroppable, isInRect, ScrollRemeasurer, simulateCharacterSwap } from "./utils/Droppable"

import { useEffect, useReducer, useRef } from "react"
import { DndContext, pointerWithin } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { Toaster } from "react-hot-toast";

// Default state : empty pool and 10 empty tiers
const INITIAL_TIERLIST: TierlistProperties = {
    pool: [],
    tiers: ["S","A","B","C","D","E","F","G","H","I"].map((label, index) => ({
        id: index,
        label,
        color: TIER_COLORS[index],
        characters: [] as CharacterProperties[]
    }))
};

function App()
{
    // Create main tierlist state
    const [tierlist, dispatch] = useReducer(historyReducer, null, () =>
    {
        // Retrieve tierlist saved data if present
        try {
            const savedData = localStorage.getItem(TIERLIST_STATE);
            const currentTierlist = savedData ? JSON.parse(savedData) : INITIAL_TIERLIST;
            return { past: [], present: currentTierlist, future: []};
        }
        catch {
            return {past: [], present: INITIAL_TIERLIST, future: []};
        }
    });

    // History reducer : undo/redo action or perform regular tierlist update
    function historyReducer(state: TierlistHistoryProperties, action: HistoryAction): TierlistHistoryProperties {
        switch (action.type)
        {
            case HISTORY_UNDO:
                return undo(state);

            case HISTORY_REDO:
                return redo(state);

            // Regular tierlist action - clear future and set present
            default:
                const updatedTierlist = tierlistReducer(state.present, action);

                // No update was performed : keep same history state
                if (updatedTierlist === state.present)
                    return state;

                // Don't historise if tier label update was performed
                const noHistory = action.type == TIER_UPDATE_ATTRIBUTES && action.attributes;

                return {
                    past: noHistory ? state.past : [...state.past, state.present],
                    present: updatedTierlist,
                    future: []
                };
        }
    }

    // Apply tierlist state update logic depending on provided action
    function tierlistReducer(state: TierlistProperties, action: TierlistAction): TierlistProperties {
        switch (action.type)
        {
            case DRAG_CHARACTER:
                return dragCharacter(state, action.event)

            case TIER_UPDATE_ATTRIBUTES:
                return tier.updateAttributes(state, action.tierId, action.attributes);

            case TIER_INSERT:
                return tier.insert(state, action.tierId);

            case TIER_DELETE:
                return tier.delete(state, action.tierId);

            case TIER_MOVE:
                return tier.move(state, action.tierId, action.direction);

            case IMPORT_MUDAE:
                return importMudaeCharacters(state, action.importedCharacters);

            case IMPORT_BACKUP:
                return {pool: action.pool, tiers: action.tiers}

            case WIPE_DATA:
                return INITIAL_TIERLIST

            default:
                return state;
        }
    }

    // Save Tierlist in localStorage after any modification
    useEffect(() => {
        localStorage.setItem(TIERLIST_STATE, JSON.stringify(tierlist.present))
    }, [tierlist])
    
    // Called after a character is dropped
    function handleDragEnd(event: DragEndEvent) {
        dispatch({type: DRAG_CHARACTER, event: event})
    }

    // Keep Pool ref for collision detection algorithm
    const poolContentRef = useRef<HTMLDivElement | null>(null)
    
    // Render app 
    return (
        <DndContext
            autoScroll = {false}
            onDragEnd = {handleDragEnd}
            collisionDetection = {(args) => {
                const { pointerCoordinates } = args;
                const collisions = pointerWithin(args) 
                const droppableCharacter = findDroppable(collisions, CHARACTER)
                const droppablePool = findDroppable(collisions, POOL)
                const droppableTier = findDroppable(collisions, TIER)
                const targetCharacterTierId = droppableCharacter[0]?.data?.droppableContainer?.data.current.character.tierId;

                // Cursor in pool, drop priority : pool character -> pool
                if (isInRect(pointerCoordinates, poolContentRef?.current?.getBoundingClientRect())){
                    if (targetCharacterTierId == POOL_ID)
                        return droppableCharacter;
                    else if (droppablePool.length)
                        return simulateCharacterSwap(droppablePool, args);
                }
                // Cursor not in pool, drop priority : tier character -> tier
                else if (targetCharacterTierId > POOL_ID) return droppableCharacter;
                else if (droppableTier.length) return simulateCharacterSwap(droppableTier, args);
                
                // None of the controlled cases : return no droppable found
                return [];
            }}>

            {/* Helpers */}
            <PreviewDragCharacter />
            <PreviewSwapCharacter />
            <ScrollRemeasurer />
            <Toaster toastOptions = {{style: {
                background: "#1e1e1e",
                color: "#9D9D9D",
            }}} />

            {/* Displayed components */}
            <TierlistContext.Provider value = {{tierlist, dispatch}}>
                <Panel />
                <Tierlist />
                <Pool characters = {tierlist.present.pool} poolContentRef = {poolContentRef} />
            </TierlistContext.Provider>
        </DndContext>
    )
}

export default App
