import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Agendar from './pages/Agendar'
import AdminRuta from './components/AdminRuta'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/admin" element={
          <AdminRuta>
            <AdminPanel />
          </AdminRuta>
        } />
      </Routes>
    </BrowserRouter>
  )
}