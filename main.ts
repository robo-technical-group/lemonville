/**
 * Lemonville
 * Built on
 * MakeCode Arcade JavaScript Template v. 2.2
 * Template last update: 05 Jun 2019 ak
 * Inspired by Lemonade Stand (1973) by Bob Jamison
 * Logic and artwork inspried by Apple ][ port (1979) by Charlie Kellner
 * (C) 2019 Robo Technical Group LLC
 * MIT license
 */

/**
 * Enumerations
 */
// Standard palette
enum Color {
    Transparent, // 0
    White, // 1 = RGB(255, 255, 255)
    Red, // 2 = RGB(255, 33, 33)
    Pink, // 3 = RGB(255, 147, 196)
    Orange, // 4 = RGB(255, 129, 53)
    Yellow, // 5 = RGB(255, 246, 9)
    Aqua, // 6 = RGB(36, 156, 163)
    BrightGreen, // 7 = RGB(120, 220, 82)
    Blue, // 8 = RGB(0, 63, 173)
    LightBlue, // 9 = RGB(135, 242, 255)
    Purple, // 10 = RGB(142, 46, 196)
    RoseBouquet, // 11 = RGB(164, 131, 159)
    Wine, // 12 = RGB(92, 64, 108)
    Bone, // 13 = RGB(229, 205, 196)
    Brown, // 14 = RGB(145, 70, 61)
    Black // 15 = RGB(0, 0, 0)
}   // enum Color

// Game modes
enum GameMode {
    Attract,
    Instructions,
    Main,
    NotReady,
    Settings,
    Summary,
    Weather
}   // GameMode

/**
 * Constants
 */
const HARDWARE: boolean = control.ramSize() < (1024 * 1024)
const VERSION: string = '2.3'

const COLOR_BG: number = Color.Wine
const COLOR_EVENTS: number = Color.White
const COLOR_HEADINGS: number = Color.Yellow
const COLOR_NAV: number = Color.Yellow
const DEFAULT_PRICING_SCHEME: number = 1
const DEFAULT_NUM_PLAYERS: number = 1
const INSTRUCTIONS_MIN_Y: number = 10
const INSTRUCTIONS_MAX_Y: number = 98
const NUM_DAYS_SHORT: number = 12
const NUM_DAYS_MEDIUM: number = 20
const NUM_DAYS_LONG: number = 30
const SPEED_SPLASH_SPRITE: number = 75
const SUMMARY_MAX_Y: number = 100
const TEXT_HEADLINES: string[][] = [
    ['Lemonade Stand was created', 'in 1973'],
    ['Lemonade Stand was created', 'by Bob Jamison'],
    ['Graphics inspired by', 'the Apple ][ port'],
    ['Graphics inspired by', 'Charlie Kellner'],
    ['Lemonville is (C) 2019', 'Robo Technical Group'],
    ['Programmed in', 'MakeCode Arcade'],
    ['by', 'Alex K.'],
    ['Version', VERSION]
]
const TEXT_INSTRUCTION_PROMPTS: string[] = [
    'A = Read More',
    'B = Start Game'
]
const TEXT_NOT_ENOUGH_ASSETS: string = "You don't have enough cash! Buy fewer signs or make fewer glasses."
const TEXT_SETTINGS_DONE: string = 'Start!'
const TEXT_SETTINGS_HEADLINES: string[] = ['Settings', '']
const TEXT_SETTINGS_NUM_PLAYERS: string = 'Number of players: '
const TEXT_SPLASH_SUBTITLES: string[][] = [[
    'How much money', 'can you make?'
]]
const TEXT_SUMMARY_HEADINGS: string[] = [
    'Name Made Sold Price Signs',
    '          Profit     Cash'
]
const TEXT_SUMMARY_PROMPTS: string[] = [
    'A = Read More',
    'B = Next Day'
]
const TEXT_SUMMARY_PROMPTS_END: string[] = [
    'A = Read More',
    'B = Start New Game'
]
const TEXT_SUMMARY_THUNDERSTORM: string[] = [
    'Thunderstorms ruined',
    'everything!'
]
const TEXT_SUMMARY_TITLE: string = 'End of day'
const TEXT_SUMMARY_WORKERS: string[] = [
    'Street crews bought all of',
    'your lemonade!'
]
const TEXT_TITLES: string[] = ['Lemonville']

