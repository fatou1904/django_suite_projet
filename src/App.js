import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Navigation } from './component/Navigation';
import { Login } from './pages/Login';
import { Logout } from './pages/Logout';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { CreerProjet } from './pages/CreerProjet';
import { AfficherProjet } from './pages/AfficherProjet';
import { AfficherTache } from './pages/AfficherTache';
import { AjoutTache } from './pages/AjoutTache';
import { EditerTache } from './pages/EditerTache';
import { DeleteTache } from './pages/DeleteTache';
import { DeleteProjet } from './pages/DeleteProjet';
import { EditerProfile } from './pages/EditerProfile';
import { StatistiquesDashboard } from './pages/StatistiquesDashboard';
import { TaskProvider } from './pages/TaskContext'; // ✅ Import correct

function App() {
  return (
    <TaskProvider> {/* ✅ Encapsule toute l'application */}
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/creerProjet' element={<CreerProjet />} />
          <Route path='/afficherProjet' element={<AfficherProjet />} />
          <Route path='/afficherTache/:id' element={<AfficherTache />} />
          <Route path="/ajouterTache/:id" element={<AjoutTache />} />
          <Route path="/editerTache/:id" element={<EditerTache />} />
          <Route path="/deleteTache/:id" element={<DeleteTache />} />
          <Route path="/deleteProjet/:id" element={<DeleteProjet />} />
          <Route path="/editerProfile/:id" element={<EditerProfile />} />
          <Route path='/statistiquesDashboard' element={<StatistiquesDashboard />} />
        </Routes>
      </BrowserRouter>
    </TaskProvider>
  );
}

export default App;
