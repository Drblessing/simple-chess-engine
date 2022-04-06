"use strict";
let onSnapEnd = function () {
  board.position(game.fen());
};

let onMouseoverSquare = function (square, piece) {
  let moves = game.moves({
    square: square,
    verbose: true,
  });

  if (moves.length === 0) return;

  greySquare(square);

  for (let i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

let onMouseoutSquare = function (square, piece) {
  removeGreySquares();
};

let greySquare = function (square) {
  let squareEl = $("#board .square-" + square);

  let background = "#a9a9a9";
  if (squareEl.hasClass("black-3c85d") === true) {
    background = "#696969";
  }

  squareEl.css("background", background);
};

let removeGreySquares = function () {
  $("#board .square-55d63").css("background", "");
};

let renderMoveHistory = function (moves) {
  let historyElement = $("#move-history").empty();
  historyElement.empty();
  for (let i = 0; i < moves.length; i = i + 2) {
    historyElement.append(
      "<span>" +
        moves[i] +
        " " +
        (moves[i + 1] ? moves[i + 1] : " ") +
        "</span><br>"
    );
  }
  historyElement.scrollTop(historyElement[0].scrollHeight);
};

let onDragStart = function (source, piece, position, orientation) {
  if (
    game.in_checkmate() === true ||
    game.in_draw() === true ||
    piece.search(/^b/) !== -1
  ) {
    return false;
  }
};

let onDrop = function (source, target) {
  let move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });

  removeGreySquares();
  if (move === null) {
    return "snapback";
  }

  renderMoveHistory(game.history());
  setTimeout(makeBestMove, 250);
};

let config = {
  pieceTheme: "https://chessboardjs.com/img/chesspieces/alpha/{piece}.png",
  draggable: true,
  dropOffBoard: "snapback", // this is the default
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
};
const pieceValue = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

const calculatePieceValue = function (piece) {
  const { type, color } = piece;
  let value = pieceValue[type];
  if (color === "w") {
    value = -value;
  }
  return value;
};

const evaluateBoard = function (game) {
  let evaluation = 0;
  const col = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const row = [1, 2, 3, 4, 5, 6, 7, 8];
  col.forEach((col) => {
    row.forEach((row) => {
      const piece = game.get(`${col}${row}`);
      if (piece !== null) {
        evaluation += calculatePieceValue(piece);
      }
    });
  });
  return evaluation;
};

let positionCount;
let calculateBestMove = function (game) {
  // const moves = game.moves();
  // const move_evaluation = [];
  // moves.forEach((move) => {
  //   game.move(move);
  //   move_evaluation.push(evaluateBoard(game));
  //   game.undo();
  // });
  // const max = Math.max(...move_evaluation);
  // const index = move_evaluation.indexOf(max);
  // console.log(move_evaluation);
  // return moves[index];
  if (game.game_over()) {
    alert("game over");
  }

  positionCount = 0;
  let now = new Date();
  let bestMove = minimaxRoot(game, 4, true);
  let then = new Date();
  const moveTime = then - now;
  const positionperS = (positionCount * 1000) / moveTime;
  console.log(positionCount, moveTime / 1000, positionperS);
  return bestMove;
};

const makeBestMove = function () {
  const move = calculateBestMove(game);
  game.move(move);
  board.position(game.fen());
  if (game.game_over()) {
    alert("Game over!");
  }
};

const minimaxRoot = function (game, depth, movingPlayer) {
  let bestMove = -Infinity;
  let bestMoveFound;
  game.moves().forEach((move) => {
    game.move(move);
    let value = minimax(game, depth - 1, !movingPlayer);
    game.undo();
    if (value >= bestMove) {
      bestMove = value;
      bestMoveFound = move;
    }
  });
  return bestMoveFound;
};

const minimax = function (game, depth, movingPlayer) {
  positionCount++;
  if (depth === 0) {
    return evaluateBoard(game);
  }
  if (movingPlayer) {
    let bestMove = -Infinity;
    game.moves().forEach((move) => {
      game.move(move);
      let currentMove = minimax(game, depth - 1, !movingPlayer);
      game.undo();
      if (currentMove > bestMove) {
        bestMove = currentMove;
      }
    });
    return bestMove;
  } else {
    let bestMove = Infinity;
    game.moves().forEach((move) => {
      game.move(move);
      let currentMove = minimax(game, depth - 1, !movingPlayer);
      game.undo();
      if (currentMove < bestMove) {
        bestMove = currentMove;
      }
    });
    return bestMove;
  }
};

let board = Chessboard("board", config);
let game = new Chess();

let c = 0;
let play = function () {
  c += 1;
  if (game.game_over()) {
    return;
  }

  if (c % 2 === 1) {
    makeBestMove();
  } else {
    makeRandomMove();
  }
  evaluateBoard(game);

  setTimeout(play, 1000);
};

// play();