/**
 * Global variables
 */
let canvas: Image = image.create(screen.width, screen.height)
let gameMode: GameMode = GameMode.NotReady
let splashScreen: SplashScreens = null
let settingsScreen: OptionScreenCollection = null
let thunderDisplayed: boolean = false
let summaryY: number = 0

/**
 * Main() a.k.a. game.onStart()
 */
startAttractMode()

/**
 * Start game modes
 * Game mode order:
 * - Attract
 * - Settings
 * - Instructions
 * - Init game (startGame)
 * - Main game loop
 *   - Start day & show weather
 *   - Collect player data (startNextPlayer)
 *   - Show summary
 */
function startAttractMode(): void {
    gameMode = GameMode.NotReady
    buildScreens()
    splashScreen.build()
    gameMode = GameMode.Attract
}   // startAttractMode()

function startDay(): void {
    gameMode = GameMode.NotReady
    thunderDisplayed = false
    beginNewDay()
    showWeather()
    gameMode = GameMode.Weather
}   // startDay()

function startGame(): void {
    gameMode = GameMode.NotReady
    let numDays: number = 0
    switch (settingsScreen.getSelectionForScreen(1)) {
        case 0:
            numDays = NUM_DAYS_SHORT
            break

        case 1:
            numDays = NUM_DAYS_MEDIUM
            break

        case 2:
            numDays = NUM_DAYS_LONG
            break

        default:
            numDays = NUM_DAYS_SHORT
            break
    }   // switch (settingsScreen.getSelectionForScreen(1))
    initGame(currGame.numPlayers, numDays,
        settingsScreen.getSelectionForScreen(2))
    startDay()
}   // startGame()

function startInstructions(): void {
    gameMode = GameMode.NotReady
    scene.setBackgroundImage(canvas)
    clearCanvas()
    drawHeaderInstructions()
    drawInstructionPrompts()
    drawInstructions(canvas, COLOR_BG, INSTRUCTIONS_MIN_Y, INSTRUCTIONS_MAX_Y)
    gameMode = GameMode.Instructions
}   // startInstructions()

function startNextPlayer(): void {
    gameMode = GameMode.NotReady
    hideWeatherCaption()
    currGame.currPlayer++
    if (currGame.currPlayer >= currGame.numPlayers) {
        startSummary()
    } else {
        showCurrPlayerOptions()
        gameMode = GameMode.Main
    }   // if (currGame.currPlayer > currGame.numPlayers)
}   // startNextPlayer()

function startSettings(): void {
    gameMode = GameMode.NotReady
    settingsScreen.build()
    currGame.numPlayers = DEFAULT_NUM_PLAYERS
    updateSettingsScreen()
    gameMode = GameMode.Settings
}   // startSettings()

function startSummary(): void {
    gameMode = GameMode.NotReady
    if (currGame.weather === Weather.Thunderstorm && !thunderDisplayed) {
        thunderDisplayed = true
        showWeather(true)
        gameMode = GameMode.Weather
    } else {
        endCurrentDay()
        clearCanvas()
        drawHeaderSummary()
        summaryY = drawHeaderSummary() + 1
        drawSummary(canvas, Color.Wine, summaryY, SUMMARY_MAX_Y)
        drawSummaryPrompts()
        scene.setBackgroundImage(canvas)
        if (currGame.weather === Weather.Thunderstorm) {
            hideWeatherCaption()
        } else {
            if (currGame.currDay < currGame.maxDays) {
                playMoney()
            } else {
                playFanfare()
            }   // if (currGame.currDay < currGame.maxDays)
        }   // if (currGame.weather === Weather.Thunderstorm)
        gameMode = GameMode.Summary
    }   // if (currGame.weather === Weather.Thunderstorm ...)
}   // startSummary()

/**
 * Game loops
 */
game.onUpdateInterval(100, function () {
    switch (gameMode) {
        case GameMode.Attract:
            if (game.runtime() >= splashScreen.nextTime) {
                splashScreen.rotate()
            }   // if (game.runtime() >= splash.nextTime)
            if (splashScreen.movingSpriteCount === 0) {
                splashScreen.showScrollingSprite()
            }   // if (! sprites.allOfKind(SpriteType.Moving))
            break

        case GameMode.Main:
            if (game.runtime() >= playerOptions.nextTime) {
                playerOptions.rotate()
            }   // if (game.runtime() >= playerOptions.nextTime)
            break

        case GameMode.Weather:
            rotateWeatherImage()
            break
    }   // switch (gameMode)
})  // game.onUpdate()

