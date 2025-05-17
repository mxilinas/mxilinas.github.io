"use client"


import { useRef, useState, useEffect } from "react";
import { createContext, useContext } from "react";
import { ReactNode } from "react";
import styles from "./page.module.css";
import { CSSProperties } from "react";
import { Property } from "csstype";
import assert from "assert";


/** The side-length of a chessboard in squares. */
const BOARD_WIDTH = 8;


/** The side-length of a square in pixels. */
const SQUARE_WIDTH = 100;


/** The colorscheme of the chessboard.
    * ---
    * light    : The background color of the light squares.
    * dark     : The background color of the dark squares.
    * selected : The background color of the selected square.
    */
const COLOR_SCHEME: Record<string, string> = {
    light: "#808080",
    dark: "#4d4d4d",
    selected: "#4d994d",
    ui_light: "#666666",
    ui_dark: "#333333",
}


/** An enum representing the different types of chess pieces.
    * ---
    * Uppercase letters represent white pieces.
    * Lowercase letters represent black pieces.
    *
    * E: Empty (Not a piece, used for board representation).
    *
    * K: White King   Q: White Queen  R: White Rook
    * B: White Bishop N: White Knight P: White Pawn
    *
    * k: Black King   q: Black Queen  r: Black Rook
    * b: Black Bishop n: Black Knight p: Black Pawn
    */
enum PieceType {
    E,
    K, Q, R, B, N, P,
    k, q, r, b, n, p,
}
const { E, K, Q, R, B, N, P, k, q, r, b, n, p, } = PieceType


/** Stores information about castling rights.
    * ---
    * right: True if the right rook has not been moved.
    * left:  True if the left rook has not been moved.
    */
interface CastlingRights {
    right: boolean,
    left: boolean,
}


/** The time remaining on the clocks in milliseconds.
    * white: The time left on white's clock.
    * black: The time left of black's clock.
    */
interface Time {
    white: number,
    black: number
}


/** Unicode icons for each piece type. */
const ICONS: Record<string, string> = {
    E: `\u25A1`,
    K: `\u2654`, Q: `\u2655`, R: `\u2656`,
    B: `\u2657`, N: `\u2658`, P: `\u2659`,
    k: `\u265A`, q: `\u265B`, r: `\u265C`,
    b: `\u265D`, n: `\u265E`, p: `\u265F`,
}


enum ERROR {
    SAME_SQUARE,
    SAME_COLOR,
    INVALID_MOVE,
}


type Result = {
    newBoard: Board,
    captured: PieceType,
}

type Color = "white" | "black";

/** A square on a chess board.
    * ---
    * coord: The square's position on the board.
    * color: The square's background color (light or dark).
    * piece: The type of piece on the square.
    */
interface Square {
    coord: Coord,
    color: string,
    piece: PieceType,
}


/** A position on the board in rows and colums. */
type Coord = {
    row: number,
    col: number
};


/** A position in the viewport in pixels. */
type Pos = {
    x: number,
    y: number
};


/* A record of the pieces each player has captured.
    * white: The black pieces white has captured.
    * black: The white pieces black has captured.
    */
type Captured = {
    white: PieceType[];
    black: PieceType[];
}


/** A chessboard represented as a multi-dimensional array.
    * ---
    * Each sub-array is a row on the board.
    */
type Board = Square[][]


/** The initial board layout for a new game. */
const initLayout = [
    [r, n, b, q, k, b, n, r],
    [p, p, p, p, p, p, p, p],
    [E, E, E, E, E, E, E, E],
    [E, E, E, E, E, E, E, E],
    [E, E, E, E, E, E, E, E],
    [E, E, E, E, E, E, E, E],
    [P, P, P, P, P, P, P, P],
    [R, N, B, Q, K, B, N, R],
];


const KNIGHT_MOVES: Coord[] = [
    { row: -2, col: 1 },
    { row: -1, col: 2 },
    { row: 1, col: 2 },
    { row: 2, col: 1 },
    { row: 2, col: -1 },
    { row: 1, col: -2 },
    { row: -1, col: -2 },
    { row: -2, col: -1 },
]


const KING_MOVES: Coord[] = [
    { row: -1, col: 1 },
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: -1, col: -1 },
    { row: 0, col: -1 },
    { row: 1, col: -1 },
]


const kingCastleMoves = {
    white: {
        right: { row: 7, col: 6 },
        left: { row: 7, col: 1 }
    },
    black: {
        right: { row: 0, col: 6 },
        left: { row: 0, col: 1 }
    }
}


/** Copy a square.
    * @param s - A square on a chessboard.
    * @returns A copy of s.
    */
function copySquare(s: Square): Square {
    const copy: Square = {
        coord: s.coord,
        color: s.color,
        piece: s.piece,
    };
    return copy;
}


/** Perform a deep copy of a chess board.
    * ---
    * @param bd - The chess board to copy.
    * @returns A deep copy of the original board.
    */
