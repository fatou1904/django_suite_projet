import { useEffect, useState } from "react";
import Nav from "react-bootstrap/Nav";
import { StatistiquesDashboard } from './StatistiquesDashboard';

export const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Récupération du profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("Vous n'êtes pas connecté");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/profile/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expirée. Veuillez vous reconnecter.");
          } else {
            setError("Impossible de récupérer le profil");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setProfile(data);
        setLoading(false);
      } catch (err) {
        setError("Impossible de récupérer le profil");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Récupération des statistiques si l'utilisateur est un professeur
  useEffect(() => {
    const fetchStats = async () => {
      if (profile && profile.role === "professeur") {
        try {
          const token = localStorage.getItem("access_token");
          if (!token) return;
          
          const response = await fetch("http://localhost:8000/statistique/", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const statsData = await response.json();
            setStats(statsData);
          } else {
            console.error("Erreur lors de la récupération des statistiques");
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des statistiques", err);
        }
      }
    };

    fetchStats();
  }, [profile]);

  if (loading)
    return (
      <>
        <style>{styles}</style>
        <div className="dashboard">
          <div className="loader-container">
            <div className="spinner"></div>
            <p className="text-white">Chargement du profil...</p>
          </div>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <style>{styles}</style>
        <div className="dashboard">
          <div className="error-container">
            <div className="error-card">
              <h4 className="error-title">Erreur!</h4>
              <p className="error-message">{error}</p>
              {error.includes("reconnecter") && (
                <button
                  className="dashboard-btn"
                  onClick={() => (window.location.href = "/login")}
                >
                  Se reconnecter
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">
        <div className="sidebar">
          <div className="user-info">
            <h3>{profile.first_name} {profile.last_name}</h3>
            <span className="role-badge">{profile.role}</span>
          </div>
        </div>

        <div className="main-content">
          <header className="dashboard-header">
            <h2>Tableau de bord</h2>
            <div className="header-actions">
              <Nav.Link href={`/editerProfile/${profile.id}`}>Modifier Profile</Nav.Link>
            </div>
          </header>

          <div className="dashboard-grid">
            <div className="dashboard-card user-welcome">
              <h3>Bienvenue, {profile.first_name}!</h3>
              <p>Voici votre tableau de bord personnel</p>
            </div>

            <div className="dashboard-card">
              <h4 className="card-title">Informations personnelles</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nom complet</span>
                  <span className="info-value">{profile.first_name} {profile.last_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{profile.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rôle</span>
                  <span className="info-value role-badge-sm">{profile.role}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h4 className="card-title">Mes projets</h4>
              <ul className="activity-list">
                <li className="activity-item">
                  <div className="header-actions">
                    <button className="dashboard-btn">
                      <Nav.Link href="/creerProjet">Créer un Projet</Nav.Link>
                    </button>
                  </div>
                </li>
                <li className="activity-item">
                  <div className="header-actions">
                    <button className="dashboard-btn">
                      <Nav.Link href="/afficherProjet">Voir mes Projets</Nav.Link>
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            {profile.role === "professeur" && (
              <div className="dashboard-card full-width">
                <h4 className="card-title">Mes statistiques</h4>
                {stats ? (
                  <StatistiquesDashboard statsData={stats} />
                ) : (
                  <p>Aucune statistique disponible pour le moment.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .dashboard {
    display: flex;
    min-height: 100vh;
    background-color: #0d1117;
    color: #f0f6fc;
  }
  
  .sidebar {
    width: 280px;
    background-color: #161b22;
    border-right: 1px solid #30363d;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
  }
  
  .user-info {
    padding: 20px;
    text-align: center;
    border-bottom: 1px solid #30363d;
    margin-bottom: 20px;
  }
  
  .role-badge {
    display: inline-block;
    background-color: #238636;
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    margin-top: 8px;
  }
  
  .role-badge-sm {
    background-color: #238636;
    color: white;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
  }
  
  .main-content {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .dashboard-btn {
    background-color: #238636;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .dashboard-btn:hover {
    background-color: #2ea043;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .dashboard-card {
    background-color: #161b22;
    border-radius: 10px;
    border: 1px solid #30363d;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .full-width {
    grid-column: 1 / -1;
  }
  
  .user-welcome {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #1f6feb, #238636);
    color: white;
  }
  
  .card-title {
    font-size: 1.1rem;
    margin-bottom: 15px;
    color: #c9d1d9;
    border-bottom: 1px solid #30363d;
    padding-bottom: 10px;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
  }
  
  .info-label {
    font-size: 0.75rem;
    color: #8b949e;
    margin-bottom: 5px;
  }
  
  .info-value {
    font-weight: 500;
  }
  
  .activity-list {
    list-style: none;
  }
  
  .activity-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #30363d;
  }
  
  .activity-item:last-child {
    border-bottom: none;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 10px;
  }
  
  .stat-item {
    text-align: center;
    padding: 15px 10px;
    background-color: #21262d;
    border-radius: 8px;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: #8b949e;
  }
  
  .loader-container, .error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #1f6feb;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 20px;
  }
  
  .error-card {
    background-color: #21262d;
    border-left: 4px solid #f85149;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
  }
  
  .error-title {
    color: #f85149;
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
  
  .error-message {
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .dashboard {
      flex-direction: column;
    }
    
    .sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #30363d;
      padding-bottom: 10px;
    }
    
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
`;