/**
 * Controller events
 */
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    switch (gameMode) {
        case GameMode.Attract:
            startSettings()
            break

        case GameMode.Instructions:
            if (instructionsStatus.done) {
                startGame()
            } else {
                drawInstructions(canvas, COLOR_BG, INSTRUCTIONS_MIN_Y, INSTRUCTIONS_MAX_Y)
            }   // if (instructionsStatus.done)
            break

        case GameMode.Main:
            selectPlayerOption()
            if (playerOptions.cursor.isInFooter && !playerOptions.done) {
                if (HARDWARE) {
                    music.wawawawaa.play()
                } else {
                    game.showLongText(TEXT_NOT_ENOUGH_ASSETS, DialogLayout.Center)
                }   // if (HARDWARE)
            }   // if (playerOptions.cursor.isInFooter && ...)
            if (playerOptions.done) {
                startNextPlayer()
            }   // if (playerOptions.done)
            break

        case GameMode.Settings:
            settingsScreen.select()
            if (settingsScreen.currScreen === 0 && !settingsScreen.cursor.isInFooter) {
                let input: number = game.askForNumber("How many players?", 2)
                if (input > 0) {
                    currGame.numPlayers = input
                    updateSettingsScreen()
                }   // if (input)
                settingsScreen.setSelectionForScreen(0, 0, -1)
            }   // if (settingsScreen.currScreen === 0)
            if (settingsScreen.done) {
                startInstructions()
            }   // if (settingsScreen.done)
            break

        case GameMode.Summary:
            canvas.fillRect(0, summaryY, screen.width, SUMMARY_MAX_Y - summaryY,
                COLOR_BG)
            drawSummary(canvas, Color.Wine, summaryY, SUMMARY_MAX_Y)
            break
    }   // switch (gameMode)
})  // controller.A.onEvent()

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    switch (gameMode) {
        case GameMode.Attract:
            startSettings()
            break

        case GameMode.Instructions:
            startGame()
            break

        case GameMode.Main:
            break

        case GameMode.Summary:
            if (currGame.currDay < currGame.maxDays) {
                startDay()
            } else {
                game.reset()
            }   // if (currGame.currDay < currGame.maxDays)
            break

        case GameMode.Weather:
            if (thunderDisplayed) {
                startSummary()
            } else {
                startNextPlayer()
            }   // if (thunderDisplayed)
            break
    }   // switch (gameMode)
})  // controller.B.onEvent()

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    switch (gameMode) {
        case GameMode.Attract:
            startSettings()
            break

        case GameMode.Main:
            playerOptions.moveCursorDown()
            break

        case GameMode.Settings:
            settingsScreen.moveCursorDown()
            break
    }   // switch (gameMode)
})  // controller.down.onEvent()

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    switch (gameMode) {
        case GameMode.Attract:
            startSettings()
            break

        case GameMode.Main:
            playerOptions.moveCursorLeft()
            break

        case GameMode.Settings:
            settingsScreen.moveCursorLeft()
            break
    }   // switch (gameMode)
})  // controller.left.onEvent()

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    switch (gameMode) {
        case GameMode.Attract:
            startSettings()
            break

        case GameMode.Main:
            playerOptions.moveCursorRight()
            break

        case GameMode.Settings:
            settingsScreen.moveCursorRight()
            break
    }   // switch (gameMode)
})  // controller.right.onEvent()

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    switch (gameMode) {
        case GameMode.Attract:
            startSettings()
            break

        case GameMode.Main:
            playerOptions.moveCursorUp()
            break

        case GameMode.Settings:
            settingsScreen.moveCursorUp()
            break
    }   // switch (gameMode)
})  // controller.up.onEvent()

/**
 * Other functions
 */
function buildScreens(): void {
    RotatingScreens.canvas = canvas
    buildSplashScreen()
    buildSettingsScreen()
}   // buildScreens()