function copyBoard(bd: Board): Board {
    const copy: Board = [];
    for (let rowIndex = 0; rowIndex < BOARD_WIDTH; rowIndex++) {
        const row: Square[] = [];
        for (let colIndex = 0; colIndex < BOARD_WIDTH; colIndex++) {
            row.push(copySquare(bd[rowIndex][colIndex]))
        }
        copy.push(row);
    }
    return copy;
}


/** Compare two coordinates.
    * ---
    * @param c0 - The first coordinate to compared.
    * @param c1 - The second coordinate to compare.
    * @returns True if the c0 and c1 refer to the same row and column.
    */
function compareCoords(c0: Coord, c1: Coord): boolean {
    return (c0.row === c1.row) && (c0.col === c1.col);
}


/** Add two coordinates together.
    * ---
    * @param c0 - The first coordinate to add.
    * @param c1 - The second coordinate to add.
    * @returns The sum of c0 and c1.
    */
function addCoord(c0: Coord, c1: Coord): Coord {
    return { row: c0.row + c1.row, col: c0.col + c1.col };
}


/** Compare two squares on the board.
    * @param sq0 - The first square to compare.
    * @param sq1 - The second sqaure to compare.
    * @returns True if sq0 and sq1 refer to the same location on the board.
    */
function sameSquare(sq0: Square, sq1: Square): boolean {
    return compareCoords(sq0.coord, sq1.coord);
}


/** True if a given square contains a black piece.
    * ---
    * @param s - A string with length 1.
    * @returns True if s contains a black piece.
    */
function isBlack(s: PieceType): boolean {
    const asciiValue = PieceType[s].charCodeAt(0);
    return asciiValue >= 97 && asciiValue <= 122; // 65-90 is uppercase, 97-122 is lowercase.
}
assert(isBlack(PieceType.k) === true)
assert(isBlack(PieceType.K) === false)


function isWhite(s: PieceType): boolean {
    const asciiValue = PieceType[s].charCodeAt(0);
    return asciiValue >= 65 && asciiValue <= 90; // 65-90 is uppercase, 97-122 is lowercase.
}
assert(isWhite(PieceType.K) === true)
assert(isWhite(PieceType.k) === false)


/** Compare the color of the pieces of two squares on the board.
    * ---
    * @param sq0 - The first square to compare.
    * @param sq1 - The second square to compare.
    * @returns True if the squares contain the same color pieces.
    */
function sameColor(sq0: Square, sq1: Square): boolean {
    if (sq0.piece === PieceType.E) { return false }
    if (sq1.piece === PieceType.E) { return false }
    const bothBlack = isBlack(sq0.piece) && isBlack(sq1.piece);
    const bothWhite = isWhite(sq0.piece) && isWhite(sq1.piece);
    return bothBlack || bothWhite;
}


/** Get a reference to a sqaure on a board given a coordinate.
    * ---
    * @param c - A coordinate.
    * @param bd - A chessboard.
    * @returns The square at the given coordinate.
    */
function getSquare(c: Coord, bd: Board): Square {
    return copySquare(bd[c.row][c.col]);
}


/** Check if a given position is on the chessboard.
    * @param c - A coordinate.
    * @returns True if the given coordinate is on the board.
    */
function inBounds(c: Coord): boolean {
    return !(c.row >= BOARD_WIDTH || c.row < 0 || c.col >= BOARD_WIDTH || c.col < 0);
}


/** Move a piece on a board. Modifies the board in-place.
    * ---
    * @param bd - A chessboard.
    * @param from - The source square.
    * @param to - The desitination square.
    * @returns The piece on the destination square.
    */
function swapSquare(bd: Board, from: Square, to: Square): PieceType {
    const fromPiece = bd[from.coord.row][from.coord.col].piece;
    const toPiece = bd[to.coord.row][to.coord.col].piece;
    bd[to.coord.row][to.coord.col].piece = fromPiece;
    bd[from.coord.row][from.coord.col].piece = PieceType.E;
    return toPiece;
}


/** Remove a piece from the given square on a board.
    * ---
    * @param bd - A chessboard.
    * @param c - The coordinate of the square to clear.
    */
function removePiece(bd: Board, c: Coord): void {
    bd[c.row][c.col].piece = PieceType.E;
}


/** Make a move on a chessboard.
    * ---
    * @param bd - A chessboard.
    * @param from - The original position.
    * @param to - The destination.
    * @returns A new chessboard or an error.
    */
