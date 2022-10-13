/**
 * Callback for setting the board state
 *
 * @callback setBoardState
 * @param {Object} board An dictionary representing the current board state
 */

/**
 * Checks if the dragged piece can be placed at a square
 * @param {number} toX x coordinate of the square currently being checked
 * @param {number} toY y coordinate of the square currently being checked
 * @param {setBoardState} setBoardState sets a new state of the board
 * @param {Object} item piece currently being dragged
 * @param {Object} boardState current state of the board
 * @returns true if the dragged piece can be moved to the square at (x,y), false otherwise
 */
export function MovePiece(
    toX,
    toY,
    setBoardState,
    setTakenPieces,
    draggedPiece,
    boardState
) {
    const square = GetPieceAtSquare(toX, toY, boardState);
    const enPassantPawn = CheckIfCanEnPassant(draggedPiece, boardState);

    // check if piece on square
    // Ensure piece on square is not owned and is alive before taking
    if (
        (square != null && !square.isOwner && square.state.isAlive) ||
        (enPassantPawn &&
            enPassantPawn.state.col === toX &&
            enPassantPawn.state.row - 1 === toY)
    ) {
        const pieceToTake = square != null ? square : enPassantPawn;
        // Remove piece from board
        delete boardState[pieceToTake.piece];

        // Track what pieces are taken so that they can be rendered under player name
        const pieceNameSplit = pieceToTake.piece.split("_");
        const piecePathName = pieceNameSplit[0] + "_" + pieceNameSplit[1];
        const pieceImgPath = require("../assets/images/pieces/" +
            piecePathName +
            ".png");

        let colour;
        if (pieceNameSplit[1] === "w") colour = "white";
        else colour = "black";
        // Sort the array of pieces so that matching pieces appear next to eachother
        setTakenPieces((prevState) => ({
            ...prevState,
            [colour]: [...prevState[colour], pieceImgPath].sort(),
        }));
    }

    const king = boardState["king_w"].isOwner ? "king_w" : "king_b";

    let newBoardState;
    // Gets the castle if castling
    const castleToMove = CheckIfCanCastle(toX, toY, draggedPiece, boardState);
    // Update state of the moved piece
    newBoardState = {
        ...boardState,
        [draggedPiece.pieceName]: {
            ...boardState[draggedPiece.pieceName],
            row: toY,
            col: toX,
            hasMoved: true,
        },
        turn: boardState["turn"] + 1,
    };

    if (draggedPiece.pieceName.split("_")[0] === "pawn") {
        // If the pawn moved two squares then it can be taken via en passant
        // en passant can only happen on the same turn
        const justMovedTwo =
            !draggedPiece.pieceState.hasMoved &&
            draggedPiece.pieceState.row - toY === 2;
        newBoardState[draggedPiece.pieceName] = {
            ...newBoardState[draggedPiece.pieceName],
            movedTwoSquaresTurn: justMovedTwo ? boardState["turn"] + 1 : null,
        };
    } else if (castleToMove !== null) {
        const newCastleCol = castleToMove.state.col === 7 ? 5 : 3;
        const newKingCol = newCastleCol === 5 ? 6 : 2;
        // Moves the king and castle when castling
        // Moving a piece will always take king out of check
        newBoardState[castleToMove.castleName] = {
            ...newBoardState[castleToMove.castleName],
            col: newCastleCol,
            hasMoved: true,
        };
        newBoardState[king] = {
            ...newBoardState[king],
            col: newKingCol,
            hasMoved: true,
        };
    }
    newBoardState[king] = {
        ...newBoardState[king],
        inCheck: false,
    };

    setBoardState(newBoardState);
}

/**
 * Checks if the dragged piece can be placed at a square
 * @param {number} toX x coordinate of the square currently being checked
 * @param {number} toY y coordinate of the square currently being checked
 * @param {Object} item piece currently being dragged
 * @param {Object} boardState current state of the board
 * @returns true if the dragged piece can be moved to the square at (x,y), false otherwise
 */
