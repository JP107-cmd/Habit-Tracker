import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './auth/ProtectedRoute'
import { Routes, Route } from 'react-router'
import AuthProvider from './auth/AuthProvider'

function App() {

  return (
    <AuthProvider>
      <div>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route element={<ProtectedRoute/>}>
            <Route path="/dashboard" element={<Dashboard/>}/>
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