function move(bd: Board, from: Square, to: Square): Result {

    const newBoard = copyBoard(bd);

    // En passant black
    if (from.piece === PieceType.p) {
        const diagonal = (Math.abs(from.coord.row - to.coord.row) === 1 &&
            Math.abs(from.coord.col - to.coord.col) === 1);
        if (diagonal) {
            newBoard[to.coord.row - 1][to.coord.col].piece = PieceType.E;
        }
    }
    // En passant white
    if (from.piece === PieceType.P) {
        const diagonal = (Math.abs(from.coord.row - to.coord.row) === 1 &&
            Math.abs(from.coord.col - to.coord.col) === 1);
        if (diagonal) {
            newBoard[to.coord.row + 1][to.coord.col].piece = PieceType.E;
        }
    }

    // Black castle
    if (from.piece === PieceType.k) {
        if (from.coord.col - to.coord.col > 2) {
            swapSquare(newBoard, from, to);
            swapSquare(newBoard, getSquare({ row: 0, col: 0 }, newBoard),
                getSquare({ row: 0, col: 2 }, newBoard));
            return { newBoard: newBoard, captured: PieceType.E };
        }
        if (Math.abs(from.coord.col - to.coord.col) > 1) {
            swapSquare(newBoard, from, to);
            swapSquare(newBoard, getSquare({ row: 0, col: 7 }, newBoard),
                getSquare({ row: 0, col: 5 }, newBoard));
            return { newBoard: newBoard, captured: PieceType.E };
        }
    }

    // White Castle
    if (from.piece === PieceType.K) {
        if (from.coord.col - to.coord.col > 2) {
            swapSquare(newBoard, from, to);
            swapSquare(newBoard, getSquare({ row: 7, col: 0 }, newBoard),
                getSquare({ row: 7, col: 2 }, newBoard));
            return { newBoard: newBoard, captured: PieceType.E };
        }
        if (Math.abs(from.coord.col - to.coord.col) > 1) {
            swapSquare(newBoard, from, to);
            swapSquare(newBoard, getSquare({ row: 7, col: 7 }, newBoard),
                getSquare({ row: 7, col: 5 }, newBoard));
            return { newBoard: newBoard, captured: PieceType.E };
        }
    }

    // Promote black pawn to queen.
    if (from.piece === PieceType.p) {
        if (to.coord.row === BOARD_WIDTH - 1) {
            const p = swapSquare(newBoard, from, to);
            newBoard[to.coord.row][to.coord.col].piece = PieceType.q;
            return { newBoard: newBoard, captured: p };
        }
    }

    // Promote white pawn to queen.
    if (from.piece === PieceType.P) {
        if (to.coord.row === 0) {
            const p = swapSquare(newBoard, from, to);
            newBoard[to.coord.row][to.coord.col].piece = PieceType.Q;
            return { newBoard: newBoard, captured: p };
        }
    }

    const p = swapSquare(newBoard, from, to);

    return { newBoard: newBoard, captured: p };
}


/** Return true if the given number is even.
    * @param n - A number.
    * @returns True if n is even.
    */
function isEven(n: number): boolean {
    return n % 2 === 0
}


/** Get the correct background color for a square on a chessboard.
    * @param row - The row of the square on a board.
    * @param col - The column of the square on a board.
    */
function getBackgroundColor(row: number, col: number): string {
    if (isEven(row) && isEven(col) || !isEven(row) && !isEven(col)) {
        return COLOR_SCHEME.light
    } else {
        return COLOR_SCHEME.dark
    }
}


function setupBoard(): Board {
    const board: Board = [];
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        const row: Square[] = [];
        for (let colIndex = 0; colIndex < 8; colIndex++) {
            const square: Square = {
                coord: { row: rowIndex, col: colIndex },
                piece: initLayout[rowIndex][colIndex],
                color: getBackgroundColor(rowIndex, colIndex),
            };
            row.push(square);
        }
        board.push(row);
    }
    return board;
}


function getIcon(p: PieceType): string {
    return ICONS[PieceType[p]]
}


/** Print a chessboard to the console.
 * @param bd - A chessboard.
 */
function printBoard(bd: Board): void {
    console.log("Printing board...");
    for (let row = 0; row < 8; row++) {
        let s: string = "";
        for (let col = 0; col < 8; col++) {
            s = s.concat(ICONS[PieceType[bd[row][col].piece]]);
        }
        console.log(s);
    }
    console.log("Done!");
}


/** Checks if the square with the given id is contained in the legal moves.
    * @param id - The id of a square on the board.
    * @returns True if this square represents a legal move.
    */
function inLegalMoves(c: Coord, legalMoves: Coord[]): boolean {
    for (let i = 0; i < legalMoves.length; i++) {
        if (compareCoords(c, legalMoves[i])) {
            return true;
        }
    }
    return false;
}


/** Check if a square on the board is empty.
    * @param s - A square on the board.
    * @returns True if the square does not contain a chess piece.
    */
function isEmpty(s: Square): boolean {
    return s.piece === PieceType.E;
}


const MOVES: Record<string, (s: Square, bd: Board) => Coord[]> = {
    p: getPawnMoves,
    P: getPawnMoves,
    r: getRookMoves,
    R: getRookMoves,
    k: getKingMoves,
    K: getKingMoves,
    b: getBishopMoves,
    B: getBishopMoves,
    n: getKnightMoves,
    N: getKnightMoves,
    q: getQueenMoves,
    Q: getQueenMoves,
}


function getQueenMoves(s: Square, bd: Board): Coord[] {
    return getBishopMoves(s, bd).concat(getRookMoves(s, bd));
}


