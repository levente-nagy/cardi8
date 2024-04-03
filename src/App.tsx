
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login_medic from './pages/Login_medic';
import Login_pacient from './pages/Login_pacient';
import Pacienti from './pages/Tabel_pacienti';
import Fisa_pacient from './pages/Afisare_fisa_pacient';
import './App.css';

const App: React.FC = () => {

  return (
    <BrowserRouter> 
      <div>
        <Routes> 
          <Route  index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login_medic" element={<Login_medic />} />
          <Route path="/login_pacient" element={<Login_pacient />} />
          <Route path="/pacienti" element={<Pacienti />} />
          <Route path="/fisa_pacient" element={<Fisa_pacient />} />
        </Routes>
      </div>
    </BrowserRouter> 
  );
};

export default App;