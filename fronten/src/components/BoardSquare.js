import React, { memo } from "react";
import { Square } from "./ChessElements";
import { ItemTypes } from "./Constants";
import { useDrop } from "react-dnd";
import { CanMovePiece, MovePiece } from "./Game";
import { PossibleMoveDot, MoveHoverHighlight } from "./ChessElements";

function BoardSquare({
    x,
    y,
    children,
    setBoardState,
    setTakenPieces,
    boardState,
    isTurn,
}) {
    const dark = (x + y) % 2 === 1;

    // Allow drag items to drop into each of the board squares
    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: [ItemTypes.PIECE],
            canDrop: (item) => isTurn && CanMovePiece(x, y, item, boardState),
            drop: (item) =>
                MovePiece(
                    x,
                    y,
                    setBoardState,
                    setTakenPieces,
                    item,
                    boardState
                ),
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
                canDrop: !!monitor.canDrop(),
            }),
        }),
        [boardState]
    );

    return (
        <div
            ref={drop}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
            }}
        >
            <Square dark={dark}>{children}</Square>

            {!isOver && canDrop && <PossibleMoveDot dark={dark} />}
            {isOver && canDrop && <MoveHoverHighlight />}
        </div>
    );
}

export default memo(BoardSquare);