function getKnightMoves(s: Square, bd: Board): Coord[] {
    return KNIGHT_MOVES.map((c: Coord) => (
        addCoord(s.coord, c)
    )).filter(inBounds);
}


function getRookMoves(s: Square, bd: Board): Coord[] {
    const legalMoves: Coord[] = [];

    // right
    for (let col = s.coord.col + 1; col < BOARD_WIDTH; col++) {
        const newCoord = { row: s.coord.row, col: col };
        if (isEmpty(getSquare(newCoord, bd))) {
            legalMoves.push(newCoord);
            continue;
        }
        legalMoves.push(newCoord);
        break;
    }

    // left
    for (let col = s.coord.col - 1; col >= 0; col--) {
        const newCoord = { row: s.coord.row, col: col };
        if (isEmpty(getSquare(newCoord, bd))) {
            legalMoves.push(newCoord);
            continue;
        }
        legalMoves.push(newCoord);
        break;
    }

    // down
    for (let row = s.coord.row + 1; row < BOARD_WIDTH; row++) {
        const newCoord = { row: row, col: s.coord.col, };
        if (isEmpty(getSquare(newCoord, bd))) {
            legalMoves.push(newCoord);
            continue;
        }
        legalMoves.push(newCoord);
        break;
    }

    // up
    for (let row = s.coord.row - 1; row >= 0; row--) {
        const newCoord = { row: row, col: s.coord.col }
        if (isEmpty(getSquare(newCoord, bd))) {
            legalMoves.push(newCoord);
            continue;
        }
        legalMoves.push(newCoord);
        break;
    }

    return legalMoves;

}


function getBishopMoves(s: Square, bd: Board): Coord[] {
    const moves: Coord[] = [];

    function getDiagonalMoves(dir: Coord): void {
        let offset = { row: dir.row, col: dir.col };
        let c = { row: s.coord.row + offset.row, col: s.coord.col + offset.col }
        while (inBounds(c)) {
            if (isEmpty(getSquare(c, bd))) {
                moves.push(c);
                offset = { row: offset.row + dir.row, col: offset.col + dir.col };
                c = { row: s.coord.row + offset.row, col: s.coord.col + offset.col }
                continue;
            }
            moves.push(c);
            break;
        }
    }

    getDiagonalMoves({ row: 1, col: 1 });
    getDiagonalMoves({ row: 1, col: -1 });
    getDiagonalMoves({ row: -1, col: 1 });
    getDiagonalMoves({ row: -1, col: -1 });

    return moves;
}



/** Get the possible moves for the king on the given square.
    * @param s - The square with the king to move.
    * @returns All possible moves for the given king.
    */
function getKingMoves(s: Square): Coord[] {

    const moves: Coord[] = KING_MOVES.map((c: Coord) => (
        addCoord(s.coord, c))
    ).filter(inBounds);

    return moves;
}


/** True if the king on the given square has castling rights.
    * ---
    * @param s - The square with the king to castle.
    * @returns True if the given king can castle.
    */
function getCastleMoves(state: State, s: Square): Coord[] {
    const isblack = isBlack(s.piece);
    const moves: Coord[] = [];
    if (isblack) {
        if (state.castlingRights.black.left) {
            moves.push(kingCastleMoves.black.left);
        }
        if (state.castlingRights.black.right) {
            moves.push(kingCastleMoves.black.right);
        }
    } else {
        if (state.castlingRights.white.left) {
            moves.push(kingCastleMoves.white.left);
        }
        if (state.castlingRights.white.right) {
            moves.push(kingCastleMoves.white.right);
        }
    }
    return moves;
}


/** Get the color of the piece on the given square.
    * ---
    * @param s - A square on the board.
    * return The color of the piece on the given square.
    */
function getColor(s: Square): string {
    return isBlack(s.piece) ? "black" : "white";
}


function getPawnMoves(s: Square, bd: Board): Coord[] {
    const moves: Coord[] = [];

    let nextSquare: Coord;
    if (isBlack(s.piece)) {
        nextSquare = addCoord(s.coord, { row: 1, col: 0 });
    } else {
        nextSquare = addCoord(s.coord, { row: -1, col: 0 });
    }

    if (isEmpty(getSquare(nextSquare, bd))) {
        moves.push(nextSquare);

        let nextNextSquare: Coord;
        if (isBlack(s.piece)) {
            nextNextSquare = addCoord(s.coord, { row: 2, col: 0 });
        } else {
            nextNextSquare = addCoord(s.coord, { row: -2, col: 0 });
        }
        let onStartingSquare: boolean;
        if (isBlack(s.piece)) {
            onStartingSquare = s.coord.row === 1;
        } else {
            onStartingSquare = s.coord.row === 6;
        }
        if (onStartingSquare && isEmpty(getSquare(nextNextSquare, bd))) {
            moves.push(nextNextSquare);
        }

    }

    let rightDiag: Coord;
    let leftDiag: Coord;
    if (isBlack(s.piece)) {
        rightDiag = addCoord(s.coord, { row: 1, col: 1 });
        leftDiag = addCoord(s.coord, { row: 1, col: -1 });
    } else {
        rightDiag = addCoord(s.coord, { row: -1, col: 1 });
        leftDiag = addCoord(s.coord, { row: -1, col: -1 });
    }

    if (inBounds(rightDiag)) {
        const rightDiagSquare = getSquare(rightDiag, bd);
        if (rightDiagSquare != undefined) {
            if (rightDiagSquare.piece != PieceType.E) {
                moves.push(rightDiag);
            }
        }
    }

    if (inBounds(leftDiag)) {
        const leftDiagSquare = getSquare(leftDiag, bd);
        if (leftDiagSquare != undefined) {
            if (leftDiagSquare.piece != PieceType.E) {
                moves.push(leftDiag);
            }
        }
    }

    return moves
}


