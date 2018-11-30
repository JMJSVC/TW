/**
 * Criar uma matriz que representa o estado do jogo
 *
 * @param {Number} height
 * @param {Number} width
 */
function createBoard(height, width) {
    var board = [];
    for (var y = 0; y < height; y++) {
        var row = [];
        for (var x = 0; x < width; x++) {
            row.push(null);
        }
        board.push( row );
    }
    return board;
}

/**
 * Desenha na página o tabuleiro
 *
 * @param {Array} status
 */
function drawBoard( data ) {
    var board = document.getElementById("board");

    let user = window.auth ? window.auth.nick : 1
    let myColor = window.remoteGame ? window.remoteGame.myColor : '1'
    let otherColor = myColor == 1 ? '2' : '1'

    board.innerHTML = ""

    var y, x;
    var row;
    for(x = 0; x < data.length; x++) {
        column = document.createElement("div");
        column.className = "column";
        column.dataset.index = x;
        column.onclick = selectColumn
        for (y = 0; y < data[0].length; y++) {
            var cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.loser = false;

            if ( data[x][y] ) {
                cell.dataset.value = data[x][y] == user ? myColor : otherColor;
            }

            column.appendChild(cell);
        }
        board.appendChild(column);
    }
}

/**
 * Procurar uma célula livre na coluna x
 *
 * @param {Number} x
 */
function findFreeCell (x) {

    // Percorrer a coluna de baixo para cima
    for (var y = gameStatus.board.length - 1; y >= 0; y--) {
        // Parar se encontrar uma célula livre
        if ( gameStatus.board[y][x] == 0 ) break;
    }
    return y;
}

/**
 * Escolhe uma célula livre na coluna x,
 * ou numa coluna aleatória se x == undefined
 *
 * @param {Number|undefined} x
 */
function pickColumn (x) {

    if ( window.config.mode == 'single' ) {

        var y = -1;
        var random = ( x == undefined );

        while ( y < 0 ) {

            if ( random ) x = getRndInteger(0, gameStatus.board[0].length);

            y = findFreeCell(x);

            if ( ! random ) break;

        }

        if ( y < 0 ) return false;

        // Escolher a célula encontrada
        pickCell(x, y);

        return true;

    } else {

        notify(x)

    }

}

function pickCell (x, y) {

    // Terminar se a célula estiver preenchida
    if ( gameStatus.board[y][x] != 0 ) return;

    // Atualizar estado do jogo
    gameStatus.board[y][x] = gameStatus.blueTurn ? 1 : 2;
    gameStatus.blueTurn = ! gameStatus.blueTurn;

    // Redesenhar tabuleiro
    drawBoard();

    // Jogada do CPU
    if ( ! verify() && gameStatus.withCPU && ! gameStatus.blueTurn ) cpuTurn();
}

/**
 * Verificar se o jogo terminou
 */