function buildSettingsScreen(): void {
    initGame(DEFAULT_NUM_PLAYERS, NUM_DAYS_SHORT, DEFAULT_PRICING_SCHEME)
    let headlines: string[][] = []
    headlines.push(TEXT_SETTINGS_HEADLINES)
    for (let s of TEXT_HEADLINES) {
        headlines.push(s)
    }   // for (s)
    settingsScreen = new OptionScreenCollection(
        TEXT_TITLES, Color.Yellow,
        headlines, Color.Brown
    )
    settingsScreen.titles.font = image.font8
    settingsScreen.headlines.font = image.font5
    settingsScreen.footer.font = image.font5
    settingsScreen.doneText = TEXT_SETTINGS_DONE
    settingsScreen.addScreen('Players',
        [[TEXT_SETTINGS_NUM_PLAYERS + currGame.numPlayers]],
        false)
    settingsScreen.addScreen('Days',
        [['Short (' + NUM_DAYS_SHORT + ' days)',
        'Medium (' + NUM_DAYS_MEDIUM + ' days)',
        'Long (' + NUM_DAYS_LONG + ' days)']],
        false)
    settingsScreen.addScreen('Prices',
        [['Classic (1973)', 'Modern (2019)']],
        false)
    settingsScreen.setSelectionForScreen(0, 0, -1)
    settingsScreen.setSelectionForScreen(1, 0, 0)
    settingsScreen.setSelectionForScreen(2, 0, DEFAULT_PRICING_SCHEME)
}   // buildSettingsScreen()

function buildSplashScreen(): void {
    splashScreen = new SplashScreens(
        TEXT_TITLES, Color.Yellow,
        TEXT_HEADLINES, Color.Brown,
        TEXT_SPLASH_SUBTITLES, Color.LightBlue)
    splashScreen.movingSpriteMode = SpriteMode.BlankSpace
    splashScreen.movingSpriteOptions.speed = SPEED_SPLASH_SPRITE
    splashScreen.addMovingSprite(sprites.food.smallLemon)
    splashScreen.addMovingSprite(img`
        . . . . . . . . . . . . . . . .
        . . . . . . 1 1 1 . . . . . . .
        . . . . 1 1 1 1 1 1 1 . . . . .
        . . . 1 1 1 5 5 5 1 1 1 . . . .
        . . 1 1 5 5 5 5 5 5 5 1 1 . . .
        . . 1 1 5 5 5 5 5 5 5 1 1 . . .
        . . 1 5 1 1 5 5 5 1 1 5 1 . . .
        . . . 1 5 5 1 1 1 5 5 1 . . . .
        . . . 1 5 5 5 5 5 5 5 1 . . . .
        . . . 1 5 5 5 5 5 5 5 1 . . . .
        . . . . 1 5 5 5 5 5 1 . . . . .
        . . . . 1 5 5 5 5 5 1 . . . . .
        . . . . 1 5 5 5 5 5 1 . . . . .
        . . . . . 1 5 5 5 1 . . . . . .
        . . . . . 1 5 5 5 1 . . . . . .
        . . . . . 1 1 1 1 1 . . . . . .
    `)
    splashScreen.addMovingSprite(img`
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 1 1 1 9 9 9 1 1 1 9 9 9 1 1 1 9 9 9 1 1 1 9 9 9 9 9 9 9
        e e e e 1 1 1 1 e e 1 1 1 1 e e 1 1 1 1 e e 1 1 1 1 9 9 9 9 9 9
        e e e e 1 1 5 1 e e 1 1 5 1 e e 1 1 5 1 e e 1 1 5 1 e 9 9 9 9 9
        e e e e 1 1 5 1 e e 1 1 5 1 e e 1 1 5 1 e e 1 1 5 1 e e 9 9 9 9
        e e e e 1 1 5 1 e e 1 1 5 1 e e 1 1 5 1 e e 1 1 5 1 e e e 9 9 9
        e e e e e 1 1 1 e e e 1 1 1 e e e 1 1 1 e e e 1 1 1 e e e e 9 9
        e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e 9
        f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
        5 e e e e e e e e e e e e e e e e e e e e e e e e e e 5 e e e e
        5 e e e e e e e e e e e e e e e e e e e e e e e e e e 5 e e e e
        5 e e e 5 e e 5 5 e 5 e e e 5 e e 5 5 e e 5 5 e e e e 5 e e 5 e
        5 e e 5 e 5 e 5 e 5 e 5 e 5 e 5 e 5 e 5 e e e 5 e e 5 5 e 5 e 5
        5 e e 5 5 5 e 5 e 5 e 5 e 5 e 5 e 5 e 5 e 5 5 5 e 5 e 5 e 5 5 5
        5 e e 5 e e e 5 e 5 e 5 e 5 e 5 e 5 e 5 e 5 e 5 e 5 e 5 e 5 e e
        5 5 5 e 5 5 e 5 e 5 e 5 e e 5 e e 5 e 5 e 5 5 5 e e 5 5 e e 5 5
        e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e
        e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e
        e e e e e e e e e e e e 5 5 5 e e e 5 e e e e e e e e e e e e e
        e e e e e e e e e e e e 5 e e e e 5 5 5 e e e e e e e e e e e e
        e e e e e e e e e e e e 5 e e e 5 e 5 e e e e e e e e e e e e e
        e e e e e e e e e e e e 5 5 e e 5 e 5 e e e e e e e e e e e e e
        e e e e e e e e e e e e e e 5 e 5 e 5 e e e e e e e e e e e e e
        e e e e e e e e e e e e e e 5 e e 5 5 5 e e e e e e e e e e e e
        e e e e e e e e e e e e 5 5 e e e e 5 e e e e e e e e e e e e e
    `)
}   // buildSplashScreen()