/** Get the id of the square at the given coordinate.
    * @param c - A coordinate.
    * @returns A string representing the id of the square at the given coordinate.
    */
function coordToId(c: Coord): string {
    return `${c.row}${c.col}`;
}


/** Convert mouse coordinate to a row and column on the board.
    * @param x - The x coordinate of the mouse in the viewport. 
    * @param y - The y coordinate of the mouse in the viewport.
    * @returns The corresponding row and column on the board.
    */
function posToCoord(x: number, y: number): Coord {
    const offset = getBoardOffset();

    const snappedCoord: Coord = {
        col: Math.floor((x - offset.x) / SQUARE_WIDTH),
        row: Math.floor((y - offset.y) / SQUARE_WIDTH)
    };

    return snappedCoord;
}


/** Get the offset of the board relative to the viewport.
    * @returns The distance between the board and the viewport origin in pixels.
    */
function getBoardOffset(): Pos {
    const boardElement = document.getElementById("board")

    if (boardElement === null) {
        return { x: 0, y: 0 };
    }

    // The distance between the origin of the viewport and the board.
    const xOffset = boardElement.getBoundingClientRect().left;
    const yOffset = boardElement.getBoundingClientRect().top;

    return { x: xOffset, y: yOffset };
}


/**
    * @param row - A column on the chessboard.
    * @param col - A row on the chessboard.
    * @returns The corresponding coorinates of the square in viewport space.
    */
function coordToPos(coord: Coord): Pos {
    const offset: Pos = getBoardOffset();

    const snappedCoord: Pos = {
        x: coord.col * SQUARE_WIDTH + offset.x,
        y: coord.row * SQUARE_WIDTH + offset.y
    };

    return snappedCoord;
}


// Return the square under the cursor.
function getSquareUnderCursor(e: MouseEvent, bd: Board): Square {
    return getSquare(posToCoord(e.clientX, e.clientY), bd);
}


// Return true if the given result is a board.
function isBoard(result: Board | ERROR): result is Board {
    return Array.isArray(result) && Array.isArray(result[0]);
}


// Return true if the given result is an error.
function isError(result: any | ERROR): result is ERROR {
    return ERROR[result as ERROR] != undefined
}


/** The game's current state.
    * ---
    * board: The internal representation of the chess board.
    * legalMoves: The legal moves of the piece on the selected square.
    * selected: The currently selected square.
    * captured: The pieces that have been captured by white and black.
    * turn: Whos turn is it? White or black?
    * time : The time remaining on both player's clocks.
    */
interface State {
    board: Board,
    legalMoves: Coord[],
    lastMove: { from: Square, to: Square } | null,
    selected: Square | null,
    captured: Captured,
    started: boolean,
    done: boolean,
    turn: string,
    time: Time,
    castlingRights: {
        white: CastlingRights,
        black: CastlingRights,
    },
}


// True if a square has been selected.
function isSomethingSelected(s: Square | null): boolean {
    return s != null
}


/** Chessboard React Node.
    * ---
    * @returns A playable chessboard.
    */