function isGameOver () {

    var x, y, initialX, initialY, i, value;
    var height = gameStatus.board.length;
    var width  = gameStatus.board[0].length;

    // 1. Verificar horizontal
    for (y = 0; y < height; y++) {

        for (x = 0; x < width - 3; x++) {

            value = gameStatus.board[y][x];

            if (value == 0) continue;

            for (i = 1; i < 4; i++) {
                if ( gameStatus.board[y][x + i] != value ) break;
            }

            if (i == 4) return value;
        }

    }

    // 2. Verificar vertical
    for(y = 0; y < height -3 ; y++) {

        for(x= 0; x < width; x++) {

            value = gameStatus.board[y][x];

            if(value == 0) continue;

            for(i=1; i<4;i++) {
                if(gameStatus.board[y+i][x] != value) break;

            }

            if(i==4) return value;
        }
    }

    // 3.a Verificar diagonal principal (inferior)

    for (initialY = 0; initialY < height - 3; initialY++) {

        for ( x = 0, y = initialY; x < width - 3 && y < height - 3; x++, y++ ) {

            value = gameStatus.board[y][x];

            if (value == 0) continue;

            for (i = 1; i < 4; i++) {
                if ( gameStatus.board[y + i][x + i] != value ) break;
            }

            if(i==4) return value;
        }

    }

    // 3.b Verificar diagonal principal (superior)

    for (initialX = 1; initialX < width - 3; initialX++) {

        for ( x = initialX, y = 0; x < width - 3 && y < height - 3; x++, y++ ) {

            value = gameStatus.board[y][x];

            if (value == 0) continue;

            for (i = 1; i < 4; i++) {
                if ( gameStatus.board[y + i][x + i] != value ) break;
            }

            if(i==4) return value;
        }

    }

    // 4.a Verificar diagonal secundaria (inferior)
    for(initialY = 0; initialY < height -3; initialY++) {

        for( x = width-1, y = initialY; x > width -3 && y < height -3; x--, y++) {
            //console.log(y,x, initialY)
            value = gameStatus.board[y][x];

            if(value == 0) continue;

            for(i = 1; i < 4; i++) {
                if(gameStatus.board[y+i][x-i] != value) break;
            }

            if(i==4) return value;
        }
    }


    // 4.b Verificar diagonal secundaria (superior)
    for(initialX = width-2; initialX >= width - 3; initialX--) {

        for(y = 0, x = initialX; y < height - 3 && x >= width - 3; y++, x--) {

            value  = gameStatus.board[y][x];

            if(value == 0) continue;

            for(i= 1; i < 4; i++) {
                if(gameStatus.board[y+i][x-i] != value) break;
            }

            if(i==4) return value;
        }
    }

    if (isFull()) return 0;

    return -1;
}

function isFull() {
    var x;
    var width = gameStatus.board[0].length;
    for(x = 0; x < width; x++) {
        if(gameStatus.board[0][x] == 0) return false;
    }

    return true;
}

