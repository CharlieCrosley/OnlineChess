import React from "react";
import {
    GameOverContainer,
    Button,
    Buttons,
    Outcome,
} from "./GameOverElements";

const GameOver = ({ show, winner, restartGame, exitRoom }) => {
    const win = () => {
        return (
            <>
                <div class="w">W</div>
                <div class="i">I</div>
                <div class="n1">N</div>
                <div class="n2">N</div>
                <div class="e">E</div>
                <div class="r">R</div>
            </>
        );
    };

    const lose = () => {
        return (
            <>
                <div class="d">D</div>
                <div class="e1">E</div>
                <div class="f">F</div>
                <div class="e2">E</div>
                <div class="a">A</div>
                <div class="t">T</div>
            </>
        );
    };
    return (
        <GameOverContainer show={show}>
            <Outcome>{winner ? win() : lose()}</Outcome>
            <Buttons>
                <Button colour={"rgb(120, 210, 33)"} onClick={restartGame}>
                    Restart
                </Button>
                <Button colour={"rgb(198, 34, 34)"} onClick={exitRoom}>
                    Exit
                </Button>
            </Buttons>
        </GameOverContainer>
    );
};

export default GameOver;
