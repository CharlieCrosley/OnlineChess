import styled from "styled-components";

export const Container = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #3a3b3c;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 120px;
`;

export const GameContainer = styled.div`
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 80%;
    height: 100%;
`;

export const GamePlayer = styled.div`
    position: relative;
    aspect-ratio: 1;
    width: 100%;
    max-width: 700px;
    max-height: 700px;
`;

export const Player = styled.div`
    display: flex;
    justify-content: space-around;
    width: 90%;
    max-width: 700px;
    max-height: 70px;
    color: white;
    font-weight: 500;
    font-size: 22px;
    padding-bottom: 20px;
`;

export const PlayerData = styled.div`
    width: 80%;
`;

export const PlayerName = styled.div`
    min-height: 37px;
`;

export const TakenPieces = styled.div`
    min-height: 28px;
    display: flex;
    width: 75%;
    & > img {
        width: 28px;
        height: 28px;
    }
`;

export const Buttons = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    right: 20px;
    top: 20px;
`;

export const RoomNumber = styled.div`
    text-align: center;
    color: white;
    font-size: 25px;
    font-weight: bold;
`;

export const Timer = styled.div`
    min-width: 100px;
    height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 35px;
    color: black;
    outline: 1px solid white;
    border: 2px solid black;
    background-color: white;
    margin-top: 13px;
`;
