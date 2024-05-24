'use strict'

const EMPTY = ''
const MINE = '💣'
const FLAG = '⛳️'
const LIFE = '♥️'
const HINT = '💡'
const SMILEY = '😀'
const WIN_SMILEY = '😎'
const LOSE_SMILEY = '🤯'
const PENDING_EMOJI = '⏳'
const MANUAL_MODE_EMOJI = '🤖'

var gBoardsHistory = []
var gGameDataHistory = []

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
    livesCount: 3,
    hintsCount: 3,
    safeClicksCount: 3,
    startTime: null,
    time: 0,
    timerIntervalId: null,
    isHintMarked: false,
    isManualModeOn: false,
    isPending: false,
    minesExterminatedCount: 0,
    megaHintsCount: 1,
    isMegaHintModeOn: false,
    megaHintsClicksCount: 2,
    megaHintMarkedPoss: [],
    isDarkModeOn: false
}

function onInit() {
    clearInterval(gGame.timerIntervalId)
    buildBoard()
    resetGame()
    renderSmiley(SMILEY)
    renderResetTimer()
    renderDisplay()
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

function resetGame() {
    gBoardsHistory = []
    gGameDataHistory = []
    gGame.isOn = false
    gGame.isGameOver = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.revealedMinesCount = 0
    gGame.livesCount = 3
    gGame.hintsCount = 3
    gGame.safeClicksCount = 3
    gGame.startTime = null
    gGame.isHintMarked = false
    gGame.isManualModeOn = false
    gGame.isPending = false
    gGame.minesExterminatedCount = 0
    gGame.megaHintsCount = 1
    resetMegaHint()
}

function renderDisplay() {
    renderBoard()
    clearHintsMarks()
    renderHintsCount()
    renderLivesCount()
    renderSafeClicks()
    renderMinesCount()
    renderManualModeDisplay()
    renderMegaHintModeDisplay()
    renderMegaHintsClicksCount()
    renderBestScores()
}

function setMinesAtRandPossEx(rowIdx, colIdx) {
    for (var i = 0; i < gGame.currLevel.minesCount; i++) {
        const randPos = getRandEmptyPosEx(rowIdx, colIdx)
        gBoard[randPos.i][randPos.j].isMine = true
    }
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

function showCell(cell, elCell) {
    cell.isShown = true
    gGame.shownCount++
    elCell.classList.add('shown')
}

function hintCell(cell, i, j, revealTime) {
    if (!cell.isShown) {
        const elCell = getElCellFromPos(i, j)
        if (cell.isMine) {
            elCell.innerText = MINE
        } else if (cell.mineNegsCount > 0) {
            elCell.innerText = cell.mineNegsCount
        }
        elCell.classList.add('hinted')
        gGame.isPending = true
        setTimeout(() => {
            elCell.innerText = (cell.isMarked) ? FLAG : EMPTY;
            elCell.classList.remove('hinted');
            gGame.isPending = false;
        }, revealTime)
    }
}

function showMegaHint() {
    const pos1 = gGame.megaHintMarkedPoss[0]
    const pos2 = gGame.megaHintMarkedPoss[1]
    var biggerRowIdx
    var smallerRowIdx
    var biggerColIdx
    var smallerColIdx
    if (pos1.i > pos2.i) {
        biggerRowIdx = pos1.i
        smallerRowIdx = pos2.i
    } else {
        biggerRowIdx = pos2.i
        smallerRowIdx = pos1.i
    }
    if (pos1.j > pos2.j) {
        biggerColIdx = pos1.j
        smallerColIdx = pos2.j
    } else {
        biggerColIdx = pos2.j
        smallerColIdx = pos1.j
    }
    for (var i = smallerRowIdx; i <= biggerRowIdx; i++) {
        for (var j = smallerColIdx; j <= biggerColIdx; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isShown) {
                const ellCell = getElCellFromPos(i, j)
                ellCell.classList.remove('hinted')
            }
            hintCell(currCell, i, j, 2000)
        }
    }
}

function placeMine(ellCell, i, j) {
    const cell = board[i][j]
    if (cell.isMine) {
        cell.isMine = false
        ellCell.innerText = EMPTY
        gGame.revealedMinesCount--
        renderMinesCount()
        return
    }
    cell.isMine = true
    ellCell.innerText = MINE
    gGame.revealedMinesCount++
    renderMinesCount()
    if (gGame.revealedMinesCount === gGame.currLevel.minesCount) {
        gGame.revealedMinesCount = 0
        gGame.isPending = true
        renderSmiley(PENDING_EMOJI)
        setTimeout(() => {
            renderBoard();
            renderMinesCount();
            gGame.isPending = false;
            renderSmiley(SMILEY)
        }, 3000)
        gGame.isOn = true
    }
}

function checkGameOver() {
    if (gGame.livesCount === 0) {
        loseGame()
        return
    }
    if (gGame.markedCount + gGame.revealedMinesCount === gGame.currLevel.minesCount - gGame.minesExterminatedCount &&
        gGame.shownCount === gGame.currLevel.size ** 2 - gGame.currLevel.minesCount + gGame.minesExterminatedCount) {
        winGame()
    }
}

function loseGame() {
    renderSmiley(LOSE_SMILEY)
    stopGame()
}

function winGame() {
    renderSmiley(WIN_SMILEY)
    stopGame()
    updateBestScores()
}

function updateBestScores() {
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
    if (gGame.time < localStorage.getItem(level) ||
        !localStorage.getItem(level)) {
        localStorage.setItem(level, gGame.time)
    }
}

function stopGame() {
    gGame.isOn = false
    gGame.isGameOver = true
    clearInterval(gGame.timerIntervalId)
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

function getRandUnrevealedMinePos() {
    const minePoss = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isShown || currCell.isMarked) continue
            if (currCell.isMine) minePoss.push({ i, j })
        }
    }
    if (!minePoss.length) return null
    const randMinePos = minePoss.splice(getRandomInt(0, minePoss.length), 1)[0]
    return randMinePos
}

function resetMegaHint() {
    gGame.isMegaHintModeOn = false
    gGame.megaHintsClicksCount = 2
    gGame.megaHintMarkedPoss = []
}

function loseLife() {
    gGame.livesCount--
    renderLivesCount()
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

function startTimer() {
    gGame.startTime = Date.now()
    gGame.timerIntervalId = setInterval(renderTimer, 1000)
}

function getElCellFromPos(i, j) {
    const elCell = document.querySelector(`#cell-${i}-${j}`)
    return elCell
}

function storeMoveInHistory() {
    gBoardsHistory.push(copyBoard(gBoard))
    gGameDataHistory.push(copyGame(gGame))
}