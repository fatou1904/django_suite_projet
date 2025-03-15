import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export const EditerProfile = () => {
  const [userId, setUserId] = useState(null);
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { id } = useParams(); // Récupération de l'ID depuis les paramètres d'URL

  useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.get(`http://localhost:8000/api/profile/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { id, first_name, last_name, username, email, role } = response.data;

           
            setUserId(id);
            setFirstName(first_name);
            setLastName(last_name);
            setUsername(username);
            setEmail(email);
            setRole(role);
            
            console.log("Données récupérées:", response.data);
        } catch (error) {
            console.error("Erreur de chargement:", error.response?.data || error.message);
            setError("Impossible de charger les informations du profil");
        }
    };
    
    fetchUserProfile();
}, []);

  
  const modifierProfile = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const user = {
      first_name,
      last_name,
      username,
      email,
    };
    
    if (newPassword) {
      user.password = newPassword;
    }
    
    try {
      await axios.put(`http://localhost:8000/modificationProfile/${userId}/`, user, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        },
        withCredentials: true
      });
      
      navigate(-1);
      
    } catch (error) {
      setError(error.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="centering-container">
          <div className="col-12 col-md-10 col-lg-6">
            
            <div className="card login-card border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="card-title text-center mb-4">Modifier le profil</h2>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                <form onSubmit={modifierProfile}>
                    <div className="mb-4">
                        <label htmlFor="last_name" className="form-label">Nom</label>
                        <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-person-fill"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            id="last_name"
                            placeholder="Entrez votre nom"
                            value={last_name}
                            onChange={e => setLastName(e.target.value)}
                            required
                        />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="first_name" className="form-label">Prénom</label>
                        <div className="input-group">
                        <span className="input-group-text">
                        <i className="bi bi-person-badge-fill"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            id="first_name"
                            placeholder="Entrez votre prénom"
                            value={first_name}
                            onChange={e => setFirstName(e.target.value)}
                            required
                        />
                        </div>
                    </div>


                    <div className="mb-4">
                        <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
                        <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-person-circle"></i>
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
                        <label htmlFor="email" className="form-label">Email</label>
                        <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-envelope-fill"></i>
                        </span>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="Entrez votre email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        </div>
                    </div>
                  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="form-label">Nouveau mot de passe (laisser vide pour ne pas modifier)</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        placeholder="Nouveau mot de passe (optionnel)"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
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
                          Mise à jour en cours...
                        </>
                      ) : 'Mettre à jour le profil'}
                    </button>
                  </div>
                </form>
                <div>
                    <p className="paragraph">
                      <Link to="/profile" className="login-link">Retour</Link>
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     
      <style>{`
        .paragraph {
          text-align: center;
          margin-top: 20px;
          color: #e0e0e0;
        }

        .login-page {
          background-color: #000000;
          min-height: 150vh;
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
          margin: 50px auto;
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