function clearCanvas(): void {
    canvas.fill(COLOR_BG)
}   // clearCanvas()

function drawEvents(y: number): number {
    let toReturn: number = y
    let fi: FontInfo = new FontInfo(FontName.Font5, 1)
    if (currGame.weather === Weather.Thunderstorm) {
        drawStrings.writeMultipleCenter(TEXT_SUMMARY_THUNDERSTORM, canvas, y,
            COLOR_EVENTS, fi)
        toReturn += fi.height * TEXT_SUMMARY_THUNDERSTORM.length
    }   // if (currGame.weather === Weather.Thunderstorm)
    if (currGame.workersBoughtAll) {
        drawStrings.writeMultipleCenter(TEXT_SUMMARY_WORKERS, canvas, y,
            COLOR_EVENTS, fi)
        toReturn += fi.height * TEXT_SUMMARY_WORKERS.length
    }   // if (currGame.workersBoughtAll)
    return toReturn
}   // drawEvents()

function drawHeaderInstructions(): void {
    canvas.printCenter(TEXT_TITLES.join(' '), 0, COLOR_NAV, image.font8)
}   // drawHeader()

function drawHeaderSummary(): number {
    canvas.printCenter(TEXT_SUMMARY_TITLE + ' ' + currGame.currDay,
        0, COLOR_NAV, image.font5)
    let y: number = drawEvents(image.font5.charHeight + 1) + 1
    return drawHeadings(y)
}   // drawHeader()

function drawHeadings(y: number): number {
    let fi: FontInfo = new FontInfo(FontName.Font5, 1)
    drawStrings.writeMultipleCenter(TEXT_SUMMARY_HEADINGS, canvas, y,
        COLOR_HEADINGS, fi)
    return y + fi.height * TEXT_SUMMARY_HEADINGS.length
}   // drawHeadings()

function drawFooter(prompts: string[]): void {
    let font: image.Font = image.font5
    let currY: number = screen.height - prompts.length * (font.charHeight + 1)
    for (let s of prompts) {
        canvas.printCenter(s, currY, COLOR_NAV, font)
        currY += font.charHeight + 1
    }   // for (s)
}   // drawFooter()

function drawInstructionPrompts(): void {
    drawFooter(TEXT_INSTRUCTION_PROMPTS)
}   // drawInstructionPrompts()

function drawSummaryPrompts(): void {
    let prompts: string[] =
        currGame.currDay < currGame.maxDays
            ? TEXT_SUMMARY_PROMPTS
            : TEXT_SUMMARY_PROMPTS_END
    if (summaryStatus.done) {
        drawFooter([prompts[1]])
    } else {
        drawFooter(prompts)
    }   // if (summaryStatus.done)
}   // drawSummaryPrompts()

function updateSettingsScreen(): void {
    settingsScreen.options[0][0] =
        TEXT_SETTINGS_NUM_PLAYERS +
        currGame.numPlayers
    settingsScreen.rebuild()
}   // updateSettingsScreen()