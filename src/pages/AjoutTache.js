import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { TaskContext } from "./TaskContext";

export const AjoutTache = ({ defaultProjetId }) => {
 
  const { refreshTasks } = useContext(TaskContext);
  
  
  const { id: urlProjetId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryProjetId = queryParams.get('projet_id');
  
 
  const projetId = defaultProjetId || urlProjetId || queryProjetId;
  
  console.log("ProjetId utilisé:", projetId);

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [assigned_to, setAssigned_to] = useState(null);
  const [statut, setStatut] = useState("À faire");
  const [progression, setProgression] = useState(0);
  const [dateEcheance, setDateEcheance] = useState("");
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [projets, setProjets] = useState([]);
  const [projetSelectionne, setProjetSelectionne] = useState(projetId || "");

 
  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Vous n'êtes pas connecté. Veuillez vous connecter.");
          return;
        }
        const response = await axios.get("http://localhost:8000/utilisateurs/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUtilisateurs(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs", err);
        setError("Impossible de récupérer les utilisateurs.");
      } finally {
        setLoading(false);
      }
    };

    fetchUtilisateurs();
  }, []);

 
  useEffect(() => {
    const fetchProjets = async () => {
      if (projetId) {
        setProjetSelectionne(projetId);
        return;
      }
      
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Vous n'êtes pas connecté. Veuillez vous connecter.");
          return;
        }
        const response = await axios.get("http://localhost:8000/projets/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjets(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des projets", err);
        setError("Impossible de récupérer les projets.");
      }
    };

    fetchProjets();
  }, [projetId]);

  const submit = async (e) => {
    e.preventDefault();
    
    const projetIdFinal = projetSelectionne || projetId;
    console.log("Titre:", titre, "Description:", description, "ProjetId:", projetIdFinal);
    
    if (!titre || !description) {
      setError("Les champs titre et description sont obligatoires.");
      return;
    }
    
    if (!projetIdFinal) {
      setError("Veuillez sélectionner un projet ou utiliser ce formulaire depuis une page de projet.");
      return;
    }
  
    const tache = {
      titre,
      description,
      statut,
      assigned_to,
      progression,
      projet_id: projetIdFinal, 
      date_echeance: dateEcheance || null, 
    };

    console.log("Données envoyées à l'API :", tache);
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      console.log("Token récupéré :", token);
      if (!token) {
        setError("Vous n'êtes pas connecté. Veuillez vous connecter pour créer une tâche.");
        return;
      }

      await axios.post("http://localhost:8000/ajouterTache/", tache, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setTitre("");
      setDescription("");
      setAssigned_to(null);
      setStatut("");
      setProgression(0);
      setDateEcheance("");
      setSuccess("La tâche a été créée avec succès !");
      setError("");
      
      refreshTasks();
      
    } catch (error) {
      console.error("Erreur lors de la création de la tâche :", error);
      console.error("Détails :", error.response?.data);
      setSuccess("");
      setError(`Une erreur est survenue lors de la création de la tâche : ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3>Ajouter une nouvelle tâche</h3>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Nom de la tâche</label>
          <input
            type="text"
            className="form-control"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            required
          ></textarea>
        </div>
        
        {!projetId && (
          <div className="mb-3">
            <label className="form-label">Projet</label>
            <select
              className="form-select"
              value={projetSelectionne}
              onChange={(e) => setProjetSelectionne(e.target.value)}
              required
            >
              <option value="">Sélectionner un projet</option>
              {projets.map((projet) => (
                <option key={projet.id} value={projet.id}>
                  {projet.nom}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mb-3">
          <label className="form-label">Statut</label>
          <select
            className="form-select"
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
          >
            <option value="à faire">À faire</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Progression</label>
          <input
            type="number"
            className="form-control"
            value={progression}
            onChange={(e) => setProgression(Number(e.target.value))}
            min="0"
            max="100"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Date d'échéance</label>
          <input
            type="datetime-local"
            className="form-control"
            value={dateEcheance}
            onChange={(e) => setDateEcheance(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Assigner à</label>
          <select
            className="form-select"
            value={assigned_to || ""}
            onChange={(e) => setAssigned_to(e.target.value || null)}
          >
            <option value="">Sélectionner un utilisateur (optionnel)</option>
            {utilisateurs.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} {user.role || (user.groups && user.groups[0]?.name) || "Utilisateur"}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Création en cours..." : "Créer la tâche"}
        </button>
      </form>
    </div>
  );
};