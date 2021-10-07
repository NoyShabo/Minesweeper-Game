'use strict';

const M = '💣';
const FLAG = '🏴‍☠️';
const EMPTY = ' ';
var gBoard = [];
var gTimeInterval = null;

var gMusic = {
    song: new Audio('./music/song.mp4'),
    musicOn: false
}

var gGame = {
    timerOn: false,
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isHintMode: false,
    hintUse: 0,
    saveUse: 0,
}

var gLevel = {
    size: 4,
    mines: 2
};


function init() {
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    document.addEventListener('onload', playMusic);
    endStartGame();
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.isOn = false;
    gGame.hintUse = 0;
    gGame.timerOn = false;
    gGame.saveUse = 0;
    buildBoard(gLevel.size);
    randomMines(gLevel.mines);
    setMinesNegsCount();
    gGame.isOn = true;
    renderBoard();
    changeSmile('😊');
}

function buildBoard(size) {
    gBoard = [];
    for (var i = 0; i < size; i++) {
        gBoard[i] = [];
        for (var j = 0; j < size; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isEmpty: false
            };
        }
    }
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            countMinesForCell(i, j);
        }
    }
}

function countMinesForCell(i, j) {
    if (gBoard[i][j].isMine) return;
    var countMins = 0;
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= gBoard.length) continue;
        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= gBoard[0].length) continue;
            if (col === j && row == i) continue;
            if (gBoard[row][col].isMine) countMins++;
        }
    }
    gBoard[i][j].minesAroundCount = countMins;
    if (countMins === 0) gBoard[i][j].isEmpty = true;
}

function renderBoard() {
    var cellContent = ' ';
    var classList = '';
    var smile = gGame.isOn ? '😊' : '😭';
    var boardHTML = `<h5></h5><table ><thead><tr><th colspan="${gBoard.length}">${smile}</th></tr></thead><tbody>`;
    for (var i = 0; i < gBoard.length; i++) {
        boardHTML += '<tr>';
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gGame.isOn) {
                var currCell = gBoard[i][j];
                cellContent = currCell.isMine ? M : (currCell.isEmpty ? EMPTY : currCell.minesAroundCount);
                classList = currCell.isShown ? 'class="showned"' : '';
            }
            boardHTML += `<td id="cell-${i}-${j}" ${classList} onmousedown="cellClicked(event,this,${i},${j})"><span>${cellContent}</span></td>`;
        }
        boardHTML += '</tr>';
    }
    boardHTML += '</tbody></table>';
    var elBoardContainer = document.querySelector('.board-container');
    elBoardContainer.innerHTML = boardHTML;
}

function cellClicked(ev, elCell, i, j) {
    if (!gGame.timerOn) {
        gGame.timerOn = true;
        startTimer();
    }
    if (gGame.isHintMode) return getHint(i, j);


    if (ev.button === 0)
        leftCellClicked(elCell, i, j);
    else if (ev.button === 2)
        cellMarked(elCell, i, j) //right cell clicked 
}

function leftCellClicked(elCell, i, j) {
    if (gBoard[i][j].isShown || !gGame.isOn) return;
    addRemoveclassShowned(elCell);
    var negMines = gBoard[i][j].minesAroundCount ? gBoard[i][j].minesAroundCount : EMPTY;
    elCell.innerHTML = gBoard[i][j].isMine ? M : negMines;
    gGame.shownCount++;
    gBoard[i][j].isShown = true;

    if (gBoard[i][j].isMine) {
        changeSmile('😭');
        endStartGame('You looser !')
    };
    if (gBoard[i][j].isEmpty) expandShown(i, j);
    checkVictory();
}

function cellMarked(elCell, i, j) { //right click

    if (gBoard[i][j].isShown) return;
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        elCell.innerHTML = FLAG;
        checkVictory();
    } else {
        elCell.innerHTML = EMPTY;
        gGame.markedCount--;
        gBoard[i][j].isMarked = false;
    }
}

