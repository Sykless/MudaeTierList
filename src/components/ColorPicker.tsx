import { useEffect, useRef, useState } from "react"
import { TIER_COLORS } from "../utils/Shared";

type ColorPickerProperties = {
    currentColor: string,
    onChange: (color: string) => void;
}

const RADIUS = 60

function ColorPicker({ currentColor, onChange }: ColorPickerProperties) {
    const [isOpen, setOpen] = useState(false)
    const colorPickerRef = useRef<HTMLDivElement>(null)

    // Close helper when clicking outside
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: any) => {
            if (!colorPickerRef?.current?.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {document.removeEventListener("mousedown", handleClickOutside)}
    }, [isOpen])

    return (
        <div className = "colorPickerWrapper">
            <button
                className = "mainColorButton"
                style = {{ backgroundColor: currentColor }}
                onClick = {() => setOpen(!isOpen)}
            />

            {/* Opens color picker and 12 color buttons */}
            {isOpen && <div ref = {colorPickerRef} className = "colorRadialMenu">
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