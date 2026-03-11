import { proxifyCharacterUrl, sanitizeName } from "./Shared";

async function parseHtml(characterUrl: string)
{
    // Retrieve html content from provided url
    const response = await fetch(proxifyCharacterUrl(characterUrl));
    const htmlContent = await response.text();

    // Parse html content as Document
    const parser = new DOMParser();
    return parser.parseFromString(htmlContent, "text/html");
}

function getCharacterUrl(characterTable: Element[], characterName: string) {
    for (const characterRow of characterTable)
    {
        // Retrieve all urls in the character row
        const urls = characterRow.querySelectorAll("td a");

        // Iterate on all urls to find character pages
        for (const url of urls) {
            const href = url.getAttribute("href") || "";
            const match = href.match(/\/character\/\d+\/([^\/]+)/);

            // Find a character url
            if (match) {
                const characterInUrl = sanitizeName(decodeURIComponent(match[1]));

                // Character url matches our character name, returns the url
                if (characterInUrl === sanitizeName(characterName)) {
                    return href
                };
            }
        }
    }

    // Default : no character found
    return null;
}

export async function fetchCharacterImages(characterName: string)
{
    // Call Mudae search API
    const mudaeSearchPage = await parseHtml("https://mudae.net/search?type=character&name=" + characterName)

    // Only one result : redirected to actual character page, return all images
    const characterImages = Array.from(mudaeSearchPage.querySelectorAll("#images img.charimage"));
    if (characterImages.length > 0) return characterImages;

    // Try to find provided character url in search table
    const characterTable = Array.from(mudaeSearchPage.querySelectorAll("#table tbody tr")).slice(0, 10);
    const characterUrl = getCharacterUrl(characterTable, characterName)

    // Found the character url : return all images in its page
    if (characterUrl) {
        const mudaeCharacterPage = await parseHtml("https://mudae.net" + characterUrl);
        return Array.from(mudaeCharacterPage.querySelectorAll("#images img.charimage"));;
    }

    // No images found
    return [];
} 