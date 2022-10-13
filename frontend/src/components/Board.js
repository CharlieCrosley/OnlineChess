import React from "react";
import Piece from "./Piece";
import BoardSquare from "./BoardSquare";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ItemTypes } from "./Constants";

export default function Board({
    boardState,
    setBoardState,
    setTakenPieces,
    isTurn,
}) {
    const squares = [];
    for (let i = 0; i < 64; i++) {
        squares.push(
            renderSquare(i, boardState, setBoardState, setTakenPieces, isTurn)
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                }}
            >
                {squares}
            </div>
        </DndProvider>
    );
}

function renderSquare(i, boardState, setBoardState, setTakenPieces, isTurn) {
    const x = i % 8;
    const y = Math.floor(i / 8);
    let pieceImgPath, pieceName, pieceState;

    for (const [piece, state] of Object.entries(boardState)) {
        if (x === state.col && y === state.row && state.isAlive) {
            const pieceNameSplit = piece.split("_");
            pieceName = piece;
            pieceState = state;
            const piecePathName = pieceNameSplit[0] + "_" + pieceNameSplit[1];
            pieceImgPath = require("../assets/images/pieces/" +
                piecePathName +
                ".png");
            break;
        }
    }
    return (
        <div key={i} style={{ width: "12.5%", height: "12.5%" }}>
            <BoardSquare
                x={x}
                y={y}
                setBoardState={setBoardState}
                setTakenPieces={setTakenPieces}
                boardState={boardState}
                pieceName={pieceName}
                pieceState={pieceState}
                isTurn={isTurn}
            >
                {pieceName && pieceState.isAlive && (
                    <Piece
                        imgSrc={pieceImgPath}
                        itemType={ItemTypes.PIECE}
                        pieceName={pieceName}
                        pieceState={pieceState}
                    />
                )}
            </BoardSquare>
        </div>
    );
}
