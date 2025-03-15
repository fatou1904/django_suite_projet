import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

export const DeleteProjet = () => {
    const { id } = useParams();
        const navigate = useNavigate();
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');  
    const [success] = useState('');  
    
    useEffect(() => {
        
        const fetchProjet = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await axios.get(`http://localhost:8000/modiffsuppProjet/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Extraire les champs spécifiques
                const { titre, description} = response.data;
                setTitre(titre);
                setDescription(description);
                
                console.log("Données récupérées:", response.data);
            } catch (error) {
                console.error("Erreur de chargement:", error.response?.data || error.message);
                setError("Impossible de charger la tâche");
            }
        };
        fetchProjet();
    }, [id]);

    const deleteProjet = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("access_token");
        
            
            const response = await axios.delete(
                `http://localhost:8000/modiffsuppProjet/${id}/`,
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
        <div className="bg-dark text-light min-vh-100 d-flex align-items-center justify-content-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card bg-dark border-secondary shadow">
                            <div className="card-header bg-dark border-bottom border-secondary">
                                <h3 className="text-center text-info mb-0">Créer un nouveau projet</h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={deleteProjet}>
                                    <div className="mb-4">
                                        <label htmlFor="titre" className="form-label text-light">Titre</label>
                                        <input
                                            id="titre"
                                            value={titre}
                                            onChange={e => setTitre(e.target.value)}
                                            type="text"
                                            className="form-control bg-dark text-light border-secondary"
                                            placeholder="Nom du projet"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="description" className="form-label text-light">Description</label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            rows="4"
                                            className="form-control bg-dark text-light border-secondary"
                                            placeholder="Décrivez votre projet..."
                                        />
                                    </div>

                                    {error && (
                                        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-danger">
                                            {error}
                                        </div>
                                    )}
                                    
                                    {success && (
                                        <div className="alert alert-success bg-success bg-opacity-25 text-success border-success">
                                            {success}
                                        </div>
                                    )}

                                    <div className="d-grid gap-2 mt-4">
                                        <button  type="submit" 
                                            className="btn btn-primary btn-lg">
                                            Supprimer
                                        </button>

                                        <button  type="submit" 
                                            className="btn btn-primary btn-lg" onClick={() => navigate(-1)}>
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};