'use strict'

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
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
  