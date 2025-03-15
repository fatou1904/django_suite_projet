import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const submit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const user = {
      username: username,
      password: password
    };
    
    try {
      const { data } = await axios.post('http://localhost:8000/token/', user, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      
      localStorage.clear();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data['access']}`;
      window.dispatchEvent(new Event('authChange'));
      navigate('/profile'); 
    } catch (error) {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="row vh-100 align-items-center justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="welcome-header text-center mb-4">
              <h1 className="display-5 text-light fw-bold">Bienvenue au portail de gestion des tâches</h1>
              <div className="accent-line mx-auto my-3"></div>
            </div>
            
            <div className="card login-card border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="card-title text-center mb-4">Connexion</h2>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                <form onSubmit={submit}>
                  <div className="mb-4">
                    <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person-fill"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Entrez votre nom d'utilisateur"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Mot de passe</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2 mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Connexion en cours...
                        </>
                      ) : 'Se connecter'}
                    </button>
                
                  </div>
                 
                </form>
                <div>
                    <p className="paragraph">Pas de compte? <Link to="/register">S'inscrire</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .paragraph {
          text-align: center;
          margin-top: 20px;
          color: #e0e0e0;
        }

        .login-page {
          background-color: #000000;
          min-height: 120vh;
          background-image: linear-gradient(135deg, #000000 0%, #121212 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .centering-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100%;
        }
        
        .login-card {
          background-color: #181818;
          border-radius: 12px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          transition: transform 0.3s ease;
          width: 100%;
          max-width: 550px;
          margin: 0 auto;
        }
        
        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.9);
        }
        
        .card-title {
          color: #ffffff;
          font-weight: 600;
          letter-spacing: 1px;
        }
        
        .form-label {
          font-weight: 500;
          color: #e0e0e0;
          letter-spacing: 0.5px;
        }
        
        .input-group-text {
          background-color: #333333;
          color: #ffffff;
          border: none;
        }
        
        .form-control, .form-select {
          background-color: #222222;
          border: 1px solid #333333;
          color: #ffffff;
          padding: 0.75rem;
          transition: all 0.15s ease-in-out;
        }
        
        .form-control:focus, .form-select:focus {
          background-color: #2a2a2a;
          border-color: #555555;
          box-shadow: 0 0 0 0.25rem rgba(85, 85, 85, 0.25);
          color: #ffffff;
        }

        .form-control::placeholder {
          color: #888888;
        }
        
        .btn-primary {
          background: linear-gradient(90deg, #333333, #555555);
          border: none;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }
        
        .btn-primary:hover {
          background: linear-gradient(90deg, #444444, #666666);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        }

        .btn-primary:disabled {
          background: #444444;
          opacity: 0.7;
        }
        
        .alert-danger {
          background-color: rgba(220, 53, 69, 0.2);
          border-color: rgba(220, 53, 69, 0.3);
          color: #ff6b6b;
        }

        .login-link {
          color: #aaaaaa;
          text-decoration: none;
          transition: color 0.2s ease;
          font-weight: 500;
        }

        .login-link:hover {
          color: #ffffff;
          text-decoration: underline;
        }
        
        /* Media queries for responsiveness */
        @media (max-width: 768px) {
          .login-card {
            margin: 0 15px;
          }
          
          .card-body {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};