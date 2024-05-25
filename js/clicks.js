'use strict'

function onCellClicked(elCell, i, j, isRecoursive = false) {
    if (gGame.isPending || gGame.isGameOver) return
    if (gGame.isHintMarked) {
        handleHint({ i, j })
        return
    }
    if (!gGame.isOn) {
        if (gGame.isManualModeOn) {
            placeMine(elCell, i, j)
            return
        }
        gGame.isOn = true
        setMinesAtRandPossEx({ i, j })
    }
    if (gGame.isManualModeOn) {
        gGame.isManualModeOn = false
        renderManualModeDisplay()
    }
    if (gGame.shownCount === 0) {
        setMineNegsCount()
        startTimer()
    }
    if (gGame.isMegaHintModeOn) {
        handleMegaHintClick(elCell, { i, j })
        return
    }
    if (!isRecoursive) {
        storeMoveInHistory()
    }
    const currCell = gBoard[i][j]
    if (currCell.isShown) return
    if (currCell.isMarked) {
        currCell.isMarked = false
        gGame.markedCount--
    }
    showCell(currCell, elCell)
    if (!currCell.isMine) {
        onSafeCellClicked(currCell, { i, j }, elCell)
    } else {
        onMineClicked(elCell)
    }
    checkGameOver()
}

function onSafeCellClicked(cell, pos, elCell) {
    if (cell.mineNegsCount > 0) {
        elCell.innerText = cell.mineNegsCount
    } else {
        elCell.innerText = EMPTY
        expandShown(pos)
    }
}

function onMineClicked(elCell) {
    gGame.shownCount--
    gGame.revealedMinesCount++
    elCell.innerText = MINE
    elCell.classList.add('mine')
    renderMinesCount()
    gGame.livesCount--
    renderLivesCount()
}


function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    const currCell = gBoard[i][j]
    if (currCell.isShown) return
    storeMoveInHistory()
    currCell.isMarked = !currCell.isMarked
    elCell.classList.toggle('marked')
    if (currCell.isMarked) {
        gGame.markedCount++
        elCell.innerText = FLAG
        checkGameOver()
    } else {
        gGame.markedCount--
        elCell.innerText = EMPTY
    }
    renderMinesCount()
}

function onDarkModeClicked() {
    const elElements = document.getElementsByTagName('*')
    for (var i = 0; i < elElements.length; i++) {
        const elElement = elElements[i]
        elElement.classList.toggle('dark-mode')
    }
    gGame.isDarkModeOn = !gGame.isDarkModeOn
    const elDarkModeButton = document.querySelector('.dark-mode-button')
    elDarkModeButton.innerText = gGame.isDarkModeOn ? 'Light mode 🌞' : 'Dark mode 🌚'
}

function onLevelClicked(idx) {
    gGame.currLevel = gLevels[idx]
    onInit()
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

function handleHint(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue
            const currCell = gBoard[i][j]
            hintCell(currCell, i, j, 1000)
        }
    }
    gGame.hintsCount--
    renderHintsCount()
    gGame.isHintMarked = false
}

function onMegaHintClicked() {
    if (!gGame.isOn || gGame.megaHintsCount === 0) return
    if (!gGame.isMegaHintModeOn) {
        gGame.isMegaHintModeOn = true
        renderMegaHintModeDisplay()
        return
    }
    if (gGame.megaHintsClicksCount === 1) {
        resetMegaHint()
        clearHintedCell()
    }
    gGame.isMegaHintModeOn = false
    renderMegaHintModeDisplay()
}

function handleMegaHintClick(ellCell, pos) {
    gGame.megaHintMarkedPoss.push(pos)
    gGame.megaHintsClicksCount--
    ellCell.classList.add('hinted')
    if (gGame.megaHintsClicksCount > 0) return
    showMegaHint()
    gGame.megaHintsCount--
    resetMegaHint()
    gGame.isMegaHintModeOn = false
    renderMegaHintModeDisplay()
    renderMegaHintsClicksCount()
}

function onSafeClicked() {
    if (!gGame.isOn || gGame.safeClicksCount === 0 ||
        areAllNonMineCellsShown()) {
        return
    }
    while (true) {
        var randEmptyPos = getRandEmptyPosEx()
        if (!randEmptyPos) return
        if (!gBoard[randEmptyPos.i][randEmptyPos.j].isShown) break
    }
    const elCell = getElCellFromPos(randEmptyPos.i, randEmptyPos.j)
    elCell.classList.add('safe')
    setTimeout(() => elCell.classList.remove('safe'), 4000);
    gGame.safeClicksCount--
    renderSafeClicks()
}

function onMinesExterminatorClicked() {
    if (!gGame.isOn || !getRandUnrevealedMinePos()) return
    storeMoveInHistory()
    for (var i = 0; i < 3; i++) {
        const randMinePos = getRandUnrevealedMinePos()
        if (!randMinePos) break
        const currCell = gBoard[randMinePos.i][randMinePos.j]
        currCell.isMine = false
        gGame.minesExterminatedCount++
        if (currCell.isMarked) {
            currCell.isMarked = false
            gGame.markedCount--
        }
    }
    setMineNegsCount()
    renderBoard()
    renderMinesCount()
}

function onManualModeClicked() {
    if (gGame.isManualModeOn) {
        onInit()
        return
    }
    onInit()
    gGame.isManualModeOn = true
    renderManualModeDisplay()
}

function onUndoClicked() {
    if (gBoardsHistory.length <= 1 || gGame.isManualModeOn) return
    gBoard = gBoardsHistory.pop()
    gGame = gGameDataHistory.pop()
    renderDisplay()
}