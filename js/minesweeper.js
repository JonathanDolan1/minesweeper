'use strict'

const EMPTY = ''
const MINE = '💣'
const FLAG = '⛳️'
const LIFE = '♥️'

var gBoards
var gGames

var gBoard
var gLevels = [
    { size: 4, minesCount: 2 },
    { size: 8, minesCount: 14 },
    { size: 12, minesCount: 32 }
]

var gGame = {
    isOn: false,
    isGameOver: false,
    currLevel: gLevels[0],
    shownCount: 0,
    markedCount: 0,
    revealedMinesCount: 0,
    livesCount: 0,
    safeClicksCount: 3,
    startTime: null,
    time: 0,
    timerIntervalId: null,
    isHintMarked: false,
    isManualModeOn: false,
    isWaitingToStart: false,
    minesExterminatedCount: 0,
    megaHintsCount: 1,
    isMegaHintModeOn: false,
    megaHintsClicksCount: 2,
    megaHintMarkedPoss: []
}

function onInit() {
    buildBoard()
    renderBoard()
    gBoards = []
    gGames = []
    gGame.isOn = false
    gGame.isGameOver = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.revealedMinesCount = 0
    gGame.livesCount = 3
    gGame.safeClicksCount = 3
    gGame.startTime = null
    gGame.isHintMarked = false
    gGame.isManualModeOn = false
    gGame.isWaitingToStart = false
    gGame.currLevel.minesCount += gGame.minesExterminatedCount
    gGame.minesExterminatedCount = 0
    gGame.megaHintsCount = 1
    resetMegaHint()
    clearInterval(gGame.timerIntervalId)
    renderDisplay()
}

function renderDisplay() {
    clearHintsMarks()
    const elSmileyButton = document.querySelector('.smiley')
    elSmileyButton.innerText = '😀'
    const elHintsContainer = document.querySelector('.hints-container')
    elHintsContainer.innerHTML = `Hints:<span class="hint hint1" onclick="onHintClicked(this)"> 💡 </span>
    <span class="hint hint2" onclick="onHintClicked(this)"> 💡 </span>
    <span class="hint hint3" onclick="onHintClicked(this)"> 💡 </span>`
    const elLivesContainer = document.querySelector('.lives-container')
    elLivesContainer.innerHTML = `Lives:<span> ♥️ ♥️ ♥️ </span>`
    const elSafeClickSpanSpan = document.querySelector('.safe-click span')
    elSafeClickSpanSpan.innerText = gGame.safeClicksCount
    const elTimerSpanSpan = document.querySelector('.timer span')
    elTimerSpanSpan.innerText = '00:00'
    for (var level in localStorage) {
        const elBestScoreDisplay = document.querySelector('.' + level.toLowerCase())
        if (!localStorage.getItem(level)) break
        const bestScore = getTimerStrFromTime(localStorage.getItem(level))
        elBestScoreDisplay.innerText = bestScore
    }
    renderManualModeDisplay(false)
    renderMegaHintModeDisplay(false)
    renderMegaHintsClicksCount()
}

function buildBoard() {
    gBoard = []
    for (var i = 0; i < gGame.currLevel.size; i++) {
        gBoard[i] = []
        for (var j = 0; j < gGame.currLevel.size; j++) {
            const cell = {
                isShown: false,
                isMine: false,
                isMarked: false,
                mineNegsCount: 0
            }
            gBoard[i][j] = cell
        }
    }
}

function setMinesAtRandPossEx(rowIdx, colIdx) {
    for (var i = 0; i < gGame.currLevel.minesCount; i++) {
        const randPos = getRandEmptyPosEx(rowIdx, colIdx)
        gBoard[randPos.i][randPos.j].isMine = true
    }
}

