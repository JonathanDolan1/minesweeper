'use strict'

const EMPTY = ''
const MINE = '💣'

var gBoard
var gLevel = {
    size: 4,
    minesNum: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInit() {
    buildBoard()
    setMineNegsCount()
    renderBoard()
}

function buildBoard() {
    gBoard = []
    for (var i = 0; i < gLevel.size; i++) {
        gBoard[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            const cell = {
                isShown: false,
                isMine: false,
                isMarked: true,
                mineNegsCount: 0
            }
            gBoard[i][j] = cell
        }
    }
    // gBoard[2][0].isMine = true
    // gBoard[1][2].isMine = true
    setMinesAtRandPoss()
}

function setMinesAtRandPoss(){
    for (var i = 0 ; i <gLevel.minesNum ; i ++){
        const randPos = getRandEmptyPos()
        console.log(randPos);
        gBoard[randPos.i][randPos.j].isMine = true
    }
}

function renderBoard() {
    var strHTML = '<table class="board">'
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            var currTdInnerText = (currCell.isMine) ? MINE : EMPTY
            // currTdInnerText += currCell.mineNegsCount
            strHTML += `<td onclick="onCellClicked(this,${i},${j})">${currTdInnerText}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</table>'
    var elBoardContainer = document.querySelector('.board-container')
    elBoardContainer.innerHTML = strHTML
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

function onCellClicked(elCell, i, j) {
    const currCell = gBoard[i][j]
    if (!currCell.isMine){
        elCell.innerText = currCell.mineNegsCount
    }
}

function onCellMarked(elCell) {

}

function checkGameOver() {

}

function expandShown(board, elCell, i, j) {

}

function getRandEmptyPos(){
    const emptyPoss = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            if (!currCell.isMine) emptyPoss.push({i,j})
        }
    }
    if (!emptyPoss.length) return null
    const randEmptyPos = emptyPoss.splice(getRandomInt(0,emptyPoss.length),1)[0]
    return randEmptyPos
}
