document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grille');
    let squares = Array.from(document.querySelectorAll('.grille div'));
    const width = 10;
    const ScoreDisplay = document.querySelector('#score');
    const StartBtn = document.querySelector('#start-button');
    let nextRandom = 0;
    let timerId;
    let score = 0;
    const colors = [
        '#ff7716', // orange
        '#ff3737', // red
        '#bf00bf', // purple
        '#0cc70c', // green
        '#2f94fd' // blue
    ]

    // les pieces
    const Lpiece = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ]
    const Zpiece = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ]
    const Tpiece = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ]
    const Opiece = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ]
    const Ipiece = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ]

    const lesPieces = [Lpiece, Zpiece, Tpiece, Opiece, Ipiece];

    let currentPosition = 4;
    let currentRota = 0;

    // selectionner une piece et sa rotation aléatoirement
    let random = Math.floor(Math.random() * lesPieces.length)
    let current = lesPieces[random][currentRota];

    // dessiner la premiere piece
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('piece');
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }
    // effacer une piece
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('piece');
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    // assigner les fonctions des code de touches
    function control(e) {
        if (e.keyCode === 37) {
            moveLeft()
        } else if (e.keyCode === 38) {
            rotate()
        } else if (e.keyCode === 39) {
            moveRight()
        } else if (e.keyCode === 40) {
            moveDown()
        }
    }
    document.addEventListener('keydown', control)

    // function bouger vers le bas
    function moveDown() {
        undraw()
        currentPosition += width
        draw()
        freeze()
    }

    // function immobilisante
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            // afficher une nouvelle piece qui tombe
            random = nextRandom
            nextRandom = Math.floor(Math.random() * lesPieces.length)
            current = lesPieces[random][currentRota];
            currentPosition = 4;
            addScore()
            draw();
            displayShape()
            
            gameOver()
        }
    }

    // déplacer une piece à gauche même si au bord ou blocage
    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        if (!isAtLeftEdge) currentPosition -= 1

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }

        draw()
    }
    // déplacer une piece à gauche même si au bord ou blocage
    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)

        if (!isAtRightEdge) currentPosition += 1

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }

        draw()
    }

    // rotation d'une piece
    function rotate() {
        // If these 3 tetromino rotate on being either edge, these shapes gets splits on both the sides so ↓
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        if (!isAtRightEdge && !isAtLeftEdge) {
            undraw()
            currentRota++
            if (currentRota === current.length) { // si la rotation en cours arrive à 4, il faut le remettre à 0
                currentRota = 0
            }
            current = lesPieces[random][currentRota];
            draw();
        }

    }

    // montrer la prochaine piece en haut à droite
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    let displayIndex = 5


    // les pieces sans rotations
    const upNextPieces = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], // L
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // Z
        [1, displayWidth, displayWidth + 1, displayWidth + 2],// T
        [0, 1, displayWidth, displayWidth + 1], // O
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] // I
    ]

    // afficher les formes dans la mini grid
    function displayShape() {
        // enleve toutes traces de pieces dans toute la mini grid
        displaySquares.forEach(s => {
            s.classList.remove('piece')
            s.style.backgroundColor = ''
        })
        upNextPieces[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('piece')
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        })
    }


    // ajout de fonctionnalité au bouton
    StartBtn.addEventListener("click", () => {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
            grid.classList.add('grayscale','blur-sm')
            document.removeEventListener('keydown', control);
        } else {
            draw()
            timerId = setInterval(moveDown, 1000)
            grid.classList.remove('grayscale','blur-sm')
            document.addEventListener('keydown', control)
            //nextRandom = Math.floor(Math.random() * lesPieces.length)
            //displayShape()
        }
    })

    // score +
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10
                ScoreDisplay.innerHTML = score
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('piece')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    // game over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            ScoreDisplay.innerHTML = 'Terminé'
            clearInterval(timerId)
        }
    }

    window.addEventListener("keydown", function(e) {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);


})