function renderBoard() {
    var strHTML = '<table class="board">'
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            var classStr = ''
            var innerText = EMPTY
            if (currCell.isShown) {
                classStr = 'shown'
                if (currCell.isMine) {
                    classStr += 'mine'
                    innerText = MINE
                } else if (currCell.mineNegsCount > 0) {
                    innerText = currCell.mineNegsCount
                }
            } else if (currCell.isMarked) {
                classStr = 'marked'
                innerText = FLAG
            }
            strHTML += `<td id="cell-${i}-${j}" class="${classStr}" onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,${i},${j});return false;">${innerText}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</table>'
    var elBoardContainer = document.querySelector('.board-container')
    elBoardContainer.innerHTML = strHTML
}

function onUndoClicked() {
    if (!gGame.isOn) return
    gBoard = gBoards.pop()
    gGame = gGames.pop()
    renderBoard()
}

function onHintClicked(elHint) {
    if (!gGame.isOn) return
    if (elHint.classList.contains('marked')) {
        elHint.classList.remove('marked')
        gGame.isHintMarked = false
    } else {
        clearHintsMarks()
        elHint.classList.add('marked')
        gGame.isHintMarked = true
    }
}

function clearHintsMarks() {
    const elHints = document.querySelectorAll('.hint')
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].classList.remove('marked')
    }
}

function renderMegaHintModeDisplay(isOn) {
    const elMegaHintButtonSpan = document.querySelector('button.mega-hint span')
    elMegaHintButtonSpan.innerText = isOn ? 'on' : 'off'
}

function onManualModeClicked() {
    if (!gGame.isOn && gGame.isManualModeOn) {
        gGame.isManualModeOn = false
        renderManualModeDisplay(false)
        return
    }
    onInit()
    gGame.isManualModeOn = true
    renderManualModeDisplay(true)
    console.log(gGame.isManualModeOn);
}

function renderManualModeDisplay(isOn) {
    const elManualButtonSpan = document.querySelector('.manual-mode span')
    elManualButtonSpan.innerText = isOn ? 'on' : 'off'
}

function onSafeClicked() {
    if (!gGame.isOn || gGame.safeClicksCount === 0 || gGame.shownCount === gGame.currLevel.size ** 2 - gGame.currLevel.minesCount) return
    while (true) {
        var randEmptyPos = getRandEmptyPosEx()
        if (!randEmptyPos) return
        if (!gBoard[randEmptyPos.i][randEmptyPos.j].isShown) break
    }
    const elCell = getElCellFromPos(randEmptyPos.i, randEmptyPos.j)
    elCell.classList.add('safe')
    setTimeout(() => elCell.classList.remove('safe'), 4000);
    gGame.safeClicksCount--
    const elSafeClickSpanSpan = document.querySelector('.safe-click span')
    elSafeClickSpanSpan.innerText = gGame.safeClicksCount
}

function onMinesExterminatorClicked() {
    if (!gGame.isOn) return
    gBoards.push(copyBoard(gBoard))
    for (var i = 0; i < 3; i++) {
        const randMinePos = getRandMinePos()
        if (!randMinePos) break
        const currCell = gBoard[randMinePos.i][randMinePos.j]
        currCell.isMine = false
        gGame.currLevel.minesCount--
        gGame.minesExterminatedCount++
        if (currCell.isMarked) {
            currCell.isMarked = false
            gGame.markedCount--
        }
    }
    setMineNegsCount()
    renderBoard()
    printBoard()
}

function handleHint(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue
            const currCell = gBoard[i][j]
            hintCell(currCell,i,j)
        }
    }
    const elHints = document.querySelectorAll('.hint')
    for (var i = 0; i < elHints.length; i++) {
        const elHint = elHints[i]
        if (elHint.classList.contains('marked')) elHint.style.display = 'none'
    }
    gGame.isHintMarked = false
}

function onLevelClicked(lvlIdx) {
    gGame.currLevel = gLevels[lvlIdx]
    onInit()
}

function onCellClicked(elCell, i, j, isRecoursive = false) {
    if (gGame.isWaitingToStart || gGame.isGameOver) return
    if (gGame.isHintMarked) {
        handleHint(i, j)
        return
    }
    if (!gGame.isOn) {
        if (gGame.isManualModeOn) {
            placeMine(elCell, i, j)
            return
        }
        gGame.isOn = true
        setMinesAtRandPossEx(i, j)
        // FOR DEVELOPMENT
        // gBoard[0][0].isMine = true
        // gBoard[0][1].isMine = true
        printBoard()
        // FOR DEVELOPMENT
    }
    if (gGame.shownCount === 0) {
        setMineNegsCount()
        startTimer()
    }
    if (gGame.isMegaHintModeOn) {
        handleMegaHintClick(elCell,i,j)
        return
    }
    if (!isRecoursive) {
        gBoards.push(copyBoard(gBoard))
        gGames.push(copyGame(gGame))
    }
    const currCell = gBoard[i][j]
    if (currCell.isShown) return
    if (currCell.isMarked) {
        currCell.isMarked = false
        gGame.markedCount--
    }
    showCell(currCell, elCell)
    if (!currCell.isMine) {
        if (currCell.mineNegsCount > 0) {
            elCell.innerText = currCell.mineNegsCount
        } else {
            elCell.innerText = EMPTY
            expandShown(i, j)
        }
    } else {
        gGame.shownCount--
        gGame.revealedMinesCount++
        elCell.innerText = MINE
        elCell.classList.add('mine')
        loseLife()
    }
    checkGameOver()
}

function onMegaHintClicked() {
    if (!gGame.isOn || gGame.megaHintsCount === 0) return
    if (!gGame.isMegaHintModeOn){
        gGame.isMegaHintModeOn = true
        renderMegaHintModeDisplay(true)
        return
    }
    gGame.isMegaHintModeOn = false
    renderMegaHintModeDisplay(false)
}

function handleMegaHintClick(ellCell,rowIdx,colIdx){
    gGame.megaHintMarkedPoss.push({i:rowIdx,j:colIdx})
    gGame.megaHintsClicksCount--
    ellCell.classList.add('hinted')
    if (gGame.megaHintsClicksCount>0) return
    showMegaHint()
    gGame.megaHintsCount--
    resetMegaHint()
    renderMegaHintModeDisplay(false)
    renderMegaHintsClicksCount()
}

function renderMegaHintsClicksCount(){
    const elMegaHintSpanSpan = document.querySelector('span.mega-hint span')
    elMegaHintSpanSpan.innerText = gGame.megaHintsCount
}

function resetMegaHint(){
    gGame.isMegaHintModeOn = false
    gGame.megaHintsClicksCount = 2
    gGame.megaHintMarkedPoss= []
}

function showMegaHint(){
    const pos1 = gGame.megaHintMarkedPoss[0]
    const pos2 = gGame.megaHintMarkedPoss[1]
    var biggerRowIdx
    var smallerRowIdx
    var biggerColIdx
    var smallerColIdx
    if (pos1.i>pos2.i) {
        biggerRowIdx = pos1.i
        smallerRowIdx = pos2.i
    } else {
        biggerRowIdx = pos2.i
        smallerRowIdx = pos1.i
    }
    if (pos1.j>pos2.j) {
        biggerColIdx = pos1.j
        smallerColIdx = pos2.j
    } else {
        biggerColIdx = pos2.j
        smallerColIdx = pos1.j
    }
    for (var i = smallerRowIdx ; i<=biggerRowIdx ; i++){
        for (var j = smallerColIdx ; j<=biggerColIdx ; j++){
            const currCell = gBoard[i][j]
         hintCell(currCell,i,j,2000)
        }
    }
}

function hintCell(cell,i , j, revealTime=1000){
    if (!cell.isShown) {
        const elCell = getElCellFromPos(i, j)
        if (cell.isMine) {
            elCell.innerText = MINE
        } else if (cell.mineNegsCount > 0) {
            elCell.innerText = cell.mineNegsCount
        }
        elCell.classList.add('hinted')
        setTimeout(() => {
            elCell.innerText = (cell.isMarked) ? FLAG : EMPTY;
            elCell.classList.remove('hinted')
        }, revealTime)
    }   
}

function placeMine(ellCell, i, j) {
    gBoard[i][j].isMine = true
    ellCell.innerText = MINE
    gGame.revealedMinesCount++
    if (gGame.revealedMinesCount === gGame.currLevel.minesCount) {
        gGame.revealedMinesCount = 0
        gGame.isWaitingToStart = true
        setTimeout(() => {
            renderBoard();
            gGame.isWaitingToStart = false
        }, 3000)
        // TODO: RENDER A 'PENDING...' MODAL
        printBoard()
        gGame.isOn = true
    }
}

function loseLife() {
    gGame.livesCount--
    var livesStr = ' '
    for (var i = 0; i < gGame.livesCount; i++) {
        livesStr += LIFE + ' '
    }
    const elLivesSpan = document.querySelector('.lives-container span')
    elLivesSpan.innerText = livesStr.trimEnd()
}

function showCell(cell, elCell) {
    cell.isShown = true
    gGame.shownCount++
    elCell.classList.add('shown')
}

function expandShown(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            const currCell = gBoard[i][j]
            if (currCell.isMine || currCell.isShown) continue
            const elCell = getElCellFromPos(i, j)
            if (currCell.mineNegsCount > 0) {
                showCell(currCell, elCell)
                elCell.innerText = currCell.mineNegsCount
            } else {
                onCellClicked(elCell, i, j, true)
            }
        }
    }
}

function getElCellFromPos(i, j) {
    const elCell = document.querySelector(`#cell-${i}-${j}`)
    return elCell
}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    const currCell = gBoard[i][j]
    if (currCell.isShown) return
    gBoards.push(copyBoard(gBoard))
    gGames.push(copyGame(gGame))
    if (!currCell.isMarked) {
        gGame.markedCount++
        elCell.innerText = FLAG
        checkGameOver()
    } else {
        gGame.markedCount--
        elCell.innerText = EMPTY
    }
    currCell.isMarked = !currCell.isMarked
    elCell.classList.toggle('marked')
}

