'use strict'

function onCellClicked(elCell, i, j, isRecoursive = false) {
    if (gGame.isPending || gGame.isGameOver) return
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
        handleMegaHintClick(elCell, i, j)
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
        renderMinesCount()
        loseLife()
    }
    checkGameOver()
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

function onLevelClicked(lvlIdx) {
    gGame.currLevel = gLevels[lvlIdx]
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

function handleHint(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
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
    gGame.isMegaHintModeOn = false
    renderMegaHintModeDisplay()
}

function handleMegaHintClick(ellCell, rowIdx, colIdx) {
    gGame.megaHintMarkedPoss.push({ i: rowIdx, j: colIdx })
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
    renderSafeClicks()
}

function onMinesExterminatorClicked() {
    if (!gGame.isOn) return
    gBoards.push(copyBoard(gBoard))
    for (var i = 0; i < 3; i++) {
        const randMinePos = getRandUnrevealedMinePos()
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

function onSmileyClicked(){
    gGame.currLevel.minesCount += gGame.minesExterminatedCount
    onInit()
}

function onUndoClicked() {
    if (gBoards.length <= 1) return
    gBoard = gBoards.pop()
    gGame = gGames.pop()
    renderDisplay()
}