'use strict'

const EMPTY = ''
const MINE = '💣'
const FLAG = '⛳️'
const LIFE = '♥️'

var gBoard
var gLevels = [{size: 4, minesNum: 2},{size: 8, minesNum: 14},{size: 12, minesNum: 32}]
var gCurrLevel = gLevels[0]

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    livesCount: 3
}


function onInit() {
    buildBoard()
    renderBoard()
}

function buildBoard() {
    gBoard = []
    for (var i = 0; i < gCurrLevel.size; i++) {
        gBoard[i] = []
        for (var j = 0; j < gCurrLevel.size; j++) {
            const cell = {
                isShown: false,
                isMine: false,
                isMarked: false,
                mineNegsCount: 0
            }
            gBoard[i][j] = cell
        }
    }
    printBoard();
}

function setMinesAtRandPossEx(rowIdx, colIdx) {
    for (var i = 0; i < gCurrLevel.minesNum; i++) {
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
            strHTML += `<td id="cell-${i}-${j}" onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,${i},${j});return false;">${EMPTY}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</table>'
    var elBoardContainer = document.querySelector('.board-container')
    elBoardContainer.innerHTML = strHTML
}

function onLevelClicked(lvlIdx){
    gCurrLevel = gLevels[lvlIdx]
    onInit()
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) {
        // gBoard[0][0].isMine = true
        // gBoard[0][1].isMine = true
        setMinesAtRandPossEx(i, j)
        setMineNegsCount()
        gGame.isOn = true
        printBoard()
    }
    const currCell = gBoard[i][j]
    // debugger
    if (currCell.isShown) return
    console.log('i', i, 'j', j);
    showCell(currCell, elCell)
    if (!currCell.isMine) {
        if (currCell.mineNegsCount > 0) {
            elCell.innerText = currCell.mineNegsCount
        } else {
            expandShown(i, j)
        }
    } else {
        elCell.innerText = MINE
        loseLife()
    }
    checkGameOver(!currCell.isMine)
}

function loseLife() {
    gGame.livesCount--
    console.log('gGame.livesCount:', gGame.livesCount);
    var livesStr = ' '
    for (var i = 0; i < gGame.livesCount; i++) {
        livesStr += LIFE + ' '
    }
    const elLivesSpan = document.querySelector('.lives span')
    elLivesSpan.innerText = livesStr.trimEnd()
}

function showCell(cell, elCell) {
    cell.isShown = true
    gGame.shownCount++
    elCell.classList.add('shown')
    console.log('gGame.shownCount', gGame.shownCount);
}

function expandShown(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            const currCell = gBoard[i][j]
            if (currCell.isMine) continue
            const elCell = getElCellFromPos(i, j)
            if (currCell.mineNegsCount > 0) {
                if (!currCell.isShown) showCell(currCell,elCell)
                elCell.innerText = currCell.mineNegsCount
            } else {
                onCellClicked(elCell, i, j)
            }
        }
    }
}

function getElCellFromPos(i, j) {
    const elCell = document.querySelector(`#cell-${i}-${j}`)
    return elCell
}

function onCellMarked(elCell, i, j) {
    const currCell = gBoard[i][j]
    if (currCell.isShown) return
    if (!currCell.isMarked) {
        gGame.markedCount++
        elCell.innerText = FLAG
        checkGameOver(true)
    } else {
        gGame.markedCount--
        elCell.innerText = EMPTY
    }
    currCell.isMarked = !currCell.isMarked
    elCell.classList.toggle('marked')
}

function checkGameOver(isWin) {
    if (!isWin) {
        if (gGame.livesCount === 0) {
            const elButton = document.querySelector('button')
            elButton.innerText = '🤯'
            console.log('You lose :(');
        }
    } else if (gGame.shownCount + gGame.markedCount === gCurrLevel.size ** 2) {
        const elButton = document.querySelector('button')
            elButton.innerText = '😎'
        console.log('You win :)');
    } else return
    // render modal
    gGame.isOn = false
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

function getRandEmptyPosEx(rowIdx, colIdx) {
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
