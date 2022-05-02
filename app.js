const form = document.querySelector('form');
const playersHeader = document.querySelector('.header'); // has data atts firstPlayer, secondPlayer, previous
const cells = document.querySelectorAll('.cell'); // updates classlist win and tie
const modalOuter = document.querySelector('.modal-outer');
const startBtn = document.querySelector('.startGame');
const restartBtn = document.querySelector('.restartGame');
const newGameBtn = document.querySelector('.newGame')
// put a dataset id for players here to determine if player 1 is already filled

let playerOne = {}
let playerTwo = {}
let board


const winCombo = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [2,5,8],
    [1,4,7],
    [0,4,8],
    [6,4,2]
]



function handleSubmit(e) {
    e.preventDefault();

    let playerSubmitted = e.currentTarget.player.value;
    const player = playerValue(playerSubmitted)
    displayPlayer(player)
    e.currentTarget.player.value = ''
}



// factory
function playerValue(player) {
    const name =  player
    return { name }
}

function disableForm() {
    if (playersHeader.dataset.playerOne && playersHeader.dataset.playerTwo) {
        form.player.disabled = true;
    }
}


function displayPlayer(player) {
    if (playersHeader.dataset.playerOne) {
        const playerTwoEl = playersHeader.querySelector('.playerTwo');
        const playerEl = playerTwoEl.querySelector('h3');
        const scoreEl = playerTwoEl.querySelector('p');

        playerEl.textContent = player.name;
        playersHeader.dataset.playerTwo = player.name
        
        playerTwo.name = player.name
        playerTwo.score = 0;
        playerTwo.scoreEl = scoreEl
        playerTwo.mark = 'O'
        
        disableForm();
        closeModal();

        playGame();
        return;
    }

    const playerOneEl = playersHeader.querySelector('.playerOne');
    const playerEl = playerOneEl.querySelector('h3');
    const scoreEl = playerOneEl.querySelector('p');
    
    playerEl.textContent = player.name;
    playersHeader.dataset.playerOne = player.name
    
    playerOne.name = player.name
    playerOne.score = 0;
    playerOne.scoreEl = scoreEl
    playerOne.mark = 'X';  
    
    return;
}

function playGame() {
    removeClasses();
    
    if (!playersHeader.dataset.playerOne && !playersHeader.dataset.playerTwo) {
        const message = "First Enter Players to play!"
        openModal(message);
    }

    board = Array.from(Array(9).keys());
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.addEventListener('click', turnClick);
    })
};


function turnClick(e) {
    if (e.target.textContent) {
        openModal('Selected Box is chosen, please go again!');
    }
    
    if (playersHeader.dataset.playerTwo === 'notWin' && playersHeader.dataset.playerOne === playerOne.name) {
        if (typeof board[e.target.id] === 'number') {
            turn(e.target.id, playerOne);
            if (!checkWin(board, playerOne) && !checkTie()) turn(bestSpot(), playerTwo);
        }

    } else if (!playersHeader.dataset.previousMove && playersHeader.dataset.playerTwo !== 'notWin') {
        if (typeof board[e.target.id] === 'number') {
            playersHeader.dataset.previousMove = playerOne.name;
            turn(e.target.id, playerOne);
        }
    } else if (playersHeader.dataset.previousMove === playerOne.name && playersHeader.dataset.playerTwo !== 'notWin') {
        if (typeof board[e.target.id] === 'number') {
            playersHeader.dataset.previousMove = playerTwo.name;
            turn(e.target.id, playerTwo);
        }
       
    } else if (playersHeader.dataset.previousMove === playerTwo.name && playersHeader.dataset.playerTwo !== 'notWin') {
        if (typeof board[e.target.id] === 'number') {
            playersHeader.dataset.previousMove = playerOne.name;
            turn(e.target.id, playerOne);
        }
    }
}

function bestSpot() {
    return minimax(board, playerTwo.mark).index
}

