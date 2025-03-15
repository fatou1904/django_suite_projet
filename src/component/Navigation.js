import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

export function Navigation() {
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

 
  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    setIsAuth(!!token);
  };

  useEffect(() => {
   
    checkAuth();
    
    
    const authChangeEvent = 'authChange';
    
    
    const handleAuthChange = () => {
      checkAuth();
    };
    
    
    window.addEventListener(authChangeEvent, handleAuthChange);
    
   
    const interval = setInterval(checkAuth, 2000);
    
    return () => {
      window.removeEventListener(authChangeEvent, handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      
      await axios.post('http://localhost:8000/logout/', {
        refresh_token: localStorage.getItem('refresh_token')
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
    } catch (e) {
      console.log('Erreur lors de la déconnexion côté serveur:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      axios.defaults.headers.common['Authorization'] = null;
      
      
      setIsAuth(false);
      
     
      window.dispatchEvent(new Event('authChange'));
      
     
      navigate('/login');
    }
  };

  return (
    <Navbar style={{ backgroundColor: '#121212' }} variant="dark" expand="lg">
      <Navbar.Brand href="/">ESMT</Navbar.Brand>
      
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          {isAuth ? (
            <>
              <Nav.Link href="/profile">Mon profil</Nav.Link>
              <Nav.Link href="/afficherProjet">Mes projets</Nav.Link>
              <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Déconnexion
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link href="/register">Inscription</Nav.Link>
              <Nav.Link href="/login">Connexion</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}