function checkGameOver() {
    if (gGame.livesCount === 0) {
        loseGame()
    } else if (gGame.markedCount + gGame.revealedMinesCount === gGame.currLevel.minesCount && gGame.shownCount === gGame.currLevel.size ** 2 - gGame.currLevel.minesCount) {
        winGame()
    }
    // TODO: RENDER GAME OVER MODAL
}

function winGame() {
    const elSmileyButton = document.querySelector('.smiley')
    elSmileyButton.innerText = '😎'
    console.log('You win :)');
    stopGame()
    var level
    switch (gGame.currLevel.size) {
        case 4:
            level = 'Easy'
            break
        case 8:
            level = 'Medium'
            break
        case 12:
            level = 'Extreme'
            break
        default:
            level = null
            break
    }
    if (gGame.time < localStorage.getItem(level)) localStorage.setItem(level, gGame.time)
}

function loseGame() {
    const elSmileyButton = document.querySelector('.smiley')
    elSmileyButton.innerText = '🤯'
    console.log('You lose :(');
    stopGame()
}

function stopGame() {
    gGame.isOn = false
    gGame.isGameOver = true
    clearInterval(gGame.timerIntervalId)
}

function setMineNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            currCell.mineNegsCount = countMineNegs(i, j)
        }
    }
}