export function CanMovePiece(toX, toY, draggedPiece, boardState) {
    const square = GetPieceAtSquare(toX, toY, boardState);

    // if a friendly piece is in a square, don't allow this piece to be moved there
    if (square && square.state.isOwner && square.state.isAlive) return false;

    // calculate the difference between the new square and the piece being dragged
    let dx = Math.abs(toX - draggedPiece.pieceState.col);
    let dy = Math.abs(toY - draggedPiece.pieceState.row);

    const pieceName = draggedPiece.pieceName.split("_")[0];

    // Check the row and column of the piece to see if the movement should be blocked
    // by another piece
    const straightCollision = CheckStraightCollisions(
        toX,
        toY,
        boardState,
        draggedPiece
    );
    // Check the diagonal of the piece to see if the movement should be blocked
    // by another piece
    const diagCollision = CheckDiagCollisions(
        toX,
        toY,
        boardState,
        draggedPiece
    );

    // Checks if the move will block the piece attacking the king
    const pieceCheckingKing = CheckIfPieceIsProtectingKing(
        toX,
        toY,
        boardState,
        draggedPiece.pieceName
    );

    // Get the players king
    const king = boardState["king_w"].isOwner
        ? boardState["king_w"]
        : boardState["king_b"];

    let piecePuttingKingInCheck, cantMoveToProtectKing;
    if (king.inCheck) {
        // Gets the piece that is putting the king in check
        piecePuttingKingInCheck = CheckIfMoveUnderAttack(
            king.col,
            king.row,
            boardState
        );

        const pieceAttackingKingNotAtSquare =
            square !== null && square.piece !== piecePuttingKingInCheck;
        // Move must protect king if king is in check
        cantMoveToProtectKing =
            king.inCheck &&
            ((pieceCheckingKing === null && pieceAttackingKingNotAtSquare) ||
                (pieceCheckingKing === null && square === null));
    }

    let isProtectingKing;
    if (pieceName !== "king") {
        // Check if the piece is defending the king
        // Get the piece that is attacking the king if true
        const pieceAttackingKing = CheckIfPieceIsProtectingKing(
            draggedPiece.pieceState.col,
            draggedPiece.pieceState.row,
            boardState,
            draggedPiece.pieceName
        );
        // Check if the piece is currently under attack
        const isPieceUnderAttack =
            CheckIfMoveUnderAttack(
                draggedPiece.pieceState.col,
                draggedPiece.pieceState.row,
                boardState
            ) !== null;
        isProtectingKing = pieceAttackingKing !== null && isPieceUnderAttack;
    }

    const cantMoveWhilstProtecting = () => {
        // Dont allow the pawn to move if its protecting king unless it can take the piece
        // and ensure that the piece is alive before taking
        if (
            isProtectingKing &&
            ((square && pieceCheckingKing !== square.piece) ||
                square === null ||
                (square && !square.state.isAlive))
        )
            return true;
        return false;
    };

    switch (pieceName) {
        case "king":
            const moveUnderAttack = CheckIfMoveUnderAttack(
                toX,
                toY,
                boardState,
                draggedPiece.pieceName
            );
            const moveNotInCheck =
                moveUnderAttack === null ||
                (square && square.piece === moveUnderAttack);
            const canCastle = CheckIfCanCastle(
                toX,
                toY,
                draggedPiece,
                boardState
            );
            return (
                (((dx === 1 || dx === 0) && (dy === 1 || dy === 0)) ||
                    (canCastle && dx === 2 && dy === 0)) &&
                moveNotInCheck
            );

        case "castle":
            if (cantMoveWhilstProtecting()) return;
            if (cantMoveToProtectKing) return;
            return (
                ((dx === 0 && dy > 0) || (dx > 0 && dy === 0)) &&
                !straightCollision.collision
            );

        case "knight":
            if (cantMoveWhilstProtecting()) return;
            if (cantMoveToProtectKing) return;
            return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);

        case "bishop":
            if (cantMoveWhilstProtecting()) return;
            if (cantMoveToProtectKing) return;
            return (
                !(dx === 0 && dy > 0) &&
                !(dx > 0 && dy === 0) &&
                (dx === dy || dx === dy) &&
                !diagCollision.collision
            );

        case "queen":
            if (cantMoveWhilstProtecting()) return;
            if (cantMoveToProtectKing) return;

            return (
                (((dx === 0 && dy > 0) || (dx > 0 && dy === 0)) &&
                    !straightCollision.collision) ||
                ((dx === dy || dx === dy) && !diagCollision.collision)
            );

        case "pawn":
            if (cantMoveWhilstProtecting()) return;
            if (cantMoveToProtectKing) return;

            // Gets the pawn that can be taken via en passant
            const enPassantPawn = CheckIfCanEnPassant(draggedPiece, boardState);

            // Recalculate dx/dy with direction
            dx = toX - draggedPiece.pieceState.col;
            dy = toY - draggedPiece.pieceState.row;
            // Allow pawn to move 2 squares on first move
            if (!draggedPiece.pieceState.hasMoved) {
                // Negative direction moves up the board (player always at bottom)
                if (
                    dx === 0 &&
                    (dy === -1 || dy === -2) &&
                    !straightCollision.collision
                ) {
                    return square === null;
                }
            }

            // Allow pawn to take opponents pawn via en passant
            if (
                enPassantPawn &&
                toX === enPassantPawn.state.col &&
                toY === enPassantPawn.state.row - 1
            )
                return true;

            if ((dx === 1 || dx === -1) && dy === -1 && square !== null)
                // Allow pawn to take opponents pieces diagonal by 1 square
                return true;

            // Allow pawn to move forward by 1 square
            return dx === 0 && dy === -1 && square === null;

        default:
            return false;
    }
}

