'use strict'

function renderBoard() {
    const darkModeClassStr = (gGame.isDarkModeOn) ? ' dark-mode' : ''
    var strHTML = `<table class="board${darkModeClassStr}">`
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
            strHTML += `<td id="cell-${i}-${j}" class="${classStr + darkModeClassStr}"
                        onclick="onCellClicked(this,${i},${j})"
                        oncontextmenu="onCellMarked(this,${i},${j});return false;">
                        ${innerText}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</table>'
    var elBoardContainer = document.querySelector('.board-container')
    elBoardContainer.innerHTML = strHTML
}

function renderHintsCount() {
    var strHTML = ''
    for (var i = 1; i <= gGame.hintsCount; i++) {
        strHTML += `<span class="hint" onclick="onHintClicked(this)"> ${HINT} </span>`
    }
    const elHintsContainerSpan = document.querySelector('.hints-container span')
    elHintsContainerSpan.innerHTML = strHTML
}

function clearHintsMarks() {
    const elHints = document.querySelectorAll('.hint')
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].classList.remove('marked')
    }
}

function clearHintedCell() {
    const elHintedCell = document.querySelector('td.hinted')
    elHintedCell.classList.remove('hinted')
}

function renderLivesCount() {
    var livesStr = ' '
    for (var i = 0; i < gGame.livesCount; i++) {
        livesStr += LIFE + ' '
    }
    const elLivesSpan = document.querySelector('.lives-container span')
    elLivesSpan.innerText = livesStr.trimEnd()
}

function renderMinesCount() {
    const elMinesCountSpan = document.querySelector('.mines-count span')
    elMinesCountSpan.innerText = gGame.currLevel.minesCount - gGame.markedCount - gGame.revealedMinesCount
}

function renderMegaHintsClicksCount() {
    const elMegaHintSpan = document.querySelector('span.mega-hint span')
    elMegaHintSpan.innerText = gGame.megaHintsCount
}

function renderMegaHintModeDisplay() {
    const isOn = gGame.isMegaHintModeOn
    const elMegaHintButton = document.querySelector('button.mega-hint')
    if (isOn) {
        elMegaHintButton.classList.add('on')
    } else {
        elMegaHintButton.classList.remove('on')
    }
    const ellCells = document.querySelectorAll('.board td')
    for (var i = 0; i < ellCells.length; i++) {
        const elCell = ellCells[i]
        if (isOn) {
            elCell.style.cursor = 'pointer'
        } else if (!elCell.classList.contains('shown')) {
            elCell.style.cursor = 'pointer'
        } else {
            elCell.style.cursor = 'revert'
        }
    }
}

function renderSafeClicks() {
    const elSafeClickSpan = document.querySelector('.safe-click span')
    elSafeClickSpan.innerText = gGame.safeClicksCount
}

function renderSmiley(emoji) {
    const elSmileyButton = document.querySelector('.smiley')
    elSmileyButton.innerText = emoji
}

function renderManualModeDisplay() {
    const elManualButton = document.querySelector('.manual-mode')
    if (gGame.isManualModeOn) {
        elManualButton.classList.add('on')
    } else {
        elManualButton.classList.remove('on')
    }
}

function renderResetTimer() {
    const elTimerSpan = document.querySelector('.timer span')
    elTimerSpan.innerText = '00:00'
}

function renderTimer() {
    gGame.time = (Date.now() - gGame.startTime)
    const timer = getTimerStrFromTime(gGame.time)
    const elTimerSpan = document.querySelector('.timer span')
    elTimerSpan.innerText = timer
}

function renderBestScores() {
    for (var level in localStorage) {
        const elBestScoreDisplay = document.querySelector('.' + level.toLowerCase())
        if (!localStorage.getItem(level)) break
        const bestScore = getTimerStrFromTime(localStorage.getItem(level))
        elBestScoreDisplay.innerText = bestScore
    }
}