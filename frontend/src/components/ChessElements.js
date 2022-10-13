import styled from "styled-components";

export const PossibleMoveDot = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 30%;
    width: 30%;
    z-index: 1;
    opacity: 0.8;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
`;

export const MoveHoverHighlight = styled.div`
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    z-index: 1;
    opacity: 0.8;
    border: 4px solid white;
`;

export const Square = styled.div`
    background-color: ${({ dark }) =>
        dark ? "rgb(255,205,154)" : "rgb(144,96,78)"};
    color: ${({ dark }) => (dark ? "rgb(144,96,78)" : "rgb(255,205,154)")};
    width: 100%;
    height: 100%;

    -khtml-user-select: none;
    -o-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
`;

export const PieceImg = styled.img`
    display: flex;
    justify-content: center;
    width: 100%;
    cursor: ${({ owned }) => (owned ? "grab" : "default")};
    pointer-events: ${({ owned }) => (owned ? "visible" : "none")};
    opacity: ${({ dragging }) => (dragging ? 0 : 1)};
    transform: translate(0, 0);
    border: ${({ dragging }) => (dragging ? "4px solid white" : "none")};
`;

export const PieceContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 2;
    opacity: ${({ dragging }) => (dragging ? 0.6 : 1)};
    background: ${({ dragging }) => (dragging ? "#EFBF3B" : "")};
`;