function ChessBoard() {

    const initialState: State = {
        board: setupBoard(),
        legalMoves: [],
        lastMove: null,
        selected: null,
        captured: { white: [], black: [] },
        turn: "white",
        done: false,
        started: false,
        time: {
            white: 1000 * 60 * 5,
            black: 1000 * 60 * 5
        },
        castlingRights: {
            white: { left: true, right: true },
            black: { left: true, right: true }
        },
    };

    const gameState = createContext<{
        state: State;
        setState: React.Dispatch<React.SetStateAction<State>>;
        lastState: State;
        setLastState: React.Dispatch<React.SetStateAction<State>>;
    } | undefined>(undefined);

    const [state, setState] = useState<State>(initialState);
    const [lastState, setLastState] = useState<State>(state);

    // The time elapsed between move start and end.
    const moveTime = useRef<number>(0);


    /** Scan the entire board for legal moves.
        Return false if a color has no legal moves.
        */
    function checkMate(bd: Board, fn: (p: PieceType) => boolean): boolean {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const c = { row: row, col: col };
                const sq = getSquare(c, bd);
                if (sq.piece === PieceType.E) { continue; }
                if (fn(sq.piece)) { continue; }
                const legalMoves = getLegalMoves(bd, sq);
                if (legalMoves.length > 0) {
                    return false;
                }
            }
        }
        return true;
    }


    /** Get the legal moves for a given square on the board.
        * ---
        * @param bd - A chessboard.
        * @param s - A square on the board.
        * @returns An array of legal moves.
        */
    function getLegalMoves(bd: Board, s: Square): Coord[] {


        function isLegal(c: Coord) {
            if (sameColor(getSquare(c, bd), getSquare(s.coord, bd))) { return false }
            if (resultsInCheck(bd, c)) { return false }
            const sq = getSquare(c, bd);
            if (sq.piece === PieceType.K || sq.piece === PieceType.k) {
                return false
            }
            return true;
        }


        /** Simulate a move and check for checks.
            * ---
            * @param c - The coordinate of a square to move this piece to.
            * @returns True if moving this piece to c results in check.
            */
        function resultsInCheck(bd: Board, c: Coord): boolean {
            const result = move(bd, s, getSquare(c, bd));
            return hasCheck(result.newBoard);
        }


        /** Return true if the given board contains a check.
         * @param bd - A chessboard.
         * @returns True if bd contains a check.
         */
        function hasCheck(bd: Board): boolean {

            // This could be elimated by storing a reference to the king's location.
            // Find the king and remove him from the board, return his coordinate.
            function findKing(bd: Board): Coord {
                for (let row = 0; row < BOARD_WIDTH; row++) {
                    for (let col = 0; col < BOARD_WIDTH; col++) {
                        const coord = { row: row, col: col };
                        const sq = getSquare(coord, bd);
                        if (isWhite(s.piece)) {
                            if (sq.piece === PieceType.K) {
                                return coord;
                            }
                        } else {
                            if (sq.piece === PieceType.k) {
                                return coord;
                            }
                        }
                    }
                }
                throw new Error("King not found!");
            }

            const kingCoord = findKing(bd);

            for (let row = 0; row < BOARD_WIDTH; row++) {
                for (let col = 0; col < BOARD_WIDTH; col++) {
                    const sq = getSquare({ row: row, col: col }, bd);
                    if (isEmpty(sq)) { continue }
                    if (sameColor(s, sq)) { continue };
                    const moves = MOVES[PieceType[sq.piece]](sq, bd);
                    for (let i = 0; i < moves.length; i++) {
                        const move = moves[i];
                        if (compareCoords(move, kingCoord)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        let moves = MOVES[PieceType[s.piece]](s, bd);

        // Add castle moves.
        if (s.piece === PieceType.k || s.piece === PieceType.K) {
            moves = moves.concat(getCastleMoves(state, s))
        }

        // En passant
        if (state.lastMove) {
            // White captures black
            const last = state.lastMove;
            if (last.from.piece === PieceType.p) {
                const longJump = Math.abs(last.from.coord.row - last.to.coord.row) === 2;
                if (longJump) {
                    const beside = Math.abs(s.coord.col - last.to.coord.col) === 1;
                    const sameRow = last.to.coord.row === s.coord.row;
                    if (beside && sameRow) {
                        moves.push({ row: last.to.coord.row - 1, col: last.to.coord.col })
                    }
                }
            }

            // Black captures white
            if (last.from.piece === PieceType.P) {
                const longJump = Math.abs(last.from.coord.row - last.to.coord.row) === 2;
                if (longJump) {
                    const beside = Math.abs(s.coord.col - last.to.coord.col) === 1;
                    const sameRow = last.to.coord.row === s.coord.row;
                    if (beside && sameRow) {
                        moves.push({ row: last.to.coord.row + 1, col: last.to.coord.col })
                    }
                }
            }
        }

        return moves.filter(isLegal);
    }


    function getNewTime() {
        const timeNow: number = new Date().getUTCSeconds();
        const diff: number = timeNow - moveTime.current;
        if (state.turn === "black") {
            return {
                white: state.time.white,
                black: state.time.black - diff,
            }
        } else {
            return {
                white: state.time.white - diff,
                black: state.time.black,
            }
        }
    }

    /** 
     * ---
     * @param state - The current state of the game.
     * @param selected - The square that was just selected.
     * @returns The color of the next player's turn.
     */
    function toggleTurn(state: State, selected: Square | null): string {
        if (selected != null) {
            return getColor(selected!);
        } else {
            return state.turn === "black" ? "white" : "black";
        }
    }

    function isKing(s: Square): boolean {
        return (s.piece === K || s.piece === k);
    }

    function isRook(s: Square): boolean {
        return (s.piece === R || s.piece === r);
    }

    function updateCastlingRights(state: State, moved: Square): { white: CastlingRights, black: CastlingRights } {
        if (!isKing(moved) && !isRook(moved)) {
            return state.castlingRights;
        }
        if (isBlack(moved.piece)) {
            const newCastlingRights = state.castlingRights;
            if (moved.piece === k) {
                newCastlingRights.black.left = false;
                newCastlingRights.black.right = false;
                return newCastlingRights;
            } else {
                if (compareCoords(moved.coord, { row: 0, col: 0 })) {
                    newCastlingRights.black.left = false;
                }
                if (compareCoords(moved.coord, { row: 0, col: 7 })) {
                    newCastlingRights.black.right = false;
                }
                return newCastlingRights;
            }
        } else {
            const newCastlingRights = state.castlingRights;
            if (moved.piece === K) {
                newCastlingRights.white.left = false;
                newCastlingRights.white.right = false;
                return newCastlingRights;
            } else {
                if (compareCoords(moved.coord, { row: 0, col: 0 })) {
                    newCastlingRights.white.left = false;
                }
                if (compareCoords(moved.coord, { row: 0, col: 7 })) {
                    newCastlingRights.white.right = false;
                }
                return newCastlingRights;
            }
        }
    }


    /** Update the game state's captured pieces with the given captured piece.
     * @param capturedPiece - The piece captured by the previous move.
     * @param captured - The captured pieces in the game state.
     * @param capture - The function used to update the global state.
     */
    function updateCaptured(state: State, capturedPiece: PieceType): Captured {
        if (capturedPiece === PieceType.E) { return state.captured }
        if (isBlack(capturedPiece)) {
            return {
                white: state.captured.white,
                black: state.captured.black.concat(capturedPiece)
            };
        } else {
            return {
                white: state.captured.white.concat(capturedPiece),
                black: state.captured.black
            };
        }
    }


    function Square({ square }: { square: Square }) {

        const gameContext = useContext(gameState);

        if (gameContext === undefined) {
            throw new Error("No provider for gameContext!");
        }

        const { state, setState } = gameContext;
        const { selected, legalMoves, board } = state;

        // The CSS style of this square's cursor.
        const [cursor, setCursor] = useState<Property.Cursor>("default");


        // A reference to the piece element associated with this square.
        const pieceRef = useRef<HTMLDivElement | null>(null);


        /** True if this square is the selected square. */
        function sameAsSelected(): boolean {
            if (selected === null) {
                return false
            }
            return compareCoords(selected!.coord, square.coord);
        }


        /** Return the background color for this square. */
        function getBackgroundColor(): string {
            if (sameAsSelected()) {
                return COLOR_SCHEME.selected;
            } else {
                return square.color;
            }
        }

        function onMouseDown(e: any) {
            if (state.selected) {
                // Second event in the move loop.
                const s = getSquareUnderCursor(e as MouseEvent, board);
                if (sameSquare(selected!, s)) {
                    setState({ ...state, selected: null, legalMoves: [], })
                    return;
                }
                if (inLegalMoves(s.coord, legalMoves)) {
                    const { newBoard, captured } = move(board, selected!, s);
                    setLastState(state);
                    setState({
                        ...state,
                        board: newBoard,
                        captured: updateCaptured(state, captured),
                        lastMove: { from: selected!, to: s },
                        started: true,
                        done: checkMate(newBoard, isWhite(selected!.piece) ? isWhite : isBlack),
                        selected: null,
                        legalMoves: [],
                        turn: toggleTurn(state, null),
                        time: getNewTime(),
                        castlingRights: updateCastlingRights(state, state.selected),
                    })
                    moveTime.current = 0; // not really needed.
                } else {
                    setState({ ...state, selected: null, legalMoves: [], })
                }
            }
        }

        const style: CSSProperties = {
            background: getBackgroundColor(),
            cursor: cursor,
            pointerEvents: "all",
        };

        const elementProps: React.HTMLProps<HTMLDivElement> = {
            onMouseDown: onMouseDown,
            style: style,
            className: styles.square,
        };

        function showLegalMoves(): ReactNode | null {
            if (inLegalMoves(square.coord, legalMoves)) {
                return <span className={styles.dot}></span>
            }
            return null;
        }

        return (
            <div key={`${square.coord}$`} {...elementProps}>
                {showLegalMoves()}
                <Piece square={square} ref={pieceRef} />
            </div>
        );
    }

    function useTime(setTime: any, color: Color) {
        useEffect(() => {
            if (state.done || !state.started || state.turn === ((color === "white") ? "black" : "white") || state.time[color] < 0)
                return;
            const interval = setInterval(() => {
                state.time[color] = state.time[color] - 1;
                setTime(state.time[color]);
            }, 1);
            return () => clearInterval(interval);
        });
    }

    function Clock({ color }: { color: string }) {
        const [time, setTime] = useState(color === "white" ? state.time.white : state.time.black);

        useTime(setTime, color as Color);

        useEffect(() => {
            if (time <= 0 && !state.done)
                setState({ ...state, done: true });
        })

        function setBg(): string {
            if (!state.started) {
                return COLOR_SCHEME.ui_light;
            }
            if (state.turn === color) {
                return "green";
            } else {
                return COLOR_SCHEME.ui_light;
            }
        }

        const style: CSSProperties = {
            background: setBg()
        };

        const d = new Date(time);

        const stringTime = `${d.getMinutes()}:${d.getSeconds().toString().padStart(2, '0')}`

        return (
            <div style={style} className={styles.clock}>{stringTime}</div>
        );
    }


    function Piece({ square, ref }: { square: Square, ref: any }) {


        // The position of this piece in viewport space, in pixels.
        const [pos, setPos] = useState({ x: 0, y: 0 });


        // The CSS position style of this piece.
        const [posStyle, setPosStyle] = useState<Property.Position>("relative");


        // Whether or not this piece should follow the cursor.
        const followCursor = useRef(true);


        function snapToMouse(e: MouseEventInit) {
            setPosStyle("absolute");
            const offset = SQUARE_WIDTH / 2;
            setPos({ x: e.clientX! - offset, y: e.clientY! - offset });
        }

        useEffect(() => {
            if (!state.selected) return;

            document.addEventListener("mousemove", onMouseMove);

            return () => {
                document.removeEventListener("mousemove", onMouseMove);
            };
        });

        const onMouseMove = (e: any): void => {
            if (!state.selected)
                return;
            if (sameSquare(state.selected, square) && followCursor.current)
                snapToMouse(e);
        }


        function onMouseDown(): void {
            // The first step in the loop
            if (!state.selected && state.turn == getColor(square) && !state.done) {
                moveTime.current = new Date().getUTCSeconds();
                console.log(state.turn)
                setState({
                    ...state,
                    selected: square,
                    legalMoves: getLegalMoves(state.board, square),
                })
            } else {
                // Mouse down on piece with something selected...
                followCursor.current = true;
            }
        }


        function onMouseUp(e: any) {
            const s = getSquareUnderCursor(e as MouseEvent, state.board);


            if (sameSquare(s, square)) {
                followCursor.current = false;
                setPos({ x: 0, y: 0 });
                setPosStyle("relative");
            }
            if (!state.selected)
                return;
            if (!sameSquare(s, state.selected!)) {
                if (inLegalMoves(s.coord, state.legalMoves)) {
                    const { newBoard, captured } = move(state.board, state.selected!, s);
                    setLastState({ ...state });
                    setState({
                        ...state,
                        board: newBoard,
                        captured: updateCaptured(state, captured),
                        lastMove: { from: state.selected!, to: s },
                        selected: null,
                        started: true,
                        done: checkMate(newBoard, isWhite(s.piece) ? isWhite : isBlack),
                        legalMoves: [],
                        time: getNewTime(),
                        turn: toggleTurn(state, null),
                        castlingRights: updateCastlingRights(state, state.selected)
                    })
                } else {
                    setState({
                        ...state,
                        selected: null,
                        legalMoves: [],
                    })
                }
            }
        }


        const style: CSSProperties = {
            position: posStyle,
            left: pos.x,
            top: pos.y,
        }


        const elementProps: React.HTMLProps<HTMLDivElement> = {
            onMouseDown: onMouseDown,
            onMouseUp: onMouseUp,
            className: styles.piece,
            style: style,
        };

        if (square.piece === PieceType.E) { return }

        return <div {...elementProps}>{getIcon(square.piece)}</div>
    }

    function createRow(row: Square[], rowIndex: number) {
        return row.map((square: Square, colIndex: number) => {
            const id = `${rowIndex}${colIndex}`;
            return <Square square={square} key={id} />
        })
    }

    function createBoard() {
        return state.board.map((row: Square[], rowIndex: number) => (
            <div className={styles.row} key={rowIndex}>
                {createRow(row, rowIndex)}
            </div>
        ))
    }

    if (state.done) {
        alert("Game over!")
        setState(initialState);
    }

    return (
        <gameState.Provider value={{ state, setState, lastState, setLastState }}>
            <div style={{ background: COLOR_SCHEME.ui_dark }} className={styles.main}>
                <div className={styles.main}>
                    <div className={styles.bar}>
                        <Captured captured={state.captured.black} justify={"right"}></Captured>
                        <Clock color="black"></Clock>
                    </div>
                    <div className={styles.board} id="board">
                        {createBoard()}
                    </div>
                    <div className={styles.bar}>
                        <Clock color="white"></Clock>
                        <Captured captured={state.captured.white} justify={"left"}></Captured>
                    </div>
                </div>
            </div>
        </gameState.Provider>
    );

}



function Captured({ captured, justify: justify }: { captured: PieceType[], justify: string }) {
    return (
        <div style={{ justifyContent: justify, background: COLOR_SCHEME.ui_dark }} className={styles.captured}>
            {captured.map((p, i) => {
                return <div className={styles.capturedPiece} key={i}>{getIcon(p)}</div>
            })}
        </div>
    );
}


export default function main() {
    return (
        <ChessBoard></ChessBoard>
    );
}
