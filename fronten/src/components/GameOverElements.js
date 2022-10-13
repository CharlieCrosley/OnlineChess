import styled, { keyframes } from "styled-components";

export const GameOverContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-185px, -145px); // center container
    display: ${({ show }) => (show ? "flex" : "none")};
    flex-direction: column;
    align-items: center;

    width: 370px;
    height: 370px;
    background-color: white;
    box-shadow: 0px 0px 5px black;
    border-radius: 5px;
    z-index: 999;
`;

export const Buttons = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-evenly;
    padding-top: 30px;
`;

export const Button = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 45px;
    border: none;
    box-shadow: 0px 0px 3px black;
    font-size: 20px;
    font-weight: 700;
    border-radius: 15px;
    background-color: ${({ colour }) => colour};
    cursor: pointer;

    &:hover {
        transform: scale(1.05);
    }
`;

const bounce = keyframes`
 0%   { transform: scale(1,1) translateY(0); }
          10%  { transform: scale(1.1,.9) translateY(0); }
          30%  { transform: scale(.9,1.1)   translateY(-10px);}
          50%  { transform: scale(1.05,.95) translateY(0); }
          58%  { transform: scale(1,1) translateY(-7px); }
          65%  { transform: scale(1,1) translateY(0);}
          100% { transform: scale(1,1) translateY(0);}
`;

export const Outcome = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    margin-top: 50px;
    font-size: 55px;
    color: black;
    font-weight: 700;

    .w,
    .i,
    .n1,
    .n2,
    .e,
    .r {
        position: relative;
        color: rgb(120, 210, 33);
        text-shadow: 0 3px rgb(120, 180, 33), 0 5px rgb(120, 180, 33),
            0 7px rgb(120, 180, 33);
    }

    .d,
    .e1,
    .f,
    .e2,
    .a,
    .t {
        position: relative;
        color: rgb(178, 34, 34);
        text-shadow: 0 3px rgb(118, 34, 34), 0 5px rgb(118, 34, 34),
            0 7px rgb(118, 34, 34);
    }

    .w,
    .d {
        animation: ${bounce} 1s ease infinite;
        -webkit-animation: ${bounce} 1s ease infinite;
    }

    .i,
    .e1 {
        animation: ${bounce} 1s ease infinite 0.1s;
        -webkit-animation: ${bounce} 1s ease infinite 0.1s;
    }

    .n1,
    .f {
        animation: ${bounce} 1s ease infinite 0.2s;
        -webkit-animation: ${bounce} 1s ease infinite 0.2s;
    }

    .n2,
    .e2 {
        animation: ${bounce} 1s ease infinite 0.3s;
        -webkit-animation: ${bounce} 1s ease infinite 0.3s;
    }

    .e,
    .a {
        animation: ${bounce} 1s ease infinite 0.4s;
        -webkit-animation: ${bounce} 1s ease infinite 0.4s;
    }

    .r,
    .t {
        animation: ${bounce} 1s ease infinite 0.5s;
        -webkit-animation: ${bounce} 1s ease infinite 0.5s;
    }
`;