/**
 * Checks if the current square is empty
 * @param {number} x x coordinate of the square currently being checked
 * @param {number} y y coordinate of the square currently being checked
 * @param {Object} boardState current state of the board
 * @returns piece name and state if square is not empty, null otherwise
 */
function GetPieceAtSquare(x, y, boardState) {
    for (const [piece, state] of Object.entries(boardState)) {
        if (x === state.col && y === state.row) {
            return { piece, state };
        }
    }
    return null;
}

/**
 * Checks if there is a piece in the diagonal of the selected piece and the current square
 * @param {number} x x coordinate of the square currently being checked
 * @param {number} y y coordinate of the square currently being checked
 * @param {Object} boardState current state of the board
 * @param {Object} draggedPiece contains data about the currently dragged piece
 * @param {boolean} checkForOpponentPiece if true, the check will be on behalf of the opponent
 * @returns piece and false if an opponents piece is inbetween the square and the currently dragged piece, piece and true otherwise
 */
function CheckDiagCollisions(
    x,
    y,
    boardState,
    draggedPiece,
    checkForOpponentPiece = false
) {
    // Get row and col of dragged piece
    const row = draggedPiece.pieceState.row;
    const col = draggedPiece.pieceState.col;

    const dirX = Math.sign(x - col);
    const dirY = Math.sign(y - row);
    for (let i = 0; i < Math.abs(x - col) + 1; i++) {
        for (const [piece, state] of Object.entries(boardState)) {
            // Dont include collisions with self
            if (piece !== draggedPiece.pieceName) {
                const owner = checkForOpponentPiece
                    ? !state.isOwner
                    : state.isOwner;
                if (
                    col + i * dirX === state.col &&
                    row + i * dirY === state.row &&
                    state.isAlive &&
                    ((i === 0 && !owner) || i !== 0)
                ) {
                    if (i !== Math.abs(x - col)) {
                        // Stops opponents pieces from being taken when hidden behind each other
                        return {
                            piece: piece,
                            collision: true,
                        };
                    }
                    return {
                        piece: piece,
                        collision: owner,
                    };
                }
            }
        }
    }
    return { piece: null, collision: false };
}

/**
 * Checks if there is a piece in the vertical and horizontal of the selected piece and the current square
 * @param {number} x x coordinate of the square currently being checked
 * @param {number} y y coordinate of the square currently being checked
 * @param {Object} boardState current state of the board
 * @param {Object} draggedPiece contains data about the currently dragged piece
 * @param {boolean} checkForOpponentPiece if true, the check will be on behalf of the opponent
 * @returns true and the piece name if an opponents piece is inbetween the square and the currently dragged piece, false and null otherwise
 */
