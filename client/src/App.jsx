import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import SignUp from './pages/SignUp.jsx';

export default function App() {
  return (
  <div>
    <Router>
      <Routes>
        <Route path={"/"} element={<SignUp />} />
        <Route path={"/home"} element={<Home />} />
      </Routes>
    </Router>
  </div>
  )
}
