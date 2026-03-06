import { tier } from "./actions/tier"
import { importMudaeCharacters } from "./actions/import"
import { dragCharacter } from "./actions/drag"
import type { CharacterProperties } from "./components/Character"
import Pool from "./components/Pool"
import Panel from "./components/Panel"
import Tierlist from "./components/Tierlist"
import PreviewDragCharacter from "./preview/PreviewDragCharacter"
import PreviewSwapCharacter from "./preview/PreviewSwapCharacter"
import { CHARACTER, TIER, POOL, POOL_ID, TIER_COLORS, TIERLIST_STATE } from "./utils/Shared"
import { TierlistContext, TIER_UPDATE_ATTRIBUTES, TIER_INSERT, TIER_DELETE, TIER_MOVE, type TierlistAction, type TierlistProperties, IMPORT_MUDAE, IMPORT_BACKUP, DRAG_CHARACTER } from "./utils/Context"
import { findDroppable, isInRect, ScrollRemeasurer, simulateCharacterSwap } from "./utils/Droppable"

import { useEffect, useReducer, useRef } from "react"
import { DndContext, pointerWithin } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { Toaster } from "react-hot-toast";

function App()
{
    // Default state : empty pool and 10 empty tiers, or saved data if present
    const [tierlist, dispatch] = useReducer(tierlistReducer, {
        pool: [],
        tiers: ["S","A","B","C","D","E","F","G","H","I"].map((label, index) => ({
            id: index,
            label: label,
            color: TIER_COLORS[index],
            characters: [] as CharacterProperties[]
        }))},
        (initial) => {
            const saved = localStorage.getItem(TIERLIST_STATE);
            return saved ? JSON.parse(saved) : initial;
        }
    );

    // Reducer : apply tierlist state update logic depending on provided action
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

            default:
                return state;
        }
    }

    // Save Tierlist in localStorage after any modification
    useEffect(() => {
        localStorage.setItem(TIERLIST_STATE, JSON.stringify(tierlist))
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
                <Pool characters = {tierlist.pool} poolContentRef = {poolContentRef} />
            </TierlistContext.Provider>
        </DndContext>
    )
}

export default App