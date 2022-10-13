import React, { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Container,
    GameContainer,
    GamePlayer,
    Player,
    TakenPieces,
    Buttons,
    PlayerName,
    PlayerData,
    RoomNumber,
    Timer,
} from "./GameElements";
import Board from "../components/Board";
import { CheckIfOpponentInCheck, CanMovePiece } from "../components/Game";
import GameOver from "../components/GameOver";
import { Button } from "../components/GameOverElements";
import { useTimer } from "react-timer-hook";

const Chess = () => {
    const location = useLocation();

    const [start, setStart] = useState(false);
    const [winner, setWinner] = useState(null);
    const [room] = useState(location.state.room);
    // Capitalise name
    const [name] = useState(
        location.state.name.charAt(0).toUpperCase() +
            location.state.name.slice(1)
    );
    const [opponentName, setOpponentName] = useState(null);
    const [playerColour, setPlayerColour] = useState("white");
    const [takenPieces, setTakenPieces] = useState({
        white: [],
        black: [],
    });
    const [isTurn, setIsTurn] = useState(true);

    // Sets initial piece positions ensuring that players colour is always at bottom
    const [boardState, setBoardState] = useState(
        initBoardState(playerColour === "white", getBoardRotation(playerColour))
    );
    const [prevBoardState, setPrevBoardState] = useState(null);

    const [audio] = useState({
        check: new Audio(require("../assets/sounds/check.mp3")),
        move: new Audio(require("../assets/sounds/move.mp3")),
        capture: new Audio(require("../assets/sounds/capture.ogg")),
        end: new Audio(require("../assets/sounds/game_end.mp3")),
    });

    const opponentColour = playerColour === "white" ? "black" : "white";

    const getNewTimer = () => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + 600);
        return time;
    };

    const timer = useTimer({
        expiryTimestamp: getNewTimer(),
        autoStart: false,
        onExpire: () => {
            outOfTime(playerColour === "white" ? "black" : "white");
            timer.pause();
        },
    });

    const opponentTimer = useTimer({
        expiryTimestamp: getNewTimer(),
        autoStart: false,
        onExpire: () => {
            outOfTime(playerColour);
            opponentTimer.pause();
        },
    });

    const outOfTime = (winnerColour) => {
        sendMessage(
            JSON.stringify({
                type: "send_message",
                message: { winnerColour: winnerColour },
                event: "END",
            })
        );
    };

    const { sendMessage } = useWebSocket(
        "ws://127.0.0.1:8000/ws/" + room + "/",
        {
            onOpen: () => {
                sendMessage(
                    JSON.stringify({
                        type: "send_message",
                        message: {
                            opponentName: name,
                        },
                        event: "JOIN",
                    })
                );
            },
            onMessage: (e) => {
                const dataFromServer = JSON.parse(e.data);
                switch (dataFromServer.payload.event) {
                    case "JOIN":
                        if (
                            dataFromServer.payload.message.opponentName === name
                        )
                            break;
                        setOpponentName(
                            dataFromServer.payload.message.opponentName
                        );

                        sendMessage(
                            JSON.stringify({
                                type: "send_message",
                                message: {
                                    opponentName: name,
                                    opponentColour: playerColour,
                                },
                                event: "JOIN_RESPONSE",
                            })
                        );
                        if (playerColour === "white") timer.start();
                        else opponentTimer.start();
                        break;

                    // Message received from player already in the room after joining
                    case "JOIN_RESPONSE":
                        setStart(true);
                        if (
                            dataFromServer.payload.message.opponentName === name
                        )
                            break;

                        // Start whites timer
                        if (playerColour === "white") timer.start();
                        else opponentTimer.start();

                        setPlayerColour("black");
                        setIsTurn(false);
                        setOpponentName(
                            dataFromServer.payload.message.opponentName
                        );
                        break;

                    case "END":
                        // If a player receives the end message, they won
                        setWinner(
                            dataFromServer.payload.message.winnerColour ===
                                playerColour
                        );
                        break;

                    case "MOVE":
                        // Ensure that the message is not from self
                        if (
                            dataFromServer.payload.message.opponent &&
                            dataFromServer.payload.message.opponent.colour !==
                                playerColour
                        ) {
                            const flippedBoard = flipBoard(
                                dataFromServer.payload.message.boardState
                            );
                            // Make sure that the board state has changed
                            // Board must be flipped since the opponent sees it from the other side
                            if (
                                JSON.stringify(flippedBoard) !==
                                JSON.stringify(boardState)
                            ) {
                                playMoveAudio(flippedBoard);
                                setBoardState(flippedBoard);

                                setTakenPieces(
                                    dataFromServer.payload.message.takenPieces
                                );
                            }
                        }
                        break;

                    case "RESTART":
                        // Reset state and swap colour
                        setWinner(null);
                        setTakenPieces({
                            white: [],
                            black: [],
                        });
                        setPlayerColour(opponentColour);
                        setIsTurn(opponentColour === "white");
                        timer.restart(getNewTimer(), playerColour === "white");
                        opponentTimer.restart(
                            getNewTimer(),
                            playerColour !== "white"
                        );
                        break;
                }
            },
        }
    );

    const playMoveAudio = (newBoard) => {
        if (prevBoardState === null) return;
        // Pieces are removed from board state when taken
        // If there is a change in the number of pieces, one has been taken
        if (Object.keys(newBoard).length !== Object.keys(prevBoardState).length)
            audio.capture.play();
        // If no piece has been taken, play the normal move sound
        else audio.move.play();
    };

    const handleCheckmate = () => {
        // Update the kings check state
        let opponentKing, playerKing;
        if (boardState["king_w"].isOwner) {
            opponentKing = boardState["king_b"];
            playerKing = boardState["king_w"];
        } else {
            opponentKing = boardState["king_w"];
            playerKing = boardState["king_b"];
        }

        if (CheckIfOpponentInCheck(boardState, opponentKing)) {
            audio.check.play();
            opponentKing.inCheck = true;
            // disables castling after check
            opponentKing.hasBeenInCheck = true;
        } else {
            opponentKing.inCheck = false;
        }
        // This state will be updated when on the opponents side and sent to the player
        if (playerKing.inCheck) {
            audio.check.play();
        }
    };

    const checkForGameOver = () => {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                for (const [piece, state] of Object.entries(boardState)) {
                    // If a piece can be moved, the game is not over
                    if (
                        state.isOwner &&
                        state.isAlive &&
                        CanMovePiece(
                            x,
                            y,
                            { pieceName: piece, pieceState: state },
                            boardState
                        )
                    )
                        return false;
                }
            }
        }
        return true;
    };

    useEffect(() => {
        // Send the current board state to the websocket group
        // Only send message if the board state has changed to avoid infintite loop of sending
        playMoveAudio(boardState);
        handleCheckmate();

        if (prevBoardState) {
            sendMessage(
                JSON.stringify({
                    type: "send_message",
                    message: {
                        boardState,
                        takenPieces,
                        opponent: { name: name, colour: playerColour },
                    },
                    event: "MOVE",
                })
            );

            // True if there are no possible moves, meaning the opponent won
            if (checkForGameOver()) {
                // Tell the other player that they won
                sendMessage(
                    JSON.stringify({
                        type: "send_message",
                        message: { winnerColour: opponentColour },
                        event: "END",
                    })
                );
            }
        }

        // Swap turns
        setIsTurn((prev) => !prev);
        // Toggle timers
        if (start) {
            if (isTurn) {
                timer.resume();
                opponentTimer.pause();
            } else {
                opponentTimer.resume();
                timer.pause();
            }
        }

        setPrevBoardState({ ...boardState });
    }, [boardState]);

    useEffect(() => {
        // Reset the board the the colour is swapped
        // Dont do this when first joining a room
        if (prevBoardState !== null) {
            setPrevBoardState(null);
            setBoardState(
                initBoardState(
                    playerColour === "white",
                    getBoardRotation(playerColour)
                )
            );
        }
    }, [playerColour]);

    const restartGame = () => {
        // Tell the group to restart game and switch sides
        sendMessage(
            JSON.stringify({
                type: "send_message",
                message: null,
                event: "RESTART",
            })
        );
    };

    const navigate = useNavigate();

    const exitRoom = () => {
        // Return to room join page
        navigate("/join");
    };

    return (
        <Container>
            <Buttons>
                <Button
                    style={{ marginBottom: "20px" }}
                    colour={"rgb(120, 210, 33)"}
                    onClick={restartGame}
                >
                    Swap
                </Button>
                <Button colour={"rgb(198, 34, 34)"} onClick={exitRoom}>
                    Exit
                </Button>
            </Buttons>
            <GameContainer>
                <RoomNumber>Room {room}</RoomNumber>

                <Player>
                    <PlayerData>
                        <PlayerName>{opponentName}</PlayerName>
                        <TakenPieces>
                            {takenPieces[playerColour].map((piecePath, i) => {
                                return <img key={i} src={piecePath} />;
                            })}
                        </TakenPieces>
                    </PlayerData>
                    <Timer>
                        <span>{opponentTimer.minutes}</span>:
                        <span>
                            {opponentTimer.seconds < 10
                                ? "0" + opponentTimer.seconds
                                : opponentTimer.seconds}
                        </span>
                    </Timer>
                </Player>
                <GamePlayer>
                    <Board
                        boardState={boardState}
                        setBoardState={setBoardState}
                        setTakenPieces={setTakenPieces}
                        isTurn={isTurn}
                    />
                    <GameOver
                        show={winner !== null}
                        winner={winner}
                        restartGame={restartGame}
                        exitRoom={exitRoom}
                    />
                </GamePlayer>
                <Player>
                    <PlayerData>
                        <PlayerName>{name}</PlayerName>
                        <TakenPieces>
                            {takenPieces[opponentColour].map((piecePath, i) => {
                                return <img key={i} src={piecePath} />;
                            })}
                        </TakenPieces>
                    </PlayerData>

                    <Timer>
                        <span>{timer.minutes}</span>:
                        <span>
                            {timer.seconds < 10
                                ? "0" + timer.seconds
                                : timer.seconds}
                        </span>
                    </Timer>
                </Player>
            </GameContainer>
        </Container>
    );
};

