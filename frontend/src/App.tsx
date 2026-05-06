import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login    from './pages/Login'
import Register from './pages/Register'
import Agendar from './pages/Agendar'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/agendar" element={<Agendar />} />
      </Routes>
    </BrowserRouter>
  )
}
