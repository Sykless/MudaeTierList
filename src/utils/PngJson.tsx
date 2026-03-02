// @ts-ignore
import domtoimage from 'dom-to-image-more'; // Does not ship its type, ignore generated warning

const PNG_JSON_MARKER = "MUDAE_TIERLIST_JSON_START"

// Screenshot tierlist and return as blob
export async function captureTierlist(): Promise<Blob> {
    const element = document.querySelector(".tierlist") as HTMLElement;
    const rect = element.getBoundingClientRect();

    // Convert cloned tierlist to PNG using dom-to-image-more
    const dataUrl = await domtoimage.toPng(element, {
        width: rect.width,
        height: rect.height,
        bgcolor: "#1e1e1e",
        cacheBust: true,
        skipFonts: true,
        style: {
            margin: "0",
        }
    });

    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    return await response.blob();
}

// Edit PNG file to add json data in it
export async function appendJsonToPng(pngBlob: Blob, jsonData: string): Promise<Blob> {
    const pngBuffer = await pngBlob.arrayBuffer()

    const encoder = new TextEncoder()
    const jsonBytes = encoder.encode(jsonData)
    const marker = encoder.encode("\n" + PNG_JSON_MARKER + "\n")

    const combined = new Uint8Array(
        pngBuffer.byteLength + marker.byteLength + jsonBytes.byteLength
    )

    combined.set(new Uint8Array(pngBuffer), 0)
    combined.set(marker, pngBuffer.byteLength)
    combined.set(jsonBytes, pngBuffer.byteLength + marker.byteLength)

    return new Blob([combined], { type: "image/png" })
}

// Find JSON Marker index in json bytes
function findMarkerIndex(bytes: Uint8Array, marker: Uint8Array): number {
    for (let i = 0; i <= bytes.length - marker.length; i++) {
        let found = true;
        for (let j = 0; j < marker.length; j++) {
            if (bytes[i + j] !== marker[j]) {
                found = false;
                break;
            }
        }
        if (found) return i;
    }
    return -1;
}

// Extract JSON data in PNG file
export async function extractJsonFromPng(dataUrl: string): Promise<string | null> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Assume JSON is after a known marker at the end of the PNG
    const marker = new TextEncoder().encode(PNG_JSON_MARKER);
    const markerIndex = findMarkerIndex(bytes, marker)
    if (markerIndex === -1) return null;

    // Convert JSON bytes to string
    const jsonBytes = bytes.slice(markerIndex + marker.length);
    const decoder = new TextDecoder();
    return decoder.decode(jsonBytes);
}

// Download file from provided blob content
export function downloadFile(fileName: string, file: Blob)
{
    // Create link from file contents
    const url = URL.createObjectURL(file)
    const link = document.createElement("a")

    // Simulate click on generated link
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
}