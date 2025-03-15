import React, { useState, useEffect, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

import axios from 'axios';
import { TaskContext } from './TaskContext';

export const StatistiquesDashboard = ({ projetId, statsData: propStatsData }) => {
  const { taskUpdateTrigger } = useContext(TaskContext);
  
  const [statsData, setStatsData] = useState(propStatsData || {});
  const [loading, setLoading] = useState(!propStatsData);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistiques = async () => {
      if (propStatsData) {
        setStatsData(propStatsData);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Vous n'êtes pas connecté");
          return;
        }
        
        const endpoint = `http://localhost:8000/statistique/`;
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          params: { timestamp: new Date().getTime() }
        });
        console.log("Réponse de l'API:", response.data)
        
        if (projetId && response.data && response.data.taches) {
          const projetTaches = response.data.taches.filter(tache => tache.projet_id === parseInt(projetId));
          console.log("Tâches pour le projet:", projetTaches);

          const totalTaches = projetTaches.length;
          const tachesCompletees = projetTaches.filter(tache => tache.statut === "Terminé").length;
          const tachesDansDelai = projetTaches.filter(tache => {
            return new Date(tache.date_creation) <= new Date(tache.date_echeance);
          }).length;
          
          // Calcul des pourcentages
          const pourcentageCompletion = totalTaches > 0 ? (tachesCompletees / totalTaches * 100) : 0;
          const pourcentageDansDelai = totalTaches > 0 ? (tachesDansDelai / totalTaches * 100) : 0;
          const tachesAFaire = projetTaches.filter(tache => tache.statut === "À faire").length;
         
          const statsFiltre = {
            nombre_taches_total: totalTaches,
            nombre_taches_a_faire: tachesAFaire,
            nombre_taches_completees: tachesCompletees,
            nombre_taches_dans_delai: tachesDansDelai,
            pourcentage_completion: pourcentageCompletion,
            pourcentage_dans_delai: pourcentageDansDelai,
            montant_prime: pourcentageDansDelai >= 90 ? 1000 : 0
          };
          
          setStatsData(statsFiltre);
        } else {
          
          setStatsData(response.data);
        }
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        setError("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistiques();
  }, [projetId, taskUpdateTrigger, propStatsData]);
  
  const stats = statsData || {};

  const colors = {
    completed: '#238636',
    pending: '#30363d',
    inTime: '#1f6feb',
    late: '#f85149'
  };

  const COLORS = ['#238636', '#30363d'];

  // Données pour le graphique à barres des tâches
  const taskData = [
    { name: 'Total', value: stats.nombre_taches_total || 0, fill: colors.pending },
    { name: 'Terminées', value: stats.nombre_taches_completees || 0, fill: colors.completed },
    { name: 'Dans délai', value: stats.nombre_taches_dans_delai || 0, fill: colors.inTime },
  ];

  // Données pour le graphique circulaire des tâches terminées vs en cours vs à faire
  const completionData = [
    { name: 'Terminées', value: stats.nombre_taches_completees || 0 },
    { name: 'À faire', value: stats.nombre_taches_a_faire || 0 },
    { name: 'En cours', value: (stats.nombre_taches_total || 0) - (stats.nombre_taches_completees || 0) - (stats.nombre_taches_a_faire || 0) }
];

  // Données pour le graphique à barres des pourcentages
  const percentageData = [
    { name: 'Complétion', value: stats.pourcentage_completion || 0, fill: colors.completed },
    { name: 'Respect délai', value: stats.pourcentage_dans_delai || 0, fill: colors.inTime },
  ];

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement des statistiques...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="stats-dashboard">
      <style jsx>{`
        .stats-dashboard {
          color: #f0f6fc;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .stats-card {
          background-color: #21262d;
          border-radius: 8px;
          padding: 15px;
          border: 1px solid #30363d;
        }
        .card-title {
          font-size: 1rem;
          margin-bottom: 15px;
          color: #c9d1d9;
          border-bottom: none;
          padding-bottom: 0;
        }
        .prime-status {
          text-align: center;
          padding: 20px 0;
        }

        .prime-amount {
          font-size: 2rem;
          font-weight: bold;
          color: #238636;
          margin-bottom: 10px;
        }
        .prime-message {
          color: #c9d1d9;
          margin-bottom: 15px;
        }
        .progress-bar {
          height: 8px;
          background-color: #30363d;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }
        .progress-fill {
          height: 100%;
          background-color: #238636;
        }
        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #8b949e;
        }
        .stats-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 20px;
        }
        .stat-box {
          background-color: #21262d;
          border-radius: 6px;
          padding: 12px;
          text-align: center;
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #8b949e;
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .stats-details {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="stats-grid">
        <div className="stats-card">
          <h4 className="card-title">État des Tâches</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="name" stroke="#8b949e" />
              <YAxis stroke="#8b949e" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#21262d', border: '1px solid #30363d', borderRadius: '6px' }}
                labelStyle={{ color: '#c9d1d9' }}
                itemStyle={{ color: '#c9d1d9' }}
              />
              <Legend wrapperStyle={{ color: '#c9d1d9' }} />
              <Bar dataKey="value" name="Nombre de tâches" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stats-card">
          <h4 className="card-title">Répartition des Tâches</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#21262d', border: '1px solid #30363d', borderRadius: '6px' }} 
                itemStyle={{ color: '#c9d1d9' }}
              />
              <Legend wrapperStyle={{ color: '#c9d1d9' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h4 className="card-title">Indicateurs de Performance (%)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={percentageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="name" stroke="#8b949e" />
              <YAxis stroke="#8b949e" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#21262d', border: '1px solid #30363d', borderRadius: '6px' }}
                labelStyle={{ color: '#c9d1d9' }}
                itemStyle={{ color: '#c9d1d9' }}
              />
              <Legend wrapperStyle={{ color: '#c9d1d9' }} />
              <Bar dataKey="value" name="Pourcentage" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stats-card">
          <h4 className="card-title">Statut de la Prime</h4>
          <div className="prime-status">
            <div className="prime-amount">
              {stats.montant_prime ? stats.montant_prime.toLocaleString() : 'Données non disponibles'}€
            </div>
            <p className="prime-message">
              {stats.pourcentage_dans_delai >= 90 
                ? "Prime éligible! Félicitations!" 
                : `${(90 - (stats.pourcentage_dans_delai || 0)).toFixed(1)}% de plus nécessaire pour obtenir la prime`}
            </p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(stats.pourcentage_dans_delai || 0, 100)}%` }}></div>
            </div>
            <div className="progress-labels">
              <span>0%</span>
              <span>90% (Seuil)</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-details">
        <div className="stat-box">
          <div className="stat-value">{stats.nombre_taches_total || 0}</div>
          <div className="stat-label">Total Tâches</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.nombre_taches_completees || 0}</div>
          <div className="stat-label">Tâches Terminées</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.nombre_taches_dans_delai || 0}</div>
          <div className="stat-label">Tâches dans délai</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{(stats.pourcentage_completion || 0).toFixed(1)}%</div>
          <div className="stat-label">Taux de Complétion</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{(stats.pourcentage_dans_delai || 0).toFixed(1)}%</div>
          <div className="stat-label">Respect des délais</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.montant_prime ? stats.montant_prime.toLocaleString() : '0'}fcfa</div>
          <div className="stat-label">Prime</div>
        </div>
      </div>
    </div>
  );
};