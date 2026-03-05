import { useState } from "react"
import { TIER_COLORS } from "../utils/Shared";

type ColorPickerProperties = {
    currentColor: string,
    onChange: (color: string) => void;
}

const RADIUS = 60

function ColorPicker({ currentColor, onChange }: ColorPickerProperties) {
    const [open, setOpen] = useState(false)

    return (
        <div className = "colorPickerWrapper">
            <button
                className = "mainColorButton"
                style = {{ backgroundColor: currentColor }}
                onClick = {() => setOpen(!open)}
            />

            {/* Opens color picker and 12 color buttons */}
            {open && <div className = "colorRadialMenu">
                {TIER_COLORS.map((color, index) => {
                    const angle = (360 / TIER_COLORS.length) * index
                    const x = Math.cos(angle * Math.PI / 180 - 45) * RADIUS
                    const y = Math.sin(angle * Math.PI / 180 - 45) * RADIUS

                    return (
                        <button key = {color}
                            className = "radialColor"
                            style = {{
                                backgroundColor: color,
                                transform: `translate(${x}px, ${y}px)`
                            }}
                            onClick = {() => {
                                onChange(color)
                                setOpen(false)
                            }}
                        />
                    )
                })}
            </div>}
        </div>
    )
}

export default ColorPicker