function CheckStraightCollisions(
    x,
    y,
    boardState,
    draggedPiece,
    checkForOpponentPiece = false
) {
    // Get row and col of dragged piece
    const row = draggedPiece.pieceState.row;
    const col = draggedPiece.pieceState.col;
    // Get change in x and y between dragged piece and square
    const dx = Math.abs(x - col);
    const dy = Math.abs(y - row);

    // Ignore diagonal moves
    if (dx > 0 && dy > 0) return true;

    // get direction of move
    const dirX = Math.sign(x - col);
    const dirY = Math.sign(y - row);

    for (let i = 1; i < Math.max(dx, dy) + 1; i++) {
        for (const [piece, state] of Object.entries(boardState)) {
            // Dont include collisions with self
            if (piece !== draggedPiece.pieceName) {
                if (state.isAlive) {
                    // Move is horizontal if dy = 0, otherwise vertical
                    if (dy === 0) {
                        if (col + i * dirX === state.col && row === state.row) {
                            if (i !== Math.abs(x - col)) {
                                // Stops opponents pieces from being taken when hidden behind each other
                                return {
                                    piece: piece,
                                    collision: true,
                                };
                            }
                            return {
                                piece: piece,
                                collision: checkForOpponentPiece
                                    ? !state.isOwner
                                    : state.isOwner,
                            };
                        }
                    } else {
                        if (row + i * dirY === state.row && col === state.col) {
                            if (i !== Math.abs(y - row)) {
                                // Stops opponents pieces from being taken when hidden behind each other
                                return {
                                    piece: piece,
                                    collision: true,
                                };
                            }
                            return {
                                piece: piece,
                                collision: checkForOpponentPiece
                                    ? !state.isOwner
                                    : state.isOwner,
                            };
                        }
                    }
                }
            }
        }
    }
    return { piece: null, collision: false };
}

/**
 * Checks if a piece at (x,y) on the board is under attack by an opponents piece
 * @param {number} x x coordinate of the square currently being checked
 * @param {number} y y coordinate of the square currently being checked
 * @param {Object} boardState current state of the board
 * @param {string} pieceToMove the name of the piece to move
 * @returns piece name if the piece is under attack, null otherwise
 */
function CheckIfMoveUnderAttack(x, y, boardState, pieceToMove = null) {
    for (const [piece, state] of Object.entries(boardState)) {
        // King cannot be checked by its own pieces
        if (!state.isOwner) {
            const dx = Math.abs(x - state.col);
            const dy = Math.abs(y - state.row);

            // Check if the square is under attack from an opponents piece via straight line
            const straightCollisions = CheckStraightCollisions(
                state.col,
                state.row,
                boardState,
                {
                    pieceName: pieceToMove,
                    pieceState: { col: x, row: y },
                }
            );

            if (straightCollisions.piece && !straightCollisions.collision) {
                const pieceName = straightCollisions.piece.split("_")[0];
                // If the piece can take pieces horizontally or vertically or king is in range,
                // then the move is not valid
                if (
                    pieceName === "queen" ||
                    pieceName === "castle" ||
                    (pieceName === "king" && (dx === 1 || dy === 1))
                ) {
                    //return true;
                    return straightCollisions.piece;
                }
            }
            // Check if the square is under attack from an opponents piece via diagonal line
            const diagCollisions = CheckDiagCollisions(
                state.col,
                state.row,
                boardState,
                {
                    pieceName: pieceToMove,
                    pieceState: { col: x, row: y },
                }
            );

            if (
                diagCollisions.piece &&
                diagCollisions.piece !== pieceToMove &&
                !diagCollisions.collision
            ) {
                // Dont include collisions with self
                if (diagCollisions.piece === pieceToMove) return null;

                const pieceName = diagCollisions.piece.split("_")[0];
                // If the piece can move diagonally or the pawn is in range of square,
                // then the move is not valid
                if (
                    pieceName === "queen" ||
                    pieceName === "bishop" ||
                    (pieceName === "king" && dx === 1 && dy === 1) ||
                    (pieceName === "pawn" && dx === 1 && y - state.row === 1)
                ) {
                    //return true;
                    return diagCollisions.piece;
                }
            }

            // Check if square is under attack by a knight
            if (
                piece.split("_")[0] === "knight" &&
                ((dx === 2 && dy === 1) || (dx === 1 && dy === 2))
            ) {
                return piece;
            }
        }
    }
    return null;
}

/**
 * Check if the piece at (x,y) on the board is blocking an opponent piece from checking the king
 * @param {number} x x coordinate of the square currently being checked
 * @param {number} y y coordinate of the square currently being checked
 * @param {Object} boardState current state of the board
 * @param {Object} draggedPiece piece being dragged
 * @returns name of piece attacking king, if no such piece exists, return null
 */
