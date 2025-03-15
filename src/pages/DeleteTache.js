import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export const  DeleteTache = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [statut, setStatut] = useState('');
    const [progression, setProgression] = useState(0);
    const [error, setError] = useState(null);
   

    useEffect(() => {
        
        const fetchTaches = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await axios.get(`http://localhost:8000/modiffsupp/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Extraire les champs spécifiques
                const { titre, description, statut, progression} = response.data;
                setTitre(titre);
                setDescription(description);
                setStatut(statut);
                setProgression(progression);
                
                console.log("Données récupérées:", response.data);
            } catch (error) {
                console.error("Erreur de chargement:", error.response?.data || error.message);
                setError("Impossible de charger la tâche");
            }
        };
        fetchTaches();
    }, [id]);

    const deleteTache = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("access_token");
        
            
            const response = await axios.delete(
                `http://localhost:8000/modiffsupp/${id}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log("Réponse de modification:", response.data);
            navigate(-1); // pour retourner à la liste des taches
        } catch (error) {
            console.error("Erreur de modification:", error);
            if (error.response) {
                console.error("Détails de l'erreur:", error.response.data);
                setError(`Impossible de modifier la tâche: ${JSON.stringify(error.response.data)}`);
            } else {
                setError(`Impossible de modifier la tâche: ${error.message}`);
            }
        }
    }

    return (
        <div className="mt-4">
            <h3>Modifier une tâche</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={deleteTache}>
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
                <button type="submit" className="btn btn-primary">
                    supprimer
                </button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>
                    Annuler
                </button>
            </form>
        </div>
    );
}