function endStartGame(msg = null) {
    if (gTimeInterval) {
        clearInterval(gTimeInterval);
        gTimeInterval = null;
    }
    // start game hide modal
    var elModal = document.querySelector('.modal');
    var elHmsg = elModal.querySelector('h2');
    if (!msg) {
        elModal.style.display = 'none';
        document.querySelector('.timer span').innerText = '0';
        var elHints = document.querySelectorAll('.hints li');
        var elSavesBtn = document.querySelectorAll('.saveBtn li');
        for (var i = 0; i < elHints.length; i++) {
            elSavesBtn[i].style.textShadow = elHints[i].style.textShadow = `0 0 2px #fff, 0 0 2px #fff, 0 0 30px #fbff0f, 0 0 2px #fdf14c, 0 0 2px #fff785, 0 0 60px #fcf6a5, 0 0 70px #ffe15c`;
        }
        return;
    }
    // end game show modal
    gGame.isOn = false;
    if (msg === 'You looser !') //lose the game
        renderBoard();
    elHmsg.innerText = msg;
    elModal.style.display = 'block';
}

function randomMines(countMines) {
    for (var i = 0; i < countMines; i++) {
        var row = getRandomInt(0, gBoard.length - 1);
        var col = getRandomInt(0, gBoard[0].length - 1);
        if (gBoard[row][col].isMine) i--;
        gBoard[row][col].isMine = true;
    }
}

function checkVictory() {
    if ((gGame.shownCount === gLevel.size ** 2 - gLevel.mines) && gGame.markedCount === gLevel.mines) //cells that not mines
    {
        changeSmile('🤩');
        endStartGame('You winner !');
    }
}

function setLevel(idxLevel) {
    var levels = [{ size: 4, mines: 2 },
        { size: 8, mines: 12 },
        { size: 12, mines: 30 }
    ];
    gLevel = levels[idxLevel];
    clearInterval(gTimeInterval);
    gTimeInterval = null;
    init();
}

function expandShown(i, j) {
    if (gBoard[i][j].isMine) return;
    if (!gBoard[i][j].isEmpty) return;
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= gBoard.length) continue;
        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= gBoard[0].length) continue;
            if (col === j && row == i) continue;
            var currCell = gBoard[row][col];
            if (!currCell.isMine && !currCell.isShown) { //not a boom
                var elCurrCell = getElCell(row, col);
                elCurrCell.innerText = currCell.isEmpty ? EMPTY : currCell.minesAroundCount;
                gGame.shownCount++;
                if (!currCell.isShown) addRemoveclassShowned(elCurrCell);
                currCell.isShown = true;
                expandShown(row, col);
            }
        }
    }
}

function hintBtb(num) {
    if (gGame.hintUse >= 3) return;
    var elHints = document.querySelectorAll('.hints li');
    elHints[num].style.textShadow = 'none';
    gGame.isHintMode = true;
    gGame.hintUse++;
}

function saveBtn(num) {
    if (gGame.saveUse >= 3) return;
    var elSaves = document.querySelectorAll('.saveBtn li');
    elSaves[num].style.textShadow = 'none';
    gGame.saveUse++;

    var safePlace = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isShown) continue;
            safePlace.push({ i, j });
        }
    }

    if (!safePlace.length) return;
    var pos = safePlace[getRandomInt(0, safePlace.length - 1)];
    var elRandCell = getElCell(pos.i, pos.j);
    elRandCell.classList.add('save-cell');

    setTimeout(() => {
        elRandCell.classList.remove('save-cell');
    }, 1000);

}

function getHint(i, j) {
    gGame.isHintMode = false;
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= gBoard.length) continue;
        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= gBoard[0].length) continue;
            var currCell = gBoard[row][col];
            if (!currCell.isShown) { //not a boom
                var elCurrCell = getElCell(row, col);
                elCurrCell.innerText = currCell.isEmpty ? EMPTY : (currCell.isMine ? M : currCell.minesAroundCount);
                clearCellTimeOut(elCurrCell);
            }
        }
    }
}

function clearCellTimeOut(elCell) {
    setTimeout(() => {
        elCell.innerText = EMPTY;
    }, 1000);
}

function getElCell(row, col) {
    return document.querySelector(`#cell-${row}-${col}`);;
}

function addRemoveclassShowned(elCell) {
    elCell.classList.toggle('showned');
}

function changeSmile(smile) {
    var elSmile = document.querySelector('th');
    elSmile.innerText = smile;
}