function CheckIfPieceIsProtectingKing(x, y, boardState, draggedPiece) {
    // Get players king
    const king = boardState["king_w"].isOwner
        ? boardState["king_w"]
        : boardState["king_b"];

    // Direction from (x,y) to king
    const dirX = Math.sign(x - king.col);
    const dirY = Math.sign(y - king.row);

    if (dirX === 0 && dirY === 0) return null;

    const dx = Math.abs(king.col - x);
    const dy = Math.abs(king.row - y);

    const getOppositeCoords = (king) => {
        let oppositeX = king.col;
        let oppositeY = king.row;
        // Get the x,y in the opposite direction to the king to the edge of the board

        while (
            oppositeX <= 7 &&
            oppositeX >= 0 &&
            oppositeY <= 7 &&
            oppositeY >= 0
        ) {
            oppositeX += dirX;
            oppositeY += dirY;
        }
        return [oppositeX, oppositeY];
    };

    // Check pieces that are directly above or beside the king
    if (dx === 0 || ((dirX === 1 || dirX === -1) && dy === 0)) {
        // Check if piece is inbetween king and opponent piece that can attack king
        const straightCollisions = CheckStraightCollisions(x, y, boardState, {
            pieceState: { col: king.col, row: king.row },
        });

        // A piece is inbetween the dragged piece and the king,
        // therefore, it is not protecting the king and can be moved
        if (
            straightCollisions.collision &&
            straightCollisions.piece !== draggedPiece
        )
            return null;

        const [oppositeX, oppositeY] = getOppositeCoords(king);

        const oppositeStraightCollisions = CheckStraightCollisions(
            oppositeX,
            oppositeY,
            boardState,
            {
                pieceState: { col: x, row: y },
            }
        );

        if (
            oppositeStraightCollisions.piece &&
            !boardState[oppositeStraightCollisions.piece].isOwner
        ) {
            const pieceName = oppositeStraightCollisions.piece.split("_")[0];
            // If the piece in opposite direction to king is able to attack the king
            // once the dragged piece is moved, then don't allow the piece to be moved
            if (pieceName === "castle" || pieceName === "queen") {
                // the piece is protecting the king
                return oppositeStraightCollisions.piece;
            }
        }
    } else if (dx === dy) {
        // Check the pieces directly diagonal to the king
        // Check if piece is inbetween king and opponent piece that can attack king
        const diagCollisions = CheckDiagCollisions(x, y, boardState, {
            pieceState: { col: king.col, row: king.row },
        });

        // A piece is inbetween the dragged piece and the king,
        // therefore, it is not protecting the king and can be moved
        if (diagCollisions.collision && diagCollisions.piece !== draggedPiece)
            return null;

        const [oppositeX, oppositeY] = getOppositeCoords(king);

        const oppositeDiagCollisions = CheckDiagCollisions(
            oppositeX,
            oppositeY,
            boardState,
            {
                pieceState: { col: x, row: y },
            }
        );

        if (
            oppositeDiagCollisions.piece &&
            !boardState[oppositeDiagCollisions.piece].isOwner
        ) {
            const pieceName = oppositeDiagCollisions.piece.split("_")[0];
            // If the piece in opposite direction to king is able to attack the king
            // once the dragged piece is moved, then don't allow the piece to be moved
            const signDx = king.col - x;
            const signDy = king.col - x;
            if (
                pieceName === "bishop" ||
                pieceName === "queen" ||
                (pieceName === "pawn" &&
                    (signDx === 1 || signDx === -1) &&
                    signDy === -1)
            ) {
                // the piece is protecting the king
                return oppositeDiagCollisions.piece;
            }
        }
    }
    return null;
}

/**
 * Checks if the opponent king is in check
 * @param {Object} boardState current state of the board
 * @param {Object} opponentKing the opponents kings state
 * @returns true if the opponents king is in check, otherwise false
 */
