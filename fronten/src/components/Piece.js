import React, { memo } from "react";
import { useDrag } from "react-dnd";
import { PieceImg, PieceContainer } from "./ChessElements";

function Piece({ itemType, imgSrc, pieceName, pieceState }) {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: itemType,
            item: { pieceName, pieceState },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
            canDrag: pieceState.isOwned,
        }),
        [pieceName]
    );

    return (
        <>
            <PieceContainer dragging={isDragging}>
                <PieceImg
                    owned={pieceState.isOwner}
                    dragging={isDragging}
                    src={imgSrc}
                    ref={drag}
                />
            </PieceContainer>
        </>
    );
}

export default memo(Piece);