function verify() {

    var gameOver = isGameOver();

    if (gameOver != -1) {
        if(gameOver == 1) {
            cont1++;
            gameScores[0].win++;
            gameScores[1].loss++;
        } else if (gameOver == 2) {
            cont2++;
            gameScores[1].win++;
            gameScores[0].loss++;
        } else {
            contE++;
            gameScores[0].draw++;
            gameScores[1].draw++;
        }
        gameStatus.gameOver = true;

        scoreboardModal.querySelector('.blue-win').innerHTML  = gameScores[0].win;
        scoreboardModal.querySelector('.blue-draw').innerHTML = gameScores[0].draw;
        scoreboardModal.querySelector('.blue-loss').innerHTML = gameScores[0].loss;

        scoreboardModal.querySelector('.red-win').innerHTML  = gameScores[1].win;
        scoreboardModal.querySelector('.red-draw').innerHTML = gameScores[1].draw;
        scoreboardModal.querySelector('.red-loss').innerHTML = gameScores[1].loss;

        showScoreboard();
        document.querySelector("#start-button").disabled = false;
        document.querySelector("#quit-button").disabled = true;
    }

    return false;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
// ================================================================
// @@ EVENTS
// ================================================================

/**
 * Iniciar o jogo
 */
function startEvent () {

    // 1. Ler altura e largura (da configuração)
    var height=document.getElementsByName("board_height")[0].value;
    var width=document.getElementsByName("board_width")[0].value;

    if(height < 5|| width < 5) {
        alert("A matriz minima é 5 por 5!");
        return;
    }

    // 2. Criar estado de jogo
    gameStatus = {
        board    : createBoard(height, width),
        blueTurn : !! document.querySelector('#settings-turn input:checked').value,
        withCPU  : !! document.querySelector('#settings-mode input:checked').value,
        ia       : document.querySelector('#settings-ia input:checked').value,
        gameOver : false
    };


    // 3. Desenhar o tabuleiro na página
    drawBoard();

    // 4. Jogada CPU, se necessário
    if ( gameStatus.withCPU && ! gameStatus.blueTurn ) {
        cpuTurn();
    }

}


/**
 * Escolher uma coluna
 */
function clickCellEvent (event) {
    if (gameStatus && gameStatus.gameOver) return;
    pickColumn(event.target.dataset.x);
}

function cpuTurn() {
    if (gameStatus.gameOver == true) return;
    pickColumn();
}

function showScoreboard() { scoreboardModal.className = "modal open"; }
function hideScoreboard() { scoreboardModal.className = "modal"; }

function showGuide() { guideModal.className = "modal open"; }
function hideGuide() { guideModal.className = "modal"; }


// Criar os Event Listeners
var scoreboardModal = document.querySelector("#scoreboard");
var guideModal = document.querySelector("#guide");

// document.querySelector("#start-button").onclick =  function() {
//     startEvent();
//     document.querySelector("#start-button").disabled = true;
//     document.querySelector("#quit-button").disabled = false;
// };

// document.querySelector("#quit-button").onclick = function () {
//     document.querySelector("#quit-button").disabled = true;
//     document.querySelector("#start-button").disabled = false;
//     gameScores[0].loss++;
//     gameScores[1].win++;
//     scoreboardModal.querySelector('.blue-win').innerHTML  = gameScores[0].win;
//     scoreboardModal.querySelector('.blue-draw').innerHTML = gameScores[0].draw;
//     scoreboardModal.querySelector('.blue-loss').innerHTML = gameScores[0].loss;
//     scoreboardModal.querySelector('.red-win').innerHTML  = gameScores[1].win;
//     scoreboardModal.querySelector('.red-draw').innerHTML = gameScores[1].draw;
//     scoreboardModal.querySelector('.red-loss').innerHTML = gameScores[1].loss;
//     showScoreboard();
//     document.querySelector("#board").innerHTML = "";
// };

document.querySelector("#guide-button").onclick = function () {
    showGuide();
    hideScoreboard();
};

document.querySelector("#results-button").onclick = function () {
    showScoreboard();
    hideGuide();
};

document.querySelectorAll(".modal .close").forEach(function (closeButton) {
    closeButton.onclick = function (event) {
        event.target.parentNode.className = "modal";
    };
});


var gameStatus;
var gameScores = [
    { name: 'Azul',     win: 0, draw: 0, loss: 0 },
    { name: 'Vermelho', win: 0, draw: 0, loss: 0 },
];
var cont1 = 0;
var cont2 = 0;
var contE = 0;







function selectColumn ( event ) {

    let column = event.target.dataset.index

    if ( window.config.mode == 'single' ) {



    } else {

        notify( column )

    }

}

function waiting () {
    document.querySelector("#waiting").classList.remove("hidden")
    if ( window.remoteGame ) {
        document.querySelector("#waiting button").classList.remove('hidden')
    }
}

function resume () {
    document.querySelector("#waiting").classList.add("hidden")
    document.querySelector("#waiting button").classList.add("hidden")
}

function post ( endpoint, body ) {
    return fetch(`http://twserver.alunos.dcc.fc.up.pt:8008/${endpoint}`, {
        method: "POST",
        body: JSON.stringify( body )
    })
}

function register () {

    const nick = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if ( ! nick || ! pass ) return false

    waiting()

    post('register', {nick, pass} )
        .then(response => {

            if ( response.status == 200 ) {

                document.querySelector('.header .auth').classList.toggle('hidden')
                document.querySelector('.header .user-data').classList.toggle('hidden')
                document.querySelector('.header .user-data h3').textContent = 'Bem vindo, ' + ( nick || 'Anónimo' ) + '!'
                document.querySelector('#mode-multi').disabled = false

                window.auth = { nick, pass }

            } else {

                delete window.auth
                document.getElementById('password').value = ""
                alert('Credenciais inválidas!')

            }

            resume()

        })

    return false
}

function logout () {
    leave()
    document.querySelector('.header .auth').classList.toggle('hidden')
    document.querySelector('.header .user-data').classList.toggle('hidden')
    document.querySelector('#username').value = ""
    document.querySelector('#password').value = ""
    document.querySelector('#mode-multi').disabled = true
    setMode( 'single' )
    delete window.auth
}

function leave () {
    if ( window.remoteGame ) {
        let game = window.remoteGame.gameID
        let nick = window.auth.nick
        let pass = window.auth.pass

        post('leave', {game, nick, pass})
    }

    document.querySelector('#start-button').classList.remove('hidden')
    document.querySelector('#quit-button').classList.add('hidden')

    resume()
}

function stopUpdate () {
    if ( window.updateSource ) {
        window.updateSource.close()
        delete window.updateSource
    }
}

function join () {

    if ( ! window.auth ) return

    waiting()

    post('join', {
        "group": 55,
        "nick": window.auth.nick,
        "pass": window.auth.pass,
        "size": window.config.size
    })
        .then(response => response.json())
        .then(data => {

            if ( data.error ) {
                delete window.remoteGame
                alert('Erro ao procurar jogo!')
            }

            window.remoteGame = {
                gameID: data.game,
                status: 'waiting'
            }

            window.updateSource = new EventSource(`http://twserver.alunos.dcc.fc.up.pt:8008/update?nick=${window.auth.nick}&game=${data.game}`)
            window.updateSource.onmessage = newUpdate

            console.log('UPDATE started')
            console.log(window.updateSource)

            waiting()
        })
}

function notify ( column ) {

    if ( ! window.remoteGame ) return false

    let nick = window.auth.nick
    let pass = window.auth.pass
    let game = window.remoteGame.gameID

    post('notify', {nick, pass, game, column})
        .then(response => response.json())
        .then(data => {

            if ( data.error ) {
                alert('ERRO')
            }

        })

}

function turn ( player ) {

    if ( window.config.mode == 'single' ) {

    } else {

        if ( player == window.auth.nick ) {

            document.querySelector('.board-container').classList.remove('loading')

        } else {

            document.querySelector('.board-container').classList.add('loading')
            document.querySelector('.board-container .loader').innerHTML = 'À espera do adversário...'

        }

    }

}

function newUpdate (event) {
    const data = JSON.parse( event.data )
    console.log('Updated:')
    console.log(data)

    if ( data.board ) {

        document.querySelector('#start-button').classList.add('hidden')
        document.querySelector('#quit-button').classList.remove('hidden')

        window.remoteGame.turn  = data.turn

        if ( Array.isArray( data.board ) ) {
            window.remoteGame.board = data.board
        } else {
            // Game start
            window.remoteGame.board = data.board.board
            window.remoteGame.myColor = window.auth.nick == window.remoteGame.turn ? '1' : '2'
        }

        drawBoard( window.remoteGame.board )
        turn( window.remoteGame.turn )

    }

    if ( data.winner ) {

        document.querySelector('#start-button').classList.remove('hidden')
        document.querySelector('#quit-button').classList.add('hidden')

        document.querySelector('.board-container').classList.add('loading')
        document.querySelector('.board-container .loader').innerHTML = data.winner == window.auth.nick ? 'Ganhou!' : 'Perdeu!'

        console.log('Ganhou o ' + data.winner)

        stopUpdate()
    }

    resume()
}














function start () {

    if ( window.config.mode == 'single' ) {

    } else {

        join()

    }

}

function setMode ( mode ) {
    window.config.mode = mode

    document.querySelector(`#mode-${mode}`).checked = true

    if ( mode == 'single' ) {

        document.querySelectorAll("#settings-turn, #settings-ia").forEach(item => item.classList.add('disabled'))

        document.querySelectorAll('.single-only').forEach(element => {
            element.classList.remove('hidden')
        })

    } else {

        document.querySelectorAll('.single-only').forEach(element => {
            element.classList.add('hidden')
        })

    }
}




var config = {
    size: {
        rows: 5,
        columns: 5
    },

    mode: "single",

    first: "me",
}

function init () {

    // Definições
    document.querySelector(`#size-rows`).value = config.size.rows
    document.querySelector(`#size-columns`).value = config.size.columns
    document.querySelector(`#mode-${config.mode}`).checked = true
    document.querySelector(`#first-${config.first}`).checked = true

}
init()

// drawBoard( createBoard(4, 4) )