export function CheckIfOpponentInCheck(boardState, opponentKing) {
    for (const [piece, state] of Object.entries(boardState)) {
        // King cannot be checked by its own pieces
        if (state.isOwner) {
            const dx = Math.abs(opponentKing.col - state.col);
            const dy = Math.abs(opponentKing.row - state.row);

            // Check if the square is under attack from an opponents piece via straight line
            const straightCollisions = CheckStraightCollisions(
                state.col,
                state.row,
                boardState,
                {
                    pieceState: {
                        col: opponentKing.col,
                        row: opponentKing.row,
                    },
                },
                true
            );

            if (straightCollisions.piece && !straightCollisions.collision) {
                const pieceName = straightCollisions.piece.split("_")[0];
                // If the piece can take pieces horizontally or vertically or king is in range,
                // then the move is not valid
                if (
                    pieceName === "queen" ||
                    pieceName === "castle" ||
                    (pieceName === "king" && (dx === 1 || dy === 1))
                ) {
                    return true;
                }
            }
            // Check if the square is under attack from an opponents piece via diagonal line
            const diagCollisions = CheckDiagCollisions(
                state.col,
                state.row,
                boardState,
                {
                    pieceState: {
                        col: opponentKing.col,
                        row: opponentKing.row,
                    },
                },
                true
            );
            if (diagCollisions.piece && !diagCollisions.collision) {
                const pieceName = diagCollisions.piece.split("_")[0];

                // If the piece can move diagonally or the pawn is in range of square,
                // then the move is not valid
                // negative direction is up the board
                if (
                    pieceName === "queen" ||
                    pieceName === "bishop" ||
                    (pieceName === "king" && dx === 1 && dy === 1) ||
                    (pieceName === "pawn" &&
                        dx === 1 &&
                        opponentKing.row - state.row === -1)
                ) {
                    return true;
                }
            }

            // Check if square is under attack by a knight
            if (
                piece.split("_")[0] === "knight" &&
                ((dx === 2 && dy === 1) || (dx === 1 && dy === 2))
            ) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Checks if the king can castle
 * @param {number} x
 * @param {number} y
 * @param {Object} draggedPiece
 * @param {Object} boardState
 * @returns the castle name and state if player can castle else null
 */
function CheckIfCanCastle(x, y, draggedPiece, boardState) {
    const pieceName = draggedPiece.pieceName.split("_")[0];
    const pieceColour = draggedPiece.pieceName.split("_")[1];
    if (
        pieceName === "king" &&
        !draggedPiece.pieceState.hasBeenInCheck &&
        !draggedPiece.pieceState.hasMoved
    ) {
        const castle_1 = boardState["castle_" + pieceColour + "_1"];
        const castle_2 = boardState["castle_" + pieceColour + "_2"];
        // Ensure move is at correct square, castle hasnt moved and there is no pieces
        // inbetween the king and castle
        if (
            x === 2 &&
            y === 7 &&
            castle_1 &&
            !castle_1.hasMoved &&
            !GetPieceAtSquare(1, 7, boardState) &&
            !GetPieceAtSquare(2, 7, boardState) &&
            !GetPieceAtSquare(3, 7, boardState)
        ) {
            return {
                castleName: "castle_" + pieceColour + "_1",
                state: castle_1,
            };
        } else if (
            x === 6 &&
            y === 7 &&
            castle_2 &&
            !castle_2.hasMoved &&
            !GetPieceAtSquare(6, 7, boardState) &&
            !GetPieceAtSquare(5, 7, boardState)
        ) {
            return {
                castleName: "castle_" + pieceColour + "_2",
                state: castle_2,
            };
        }
    }
    return null;
}

/**
 * Check if the pawn can take another pawn via en passant
 * @param {Object} draggedPiece
 * @param {Object} boardState
 * @returns the pawn that can be taken if en passant is possible, otherwise null
 */
function CheckIfCanEnPassant(draggedPiece, boardState) {
    // Only a pawn can en passant
    if (draggedPiece.pieceName.split("_")[0] !== "pawn") return null;

    const pawnOnLeft = GetPieceAtSquare(
        draggedPiece.pieceState.col - 1,
        draggedPiece.pieceState.row,
        boardState
    );
    const pawnOnRight = GetPieceAtSquare(
        draggedPiece.pieceState.col + 1,
        draggedPiece.pieceState.row,
        boardState
    );

    if (
        pawnOnLeft &&
        pawnOnLeft.state.movedTwoSquaresTurn === boardState["turn"]
    ) {
        return pawnOnLeft;
    }
    if (
        pawnOnRight &&
        pawnOnRight.state.movedTwoSquaresTurn === boardState["turn"]
    ) {
        return pawnOnRight;
    }
    return null;
}