function minimax(newBoard, player) {
    let availSpots = emptyCells();

    if (checkWin(newBoard, playerOne)) {
        return { score: -10 };
    } else if (checkWin(newBoard, playerTwo)) {
        return { score: 20 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }
    // moves is an array of objects
    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        // move has the index and score property

        let move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player === playerTwo.mark) {
            let result = minimax(newBoard, playerOne.mark);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, playerTwo.mark);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;

        moves.push(move);
        
    }

    let bestMove;
    if (player === playerTwo.mark) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        } 
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
            
        } 
    }

    return moves[bestMove];
}

function turn(square, player) {
    board[square] = player.mark;
    document.getElementById(square).textContent = player.mark;  
    
    let gameWon = checkWin(board, player);
    
    if (gameWon) {
        gameOver(gameWon, player);
    } else if (!gameWon) {
        checkTie();
    }
}

function checkWin(boardData,player) {
    let plays = boardData.reduce((previous, current, index) => {
        if (current === player.mark) {
            return previous.concat(index)
        } else {
            return previous
        }
    },[])
    let gameWon = null;

    for (let [index,win] of winCombo.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index, player }
            break;
        }
    }
    
    return gameWon
}

function gameOver(won, player) {
    for (let index of winCombo[won.index]) {
        document.getElementById(index).classList.add('win');
    }

    cells.forEach(cell => cell.removeEventListener('click',turnClick))
    winner(`${player.name} is the winner!`,player);
}

function winner(message, player) {
   openModal(message);
   // TODO: update Score here
   if (!player) return;
   player.score =  player.score + 1;
   player.scoreEl.textContent = `Score: ${player.score}`
}

function emptyCells() {
    return board.filter(i => typeof i === 'number')
}

function checkTie() {
    if (emptyCells().length === 0) { 
        cells.forEach(cell => {
            cell.classList.add('tie');
            cell.removeEventListener('click', turnClick, false);
        })
        winner("Tie Game!");
        return true;
    }
    return false;
};

function removeClasses() {
    cells.forEach(cell => {
        cell.classList.remove('tie')
        cell.classList.remove('win')
    })
}


function openModal(message) {
    modalOuter.classList.add('open')
    const modalInner = document.querySelector('.modal-inner');
    const modalBody = modalInner.querySelector('.modal-content');
    const modalButton = modalInner.querySelector('.close-modal-btn');
    modalBody.textContent = message;

    modalButton.addEventListener('click', closeModal);
}

function closeModal(e) {
    if (modalOuter.classList.contains('open')) {
        modalOuter.classList.remove('open');
    }
}

function restartGame() {
    cells.forEach(cell => cell.textContent = '')
    removeClasses();
    playGame();
}

function clearForm() {
    form.player.value = "";
}

function clearScore() {
    const playerTwoEl = playersHeader.querySelector('.playerTwo');
    const playerTwoDisplay = playerTwoEl.querySelector('h3');
    const scoreTwoEl = playerTwoEl.querySelector('p');

    const playerOneEl = playersHeader.querySelector('.playerOne');
    const playerOneDisplay = playerOneEl.querySelector('h3');
    const scoreOneEl = playerOneEl.querySelector('p');
    
    playerOneDisplay.textContent = "Player 1"
    scoreOneEl.textContent = "Score:"
    playerTwoDisplay.textContent = "Player 2"
    scoreTwoEl.textContent = "Score:"

}

function newGame() {
    playerOne = {};
    playerTwo = {};
    form.player.disabled = false;
    clearForm();

    playersHeader.dataset.playerOne = ""
    playersHeader.dataset.playerTwo = ""
    playersHeader.dataset.previousMove = ""
    clearScore();

    playGame();

}

// function autoCloseModal(){
//     if (playersHeader.dataset.playerOne && playersHeader.dataset.playerTwo) {
//        return closeModal();
//     }
// };


startBtn.addEventListener('click',playGame);
modalOuter.addEventListener('click',closeModal);
form.addEventListener('submit',handleSubmit);
restartBtn.addEventListener('click', restartGame);
newGameBtn.addEventListener('click', newGame)