export default Chess;

const getBoardRotation = (colour) => {
    if (colour === "white") return { white: [7, 6], black: [0, 1] };
    else if (colour === "black") return { white: [0, 1], black: [7, 6] };
    throw "Colour must be black or white";
};

const flipBoard = (boardState) => {
    for (const [key, state] of Object.entries(boardState)) {
        if (key !== "turn") {
            state.row = 7 - state.row;
            state.isOwner = !state.isOwner;
        }
    }
    return boardState;
};

export const initBoardState = (isWhite, boardRotation) => {
    const pieceNames = [
        "castle_w_1",
        "knight_w_1",
        "bishop_w_1",
        "queen_w",
        "king_w",
        "bishop_w_2",
        "knight_w_2",
        "castle_w_2",
        "pawn_w_1",
        "pawn_w_2",
        "pawn_w_3",
        "pawn_w_4",
        "pawn_w_5",
        "pawn_w_6",
        "pawn_w_7",
        "pawn_w_8",
        "castle_b_1",
        "knight_b_1",
        "bishop_b_1",
        "queen_b",
        "king_b",
        "bishop_b_2",
        "knight_b_2",
        "castle_b_2",
        "pawn_b_1",
        "pawn_b_2",
        "pawn_b_3",
        "pawn_b_4",
        "pawn_b_5",
        "pawn_b_6",
        "pawn_b_7",
        "pawn_b_8",
    ];
    const boardState = {};
    for (let i = 0; i < 32; i++) {
        const pieceName = pieceNames[i].split("_")[0];
        // First 16 elements in  pieces array are white rest are black
        // Each 8 elements in array is a row
        if (i < 16) {
            let row;
            if (i < 8) row = boardRotation.white[0];
            else row = boardRotation.white[1];
            const properties = {
                row: row,
                col: i % 8,
                isOwner: isWhite,
                isAlive: true,
            };
            if (pieceName === "king") {
                properties["inCheck"] = false;
                // Used to disable castling
                properties["hasBeenInCheck"] = false;
                properties["hasMoved"] = false;
            } else if (pieceName === "castle") {
                properties["hasMoved"] = false;
            } else if (pieceName === "pawn") {
                // Used for en passant since en passant can only happen on the same turn
                properties["movedTwoSquaresTurn"] = null;
                properties["hasMoved"] = false;
            }

            boardState[pieceNames[i]] = properties;
        } else {
            let row;
            if (i < 24) row = boardRotation.black[0];
            else row = boardRotation.black[1];
            const properties = {
                row: row,
                col: i % 8,
                isOwner: !isWhite,
                isAlive: true,
            };
            if (pieceName === "king") {
                properties["inCheck"] = false;
                // Used to disable castling
                properties["hasBeenInCheck"] = false;
                properties["hasMoved"] = false;
            } else if (pieceName === "castle" || pieceName === "pawn") {
                properties["hasMoved"] = false;
            }

            boardState[pieceNames[i]] = properties;
        }
    }
    boardState["turn"] = 0;
    return boardState;
};
