import React, { useState } from "react";
import "./RoomJoin.css";
import { useNavigate } from "react-router-dom";

const RoomJoin = () => {
    const [room, setRoom] = useState(1);
    const [name, setName] = useState(null);

    const navigate = useNavigate();

    return (
        <div className="wrapper">
            <h1>Welcome to Chess Game</h1>
            <form
                onSubmit={() =>
                    navigate("/play/" + room + "/", {
                        state: {
                            room: room,
                            name: name,
                        },
                    })
                }
            >
                <div className="form-control">
                    <label htmlFor="room">Room id</label>
                    <input
                        id="room"
                        type="number"
                        name="room_code"
                        required
                        onChange={(e) => {
                            setRoom(e.target.value);
                        }}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        name="player_name"
                        required
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                </div>
                <input type="submit" className="button" value="Start Game" />
            </form>
        </div>
    );
};

export default RoomJoin;
