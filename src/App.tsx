import Character, { type CharacterProperties } from "./Character"

import { useEffect, useRef, useState } from "react"
import { DndContext, DragOverlay, useDroppable, rectIntersection, useDndContext } from "@dnd-kit/core"
import type { CollisionDetection, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"

const TIERS_LABELS = ["S","A","B","C","D","E","F","G","H","I"]
const COLORS = [
  "#ff595e",
  "#ff924c",
  "#ffca3a",
  "#c5ca30",
  "#8ac926",
  "#52b788",
  "#1982c4",
  "#4267ac",
  "#6a4c93",
  "#b5179e"
]

const INITIAL_CHARACTERS = "Itachi Uchiha - https://mudae.net/uploads/4336306/GkQ3Z2Y~sXzj0EE.gif" + "\nTae Takemi | My love - https://mudae.net/uploads/3265646/BGNJdph~KD4MBL5.png" + "\nSasori - https://mudae.net/uploads/3661665/MAUDvXx~Z8i5acH.png" + "\nShanks - https://mudae.net/uploads/3167820/GamnNwB~ajuItI3.png" + "\nAster Phoenix - https://mudae.net/uploads/1205751/NENq6fV~ndY9Vtg.png" + "\nAriel - https://mudae.net/uploads/3078400/zPFEDDL~szgCU1g.png" + "\nYennefer - https://mudae.net/uploads/9350707/PAoDW0_~oI1J2Nl.png" + "\nRadagon - https://mudae.net/uploads/7675404/hHJUzYL~5aBbANE.gif" + "\nAkinari Kamiki - https://mudae.net/uploads/1138587/t8xDayL~my8xc3636z4.png" + "\nFutaba Sakura - https://mudae.net/uploads/2588502/NWzbYU5~FINgYvy.gif" + "\nMinthara - https://mudae.net/uploads/2864108/AuC1ZB0~7kzcao8q6k7.png" + "\nProfessor Sycamore - https://mudae.net/uploads/6244503/MV2F_ov~JLVlkvB.png" + "\nMarnie - https://mudae.net/uploads/9592261/2UkWaLp~qS3xKl2.png" + "\nPhantom Aqua - https://mudae.net/uploads/2380369/Douk_Oc~X6u8BOC.png" + "\nCorbeau - https://mudae.net/uploads/8033785/DIIXdrx~CgZpsiI.png" + "\nLouis Guiabern - https://mudae.net/uploads/2398447/mSHr_jg~w7pjcell8e7.png" + "\nGin (Conan) - https://mudae.net/uploads/4216996/pyT6OQb~MbAJJOP.gif" + "\nTooru Amuro - https://mudae.net/uploads/9761722/sBXFNnL~4SYtbkN.gif" + "\nHermione Granger - https://mudae.net/uploads/3599793/Lv0aw9I~jjQmy3x.png" + "\nZelda (Child Timeline) - https://mudae.net/uploads/9131039/LSGmoWD~3i24rCC.png" + "\nPurah - https://mudae.net/uploads/6783833/T0j4ATd~j7mmc6joz57.png" + "\nMasumi Sera - https://mudae.net/uploads/5129975/QED-0S7~pcBKm7y.png" + "\nGrimm - https://mudae.net/uploads/2755186/U0Ix9e1~ztC8twb.gif" + "\nNami - https://mudae.net/uploads/1024687/_8ZQd56~myd5c3jonb4.gif" + "\nSpider-Gwen (Gwen Stacy) - https://mudae.net/uploads/4813920/OLUut5w~k46acvqzqr7.gif" + "\nGeralt of Rivia - https://mudae.net/uploads/3292204/1xd04iA~21YhyoZ.png" + "\nZinnia - https://mudae.net/uploads/8392428/otAnBRg~YFWx6qp.png" + "\nAsuka Tenjouin (ARC-V) - https://mudae.net/uploads/3955633/m1zdVam~fKLPMQL.gif" + "\nJesse Anderson - https://mudae.net/uploads/8341432/KRUoGkw~fWSCz0y.png" + "\nFabienne - https://mudae.net/uploads/2184487/gbMdJZ3~3yrgclqqwk4.png" + "\nLevi - https://mudae.net/uploads/4734160/YimSmO-~RswF7d0.gif" + "\nVanitas (KH) - https://mudae.net/uploads/7194876/2YCxbAS~odYU1e7gu.png" + "\nMewtwo - https://mudae.net/uploads/2711589/9kp8GcN~InWal9h.gif" + "\nStar and Stripe - https://mudae.net/uploads/4197752/9YRhWCE~kjvU5PE.png" + "\nChoso - https://mudae.net/uploads/5944933/vUCKTDa~345xckj8ko7.gif" + "\nSadayo Kawakami - https://mudae.net/uploads/8999983/krK2XRX~BpstD16.png" + "\nStrohl - https://mudae.net/uploads/8716235/dC3wfy1~lYq2g90.png" + "\nBlaidd - https://mudae.net/uploads/7821925/u9Ter6C~9bRgEVp.png" + "\nVinsmoke Reiju - https://mudae.net/uploads/1701589/zcmRRVE~875574140215.png" + "\nHendrik - https://mudae.net/uploads/5617054/aGT7IoH~IA5a6so.png" + "\nFox (TUNIC) - https://mudae.net/uploads/9471652/vfcoY3o~l7lxcke8a37.gif" + "\nLitten - https://mudae.net/uploads/3493744/39AJjZr~my2pcrxobb7.png" + "\nTarountula - https://mudae.net/uploads/7430619/JWQtSXT~nf4bzSD.png" + "\nEkans - https://mudae.net/uploads/1498785/dPdfaEK~JjJpBiA.png" + "\nRatha - https://mudae.net/uploads/2848283/dyl8Yky~y6INYzo.png" + "\nMystical Sand - https://mudae.net/uploads/9131063/6tR_vtp~b49zcvga5dy.png" + "\nLuna Lovegood - https://mudae.net/uploads/5991085/2LN4NdQ~RU2x51h.png" + "\nSirius Black - https://mudae.net/uploads/7797278/tej0Tzs~SUNtQ2V.png" + "\nAlluka Zoldyck - https://mudae.net/uploads/4882308/3Gicm78~pSJylvF.png" + "\nBlathers - https://mudae.net/uploads/5807233/fU3T9oY~x6KxDO7.png" + "\nAnkha - https://mudae.net/uploads/4168819/BKK0hGb~tgRPSno.png" + "\nRainbow Dash - https://mudae.net/uploads/6238269/gLnxzBY~OSXR3dX.png" + "\nChisato Dojima - https://mudae.net/uploads/9528534/ewPx94t~pEWfRkX.png" + "\nIsabelle - https://mudae.net/uploads/2847556/IdTVHo1~B0lWwmg.png" + "\nJaina Proudmoore - https://mudae.net/uploads/6166343/WHBJdE2~7uvFcSm.png" + "\nBiggs - https://mudae.net/uploads/5272032/LowX-4t~w7pjc5r6lx7.png" + "\nMeg - https://mudae.net/uploads/5058099/nviR6mA~s2fiPhD.png" + "\nAyane Matsunaga - https://mudae.net/uploads/3426484/vNM32XP~NRCVEDG.png" + "\nMomo Yaoyorozu - https://mudae.net/uploads/9151218/ZtDmvr_~q6v2TKj.png" + "\nJoel - https://mudae.net/uploads/7789897/VIKRb02~ye3c2g2ooj4.gif" + "\nGogeta - https://mudae.net/uploads/2978134/b8eB-7s~rkmDnl2.png" + "\nMitsuki Bakugou - https://mudae.net/uploads/1311894/Gzv8Vk7~VkVyxX7.png" + "\nGladion - https://mudae.net/uploads/7600236/io1AmFj~2hZAoX4.png" + "\nOrin the Red - https://mudae.net/uploads/5133704/7pkcbJU~JOZxdDh.png" + "\nIcy - https://mudae.net/uploads/5980217/0bV5Nct~zJZU06s.png" + "\nLysithea - https://mudae.net/uploads/7561508/rv-spPz~WfnfWVX.png" + "\nAgrat bat Mahlat - https://mudae.net/uploads/1981949/BGuWu-x~0jkOm5KzB.png" + "\nGardenia - https://mudae.net/uploads/2348014/919qPrp~OaOSjDVKu.png" + "\nSylvain - https://mudae.net/uploads/7566099/kLEiSbS~jqrW5DN.png" + "\nNeve Gallus - https://mudae.net/uploads/3313510/0oBu6oi~qHUYB9e.png" + "\nRebecca (OP) - https://mudae.net/uploads/1885609/-Gwj3Zl~OycXnU3.png" + "\nNarcissus - https://mudae.net/uploads/2372131/I5PUjxd~jObmk7y.png" + "\nDarth Vader - https://mudae.net/uploads/1440551/RfJlKu-~7lxcpnpblk7.png" + "\nAmpharos (PMD) - https://mudae.net/uploads/4277271/qi4W8oq~NhzFpkT.png" + "\nKing Dedede - https://mudae.net/uploads/4654590/roxG_ty~g5sAuiy.png" + "\nSanic - https://mudae.net/uploads/2873757/WKOttTO~7pjcqa6w2e7.png" + "\nKnuckles the Dread - https://mudae.net/uploads/1181097/Hhv3fmg~EcmP03v.png" + "\nKnuckles the Echidna - https://mudae.net/uploads/5254382/VaDTKd7~mj5y1G4PO.gif" + "\nMiles 'Tails' Prower - https://mudae.net/uploads/6028193/ON202dH~6GABeAW.png" + "\nMarky - https://mudae.net/uploads/7569167/-ss0Jo9~5jzz7MQ.png" + "\nThe Monkey - https://mudae.net/uploads/6806466/mSWUnZw~9pARFhA.png" + "\nClifford the Big Red Dog - https://mudae.net/uploads/8448003/LF1GajM~6b7a45d60e70.png" + "\nSwiper - https://mudae.net/uploads/3562487/jhdCgLk~ap7U3W5.png" + "\nAndrea Rhodea - https://mudae.net/uploads/3437594/wLtGseP~FnDAt9C.png" + "\nYveltal - https://mudae.net/uploads/5083592/L0ebXST~HVHuHgk.png" + "\nPoochyena - https://mudae.net/uploads/1256424/2UEYGM2~j7mmcz359w7.png" + "\nRayquaza - https://mudae.net/uploads/4897980/TCZlnVu~MdYE0XRyt.png" + "\nGroudon - https://mudae.net/uploads/3331623/0xu6BOL~7KIy9Hf.png" + "\nMantis Lords - https://mudae.net/uploads/4759460/uyefW09~wywLdw8.png" + "\nJergal - https://mudae.net/uploads/9398593/CV0TZxF~ca4c76b0ed80.png" + "\nEdgeshot - https://mudae.net/uploads/4813190/6BfSaGX~1g2AJbN.png" + "\nMort - https://mudae.net/uploads/5453754/GScBKow~jcQdipH.png" + "\nReaper (Persona) - https://mudae.net/uploads/1833953/94HjDp4~zNmkDov.png" + "\nShabriri - https://mudae.net/uploads/2413329/NF4LrmT~k739cbpmjj7.png" + "\nHanami - https://mudae.net/uploads/6962081/WCaIoNJ~RI6tCvO.png" + "\nMendoza - https://mudae.net/uploads/2324180/9BiJ6Cs~Y3uTH0z.png" + "\nOrganization XIII's Moogle - https://mudae.net/uploads/8030635/0b-T7_i~KROJ42u.png" + "\nAxe Cat - https://mudae.net/uploads/1686686/kCOPiHd~MATvoDG.png" + "\nMilk Bear - https://mudae.net/uploads/8432048/Pu1YvUz~saqOCmW.gif" + "\nTutter T. Tutter - https://mudae.net/uploads/2351631/VS-L1PT~TBjzJir.png" + "\nChara - https://mudae.net/uploads/9883217/RdgKNd0~3gYxNoAs5.png" + "\nAsgore - https://mudae.net/uploads/2340009/3ZYM4zC~Xowx8f3.png" + "\nThe Beheaded - https://mudae.net/uploads/9268177/IJcmOXk~im2QNWG.png" + "\nTimothée Chalamet - https://mudae.net/uploads/6987659/v1wXcb6~XSP0Nrr.png" + "\nNym Orlith - https://mudae.net/uploads/7780409/bbpgy0D~tT7LVDm.png" + "\nErdwin - https://mudae.net/uploads/6676415/L3VYx6B~TQfdch9.png" + "\nEdeni - https://mudae.net/uploads/2814256/bEb2F0P~pyq9crjjpz4.png" + "\nTarzan's Mother - https://mudae.net/uploads/7155800/RxkNwgJ~Bpl6tpI.png" + "\nHelga Sinclair - https://mudae.net/uploads/2732215/00NuO-G~4z9cvwdgnk7.gif" + "\nDistracted Boyfriend - https://mudae.net/uploads/1222724/ydpJaB_~ShQajY2.png" + "\nDistracted Boyfriend's Girlfriend - https://mudae.net/uploads/7501789/O08DrNZ~ouTV6kC.png" + "\nJesus - https://mudae.net/uploads/5440208/_Cg6fVv~gBL5txZ.png" + "\nSun - https://mudae.net/uploads/3447777/aG-xgvN~my2pcx2pqq7.png" + "\nCharmy Pappitson - https://mudae.net/uploads/4050805/hHEiYe_~iAZFNyX.gif" + "\nFennekin - https://mudae.net/uploads/3281929/a-lVhxX~4MwgQdP.png" + "\nRika Orimoto - https://mudae.net/uploads/2973407/wnqy748~Cv7YXbP.png" + "\nPartner (PMD2) - https://mudae.net/uploads/4455321/HyUVuOX~uYabQyQ.png" + "\nLady Nagant - https://mudae.net/uploads/4419456/NOPfbHQ~AoLoeKW.png" + "\nIdun - https://mudae.net/uploads/3238367/zLAaaXK~IhZWOsC.png" + "\nPieck Finger - https://mudae.net/uploads/2971231/R5jwH2m~SKRat49.png" + "\nYuusei Fudou - https://mudae.net/uploads/5875870/2UJfpW3~mQx75RD.gif" + "\nVeronica (DQ) - https://mudae.net/uploads/9948286/8OSOYF7~D05bEKo.png" + "\nHee-Ho-Kun - https://mudae.net/uploads/2951883/dapqhip~uQ1ClLB.png" + "\nJessie's Arbok - https://mudae.net/uploads/1810140/rXW9FxB~r2BO6Vy.gif" + "\nShani - https://mudae.net/uploads/6818586/ygX-yNX~KQxEN68.png" + "\nKiba Inuzuka - https://mudae.net/uploads/3850598/K69Zggw~dZDlYqK.png" + "\nPatamon - https://mudae.net/uploads/3131640/VWiXI2g~8DUwcAV.png" + "\nSmaug - https://mudae.net/uploads/7638503/EhouKn0~2S8WQr4.png" + "\nCarrot - https://mudae.net/uploads/5183410/iTkJG57~K7lsEV2.png" + "\nCelebi (PMD) - https://mudae.net/uploads/3782874/954NuuV~oWTVwcH.png" + "\nBriar (PKMN) - https://mudae.net/uploads/2240233/O2UPWRW~p7bwc2vkap7.png" + "\nShadow Kirby - https://mudae.net/uploads/6194256/zXByLWo~5frKeyN.png" + "\nSartorius - https://mudae.net/uploads/6777646/ar-Lrcs~xxoaSYn.png" + "\nBroken Vessel - https://mudae.net/uploads/7763609/jTmrZYR~1CApuQ4.png" + "\nKuriboh - https://mudae.net/uploads/1392699/iE7ALqZ~zRzXQmI.png" + "\nJyn Erso - https://mudae.net/uploads/3854542/eNMGFTq~SZUxk0Y.png" + "\nMorticia Addams - https://mudae.net/uploads/6245748/YInEEGq~HdbzqeS.png" + "\nAnn Takamaki - https://mudae.net/uploads/5184795/_vvTHXo~345xcm6aao7.gif" + "\nMipha - https://mudae.net/uploads/5149433/I961sFa~cQbQAA3.png" + "\nAlfira - https://mudae.net/uploads/8412924/0b-3qXu~GM8inDj.png" + "\nShank - https://mudae.net/uploads/2884728/c5KD-dB~gAhkYQM.png" + "\nMarco - https://mudae.net/uploads/7016953/J184zek~DczwOvy.png" + "\nTheodore - https://mudae.net/uploads/8967620/Yl74oRA~B3B3HNM.png" + "\nCorrin (M) - https://mudae.net/uploads/9117174/IjXyhdo~uK7RTRy.png" + "\nBartolomeo - https://mudae.net/uploads/1887509/2EwLKFS~dUzllEs.png" + "\nJack Frost - https://mudae.net/uploads/5192167/OBnrHZa~QCRcZ3u.png" + "\nPrincess Peach - https://mudae.net/uploads/7854534/sSyYuyp~j0yCFWB.png" + "\nNuwa - https://mudae.net/uploads/4416639/SXz1KUI~MfdJdq3.png" + "\nTreecko - https://mudae.net/uploads/1615342/fPEb35R~UPRSv4F.png" + "\nCow (Mario) - https://mudae.net/uploads/3307171/Coh0_C1~BLXAemg.png" + "\nArtemis (Hades) - https://mudae.net/uploads/9748332/Wh7o2gQ~Xerhlt6.png" + "\nAnnoying Dog - https://mudae.net/uploads/7322905/ZzbRJKE~myd5cg985w4.png" + "\nTasha (D&D) - https://mudae.net/uploads/7407347/DQpGDsr~YhCdIxZ.png" + "\nDarkness (KH) - https://mudae.net/uploads/7382647/TKH4eXz~cTQRWTh.png" + "\nJupiter - https://mudae.net/uploads/6849082/_XdrISL~IYarSEE.png" + "\nVanitas Remnant - https://mudae.net/uploads/5776126/YdJ6xLO~CfwwIFp.png" + "\nMisty's Psyduck - https://mudae.net/uploads/1441867/wM0o-YF~e4gdcavklg4.png" + "\nPoint and Laugh Cat - https://mudae.net/uploads/8470202/f-Xv39O~y8xcn2ljza4.png" + "\nGalarian Moltres - https://mudae.net/uploads/8560833/6gBlKTv~0tABTS7.png" + "\nPalutena - https://mudae.net/uploads/9859975/JyxkFjF~uRh8WB1.png" + "\nThe Dark Urge - https://mudae.net/uploads/8872151/8Hx3SFO~AOGN3NH.png" + "\nPearl (PKMN) - https://mudae.net/uploads/3990533/UAN-wYa~LCX2G6F.png" + "\nJaiden Animations - https://mudae.net/uploads/9390216/mt5S4dA~ctSIBhM.png" + "\nEsquie - https://mudae.net/uploads/6031712/SHXLePB~2Njjzok.png" + "\nGoku Black - https://mudae.net/uploads/2065990/-arXrkL~N0bpFZG.gif" + "\nVaporeon - https://mudae.net/uploads/1825057/9ytG5Cm~kFTDH5N.png" + "\nRidley - https://mudae.net/uploads/6122894/ME17NNK~qglucLc.gif" + "\nPalkia - https://mudae.net/uploads/5071704/erM88ZH~my2pcw9qzn7.png" + "\nTimmy (WC) - https://mudae.net/uploads/9764044/4ca65cU~YpdycbW.png" + "\nJabra - https://mudae.net/uploads/5814072/HYyxOY3~qM7yaWh.png" + "\nCharlotte Katakuri - https://mudae.net/uploads/2706819/pharywg~0Ui6zxK.png" + "\nDendra - https://mudae.net/uploads/4414290/_9-27tn~OTjA2QM.png" + "\nDemeter (Hades) - https://mudae.net/uploads/6705330/y9wozEx~MAitAg9.png" + "\nGamakichi - https://mudae.net/uploads/6531914/xy6glHx~4apc5n6mbx4.png" + "\nQueen of Hearts - https://mudae.net/uploads/9663531/r8dM0zN~CvWt1g7.png" + "\nJean-François - https://mudae.net/uploads/7392097/v1E3MO3~Htug8q2.png" + "\nNailsmith - https://mudae.net/uploads/4290911/ddqH1UQ~gdVZa3x.png" + "\nOli Sykes - https://mudae.net/uploads/2512661/jOnN7bp~KlOYJQQZ8.png" + "\nDagna - https://mudae.net/uploads/9917950/V1AAuaX~ZbCxUKF.png"

type TierProperties = {
    id: number
    label: string
    color: string
    characters: CharacterProperties[]
}

type PoolProperties = {
    id: number
    characters: CharacterProperties[]
}

function App()
{
    // Default : empty pool
    const [pool, updatePool] = useState<CharacterProperties[]>([])

    // Assign each tier label to a Tier object, id going from 0 to 9
    const [tiers, updateTiers] = useState(
        TIERS_LABELS.map((label, index) => ({
            id: index,
            label: label,
            color: COLORS[index],
            characters: [] as CharacterProperties[]
        }))
    )

    // Keep track of tierlier/pool objects
    const tierlistRef = useRef<HTMLDivElement | null>(null)
    const poolRef = useRef<HTMLDivElement | null>(null)

    // Keep track of picked character and hovererd tier for preview
    const [activeCharacter, setActiveCharacter] = useState<CharacterProperties | null>(null)
    const [hoveredTier, setHoveredTier] = useState<number | null>(null)
    
    // Pool custom parameters
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(false)
    const [poolHeight, setPoolHeight] = useState(160)
    const [isSticky, setSticky] = useState(true)
    const currentPosition = useRef(window.scrollY)

    // Import
    const [importText, setImportText] = useState(INITIAL_CHARACTERS)

    function handleImport() {
        const lines = importText.split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)

        const importedCharacters: CharacterProperties[] = []

        // Iterate over Mudae export and retrieve name and image url
        for (const line of lines) {
            const parts = line.split(" - https://")

            // Invalid format, skip line
            if (parts.length !== 2)
                continue

            const name = parts[0].trim()
            const imageUrl = parts[1].trim()

            // Empty name or url, skip line
            if (!name || !imageUrl)
                continue

            importedCharacters.push({
                name,
                image: proxifyImageUrl("https://" + imageUrl)
            })
        }

        if (importedCharacters.length === 0) return

        // Avoid duplicates (TODO : check other tiers)
        updatePool(prev => {
            const existingNames = new Set(prev.map(c => c.name))
            const filtered = importedCharacters.filter(c => !existingNames.has(c.name))
            return [...prev, ...filtered]
        })

        setImportText("")
    }

    // Debug : import all characters at page loading
    handleImport()

    // Generate character preview when an image is dragged
    function handleDragStart(event: DragStartEvent)
    {
        // Find original character from name
        const characterName = event.active.id as string
        const character = pool.find(character => character.name === characterName) ||
            tiers.flatMap(tier => tier.characters).find(character => character.name === characterName)

        // If a character is found, display it as preview
        if (character)
            setActiveCharacter(character)
    }

    // Generate character placeholder preview in the hovered tier
    function handleDragOver(event: DragOverEvent) {
        setHoveredTier(event.over?.id as number ?? null)
        setAutoScrollEnabled(false)
    }

    // Erase character preview
    function handleDragCancel() {
        setActiveCharacter(null)
        setHoveredTier(null)
    }

    // Called after an image is dropped
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return
        
        // Erase character preview
        setActiveCharacter(null)
        setHoveredTier(null)

        // Retrieve dropped character and tier id
        const characterName = active.id as string
        const targetTierId = over.id as number

        // Check if the character comes from the pool
        const poolCharacter = pool.find((character) => character.name === characterName)
        
        // Check if the character comes from a tier
        const tierCharacter = tiers
            .flatMap(tier => tier.characters)
            .find((character) => character.name === characterName);

        // Make sure character exists
        if (!poolCharacter && !tierCharacter) return
        
        updatePool((prev) => 
        {
            // Character moved from pool to tier
            if (poolCharacter && targetTierId >= 0) {
                return prev.filter((character) => character.name !== characterName)
            }

            // Character moved from tier to pool
            if (tierCharacter && targetTierId == -1) {
                return prev.some((character) => character.name === characterName)
                    ? prev
                    : [...prev, tierCharacter];
            }

            // Default : return original state
            return prev;
        })

        updateTiers((prev) =>
        {
            // Character moved from pool to tier
            if (poolCharacter && targetTierId >= 0) {
                return prev.map((tier) =>
                    tier.id === targetTierId
                        ? { ...tier, characters: [...tier.characters, poolCharacter] }
                        : tier
                )
            }

            // Character moved from tier to pool/another tier
            if (tierCharacter) {

                // Find source tier
                const sourceTier = prev.find((tier) => tier.characters.some(
                    character => character.name === characterName
                ))

                // Can't find source tier : return original state
                if (!sourceTier)
                    return prev;

                // Update source and target tiers
                return prev.map((tier) =>
                {
                    if (sourceTier.id != targetTierId)
                    {
                        // Remove character from source tier
                        if (tier.id === sourceTier.id) {
                            return {...tier,
                                characters: tier.characters.filter(
                                    (character) => character.name !== characterName)
                            }
                        }

                        // Add character to target tier
                        if (tier.id === targetTierId) {
                            return {...tier,
                                characters: [...tier.characters, tierCharacter]
                            }
                        }
                    }

                    // Default : keep tier as is
                    return tier;
                })
            }

            // Default : return original state
            return prev;
        })
    }

    // Sections of tierlist, split between label and characters
    function Tier({ id, label, color, characters }: TierProperties)
    {
        // Make tiers droppable
        const {setNodeRef} = useDroppable({
            id: id
        })

        return (
            <div className="tier">
                <div className = "tierName" style = {{ backgroundColor: color }}>
                    {label}
                </div>

                {/* Display all characters in the tier */}
                <div ref = {setNodeRef} className = "tierContent">
                    {characters.map((character) => (
                        <Character key = {character.name}
                            name = {character.name}
                            image = {character.image} />
                    ))}

                    {/* Display preview on hovered tier */}
                    {hoveredTier === id && <CharacterPreview />}
                </div> 
            </div>
        )
    }

    // Pool of characters to sort
    function Pool({ characters }: PoolProperties)
    {
        // Make Pool droppable 
        const {setNodeRef} = useDroppable({
            id: -1
        })

        // Pool transition from sticky to set position when scrolling down
        useEffect(() => {
            const handleScroll = () => {
                const yPosition = window.scrollY
                const viewportBottom = yPosition + window.innerHeight
                const documentHeight = document.documentElement.scrollHeight

                const poolTotalHeight = poolRef?.current?.offsetHeight || 0
                const scrollingUp = yPosition < currentPosition.current

                // Default : keep sticky value
                let newSticky = isSticky

                // Disable sticky if previously sticky and reached the bottom of the page
                if (isSticky && viewportBottom >= documentHeight - 1) {
                    newSticky = false
                }
                // Enable sticky if previously not sticky and scrolled up the tierlist
                else if (scrollingUp && viewportBottom < documentHeight - poolTotalHeight + poolHeight) {
                    newSticky = true
                }

                // Update sticky and previous position
                if (newSticky !== isSticky) setSticky(newSticky)
                currentPosition.current = scrollY
            }

            window.addEventListener("scroll", handleScroll)
            return () => window.removeEventListener("scroll", handleScroll)
        }, [isSticky, poolRef])

        // Resize pool when dragging it upwards or downwards
        function resizePool(e: any) {
            const startY = e.clientY
            const startHeight = poolHeight

            // Stop default browser behavior (select text on drag)
            e.preventDefault();

            function onMove(e: any) {
                const delta = startY - e.clientY
                setPoolHeight(
                    Math.max(120, Math.min(500, startHeight + delta))
                )
            }

            function onUp() {
                window.removeEventListener("mousemove", onMove)
                window.removeEventListener("mouseup", onUp)
            }

            window.addEventListener("mousemove", onMove)
            window.addEventListener("mouseup", onUp)
        }

        return (
            <div ref = {poolRef} className = "characterPool"
                style = {{zIndex: 999,
                    height: isSticky ? poolHeight : "", 
                    position: isSticky ? "sticky" : "relative",
                    bottom: isSticky ? 0 : "auto"}}>

                {/* Header */}
                <div className = "resizeHandle" onMouseDown = {resizePool} />
                <div className = "poolHeader">
                    <input placeholder="Search..." />
                    <span>34 remaining</span>
                </div>

                {/* Actual character pool */}
                <div ref = {setNodeRef} className = "poolContent">
                    {characters.map((character) => (
                        <Character key = {character.name}
                            name = {character.name} 
                            image = {character.image} />
                    ))}
                </div>
            </div>
        )
    }

    // Preview character in target tier
    function CharacterPreview()
    {
        // No picked character : don't display preview
        if (!activeCharacter)
            return null;

        // Generate draggable character preview
        return (
            <img
                src = {activeCharacter.image}
                style = {{
                    width: 72,
                    height: 112,
                    opacity: 0.5
                }}
            />
        )
    }

    // Render app 
    return (
        <DndContext
            onDragStart = {handleDragStart}
            onDragEnd = {handleDragEnd}
            onDragOver = {handleDragOver}
            onDragCancel = {handleDragCancel}
            autoScroll = {autoScrollEnabled}
            collisionDetection = {poolCollisionDetection}>

            {/* Dragged character */}
            <DragOverlay style = {{zIndex: 9999}}>
                {activeCharacter && <img src = {activeCharacter.image}
                    style = {{
                        width: 72,
                        height: 112,
                        opacity: 0.8
                    }}/>}
            </DragOverlay>

            <div className="importSection">
                <textarea
                    value = {importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="CharacterName - imageUrl"
                />
                <button onClick = {handleImport}>
                    Import
                </button>
            </div>

            <div className = "tierlist" ref = {tierlistRef}>
                {tiers.map((tier) => (
                    <Tier key = {tier.id}
                        id = {tier.id} 
                        label = {tier.label}
                        color = {tier.color}
                        characters = {tier.characters} />
                ))}
            </div>

            <Pool id = {-1} characters = {pool} />
        </DndContext>
    )
}

// Always drop characters in pool if we're in pool coordinates
const poolCollisionDetection: CollisionDetection = (args) => {
    const { droppableContainers, pointerCoordinates } = args;

    if (pointerCoordinates) {
        const poolDroppable = droppableContainers.find(c => c.id == -1);

        // Retrieve pool coordinates to check if we're on top of it
        if (poolDroppable?.rect.current) {
            const rect = poolDroppable.rect.current;

            // Check if mouse pointer is between pool coordinates
            if (pointerCoordinates.x >= rect.left && pointerCoordinates.x <= rect.right
                && pointerCoordinates.y >= rect.top && pointerCoordinates.y <= rect.bottom) {
                return [poolDroppable];
            }
        }
    }

    // Default behavior : rectIntersection
    return rectIntersection(args);
};

function proxifyImageUrl(originalUrl: string) {
    return `https://super-field-ca48.rakouett-du-56.workers.dev/?url=${originalUrl}`
}

export default App