function countMineNegs(rowIdx, colIdx) {
    var mineNegsCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            const currCell = gBoard[i][j]
            if (currCell.isMine) mineNegsCount++
        }
    }
    return mineNegsCount
}

function getRandMinePos() {
    const minePoss = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isShown) continue
            if (currCell.isMine) minePoss.push({ i, j })
        }
    }
    if (!minePoss.length) return null
    const randMinePos = minePoss.splice(getRandomInt(0, minePoss.length), 1)[0]
    return randMinePos
}

function getRandEmptyPosEx(rowIdx = null, colIdx = null) {
    const emptyPoss = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (i === rowIdx && j === colIdx) continue
            const currCell = gBoard[i][j]
            if (!currCell.isMine) emptyPoss.push({ i, j })
        }
    }
    if (!emptyPoss.length) return null
    const randEmptyPos = emptyPoss.splice(getRandomInt(0, emptyPoss.length), 1)[0]
    return randEmptyPos
}

function copyGame(game) {
    const gameCopy = {}
    for (var key in game) {
        gameCopy[key] = game[key]
    }
    return gameCopy
}

function copyBoard(board) {
    var boardCopy = []
    for (var i = 0; i < board.length; i++) {
        boardCopy[i] = []
        for (var j = 0; j < board[i].length; j++) {
            const currCell = board[i][j]
            const cellCopy = {
                isShown: currCell.isShown,
                isMine: currCell.isMine,
                isMarked: currCell.isMarked,
                mineNegsCount: currCell.mineNegsCount
            }
            boardCopy[i][j] = cellCopy
        }
    }
    return boardCopy
}

function startTimer() {
    gGame.startTime = Date.now()
    gGame.timerIntervalId = setInterval(renderTimer, 1000)
}

function renderTimer() {
    gGame.time = (Date.now() - gGame.startTime)
    const timer = getTimerStrFromTime(gGame.time)
    const elTimerSpanSpan = document.querySelector('.timer span')
    elTimerSpanSpan.innerText = timer
}

function getTimerStrFromTime(time) {
    var seconds = parseInt(time / 1000)
    var minutes = parseInt(seconds / 60)
    seconds %= 60
    if (seconds < 10) seconds = '0' + seconds
    if (minutes < 10) minutes = '0' + minutes
    const timer = minutes + ':' + seconds
    return timer
}

// MAYBE I'LL THOSE FUNCTIONS LATER
// RIGHT NOW IT'S BETTER TO SEE THE LEVELS DISPLAYED ON TOP

function createLevels() {
    const levels = [
        createLevel(4, 2),
        createLevel(8, 14),
        createLevel(12, 32)
    ]
    return levels
}

function createLevel(size, minesCount) {
    const level = {
        size,
        minesCount
    }
    return level
}

// FOR DEVELOPMENT

function printBoard() {
    var displayBoard = []
    for (var i = 0; i < gBoard.length; i++) {
        displayBoard[i] = []
        for (var j = 0; j < gBoard[i].length; j++) {
            displayBoard[i][j] = (gBoard[i][j].isMine) ? MINE : EMPTY
        }
    }
    console.table(displayBoard)
}