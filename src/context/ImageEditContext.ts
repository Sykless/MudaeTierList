import { createContext } from "react"

export type ImageEditContextType = {
    imageEditMode: boolean
    toggleImageEditMode: () => void
}

export const ImageEditContext = createContext<ImageEditContextType | null>(null)