import axios from "axios";
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export const CreerProjet = () => {
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');  
    const [success, setSuccess] = useState('');  
    
    const submit = async e => {
        e.preventDefault();
    
        if (!titre) {
            setError("Le titre est requis");
            return;
        }
        
        if (!description) {
            setError("La description est requise");
            return;
        }
    
        const projet = {
            titre: titre,
            description: description
        };
    
        try {
            const token = localStorage.getItem("access_token");
            
            if (!token) {
                setError("Vous n'êtes pas connecté. Veuillez vous connecter pour créer un projet.");
                return;
            }
    
            await axios.post('http://localhost:8000/creationProjet/', projet, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  
                }
            });
    
            setTitre('');
            setDescription('');
            setSuccess("Le projet a été créé avec succès !");
            setError('');
        } catch (error) {
            console.error("Erreur complète:", error);
            setSuccess('');
        }
    };

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
                                <form onSubmit={submit}>
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
                                            Créer le projet
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