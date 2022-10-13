import "./App.css";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Chess from "./pages/Chess";
import RoomJoin from "./pages/RoomJoin";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate replace to="/join" />} />
                    <Route path="/join" exact element={<RoomJoin />} />
                    <Route path="/play/:room" exact element={<Chess />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
