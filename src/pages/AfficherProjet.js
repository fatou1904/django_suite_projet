import { useEffect, useState } from "react";
import Nav from 'react-bootstrap/Nav';

export const AfficherProjet = () => {
    const [affichage, setAffichage] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Récupérer les projets
    useEffect(() => {
        const fetchAffichage = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    setError("Vous n'êtes pas connecté");
                    return;
                }
    
                const response = await fetch("http://localhost:8000/afficherProjet/", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
    
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des projets");
                }
    
                const data = await response.json();
                console.log("Projets récupérés:", data);
                setAffichage(data);
            } catch (err) {
                setError(err.message || "Impossible de récupérer les projets");
            } finally {
                setLoading(false);
            }
        };
    
        fetchAffichage();
    }, []);

    // Récupérer les tâches assignées à l'utilisateur courant
    useEffect(() => {
        const fetchTachesAssignees = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    return;
                }
                
              
                const response = await fetch("http://localhost:8000/assignees/", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error("Impossible de récupérer les tâches assignées");
                }

                const data = await response.json();
                console.log("Tâches assignées récupérées:", data);
        
            } catch (err) {
                console.error("Erreur:", err);
            }
        };

        fetchTachesAssignees();
    }, []);
    
    const styles = {
        container: {
            padding: "20px",
            maxWidth: "1000px",
            margin: "0 auto",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#121212",
            color: "#fff",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            borderRadius: "8px",
            overflow: "hidden",
            marginBottom: "30px",
        },
        thead: {
            backgroundColor: "#212121",
        },
        th: {
            padding: "12px 15px",
            textAlign: "left",
            fontWeight: "bold",
            borderBottom: "1px solid #333",
        },
        td: {
            padding: "10px 15px",
            borderBottom: "1px solid #333",
        },
        actionCell: {
            display: "flex",
            gap: "10px",
        },
        link: {
            color: "#90CAF9",
            textDecoration: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            transition: "background-color 0.3s",
        },
        viewLink: {
            backgroundColor: "rgba(33, 150, 243, 0.1)",
        },
        lookLink: {
            backgroundColor: "rgba(41, 243, 41, 0.1)",
        },
        deleteLink: {
            backgroundColor: "rgba(244, 67, 54, 0.1)",
            color: "#EF9A9A",
        },
        error: {
            color: "#f44336",
            padding: "15px",
            backgroundColor: "rgba(244, 67, 54, 0.1)",
            borderRadius: "4px",
            marginBottom: "20px",
        },
        emptyMessage: {
            textAlign: "center",
            padding: "20px",
            color: "#aaa",
        },
        sectionTitle: {
            color: "#fff",
            marginTop: "40px",
            marginBottom: "20px",
            borderBottom: "1px solid #333",
            paddingBottom: "10px",
        }
    };



    return (
        <div style={styles.container}>
          <h3>Mes projets & Tâches</h3>
            {error ? (
                <div style={styles.error}>
                    <p>{error}</p>
                </div>
            ) : loading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : (
                <table style={styles.table}>
                   
                    <thead style={styles.thead}>
                        <tr>
                            <th style={styles.th}>Nom du projet</th>
                            <th style={styles.th}>description</th>
                            <th style={styles.th}>Date création</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {affichage.length > 0 ? (
                            affichage.map((item, index) => (
                                <tr key={index}>
                                    <td style={styles.td}>{item.titre}</td>
                                    <td style={styles.td}>{item.description}</td>
                                    <td style={styles.td}>
                                        {new Date(item.date_creation).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actionCell}>
                                            <Nav.Link href={`/afficherTache/${item.id}`}
                                                style={{...styles.link, ...styles.lookLink}} >
                                                Voir les tâches du projet
                                            </Nav.Link>

                                            <Nav.Link href={`/ajouterTache/${item.id}`}
                                                style={{...styles.link, ...styles.viewLink}} >
                                                Ajouter une tâche
                                            </Nav.Link>

                                            <Nav.Link href={`/deleteProjet/${item.id}`}>Supprimer</Nav.Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={styles.emptyMessage}>
                                    Aucun projet disponible
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
          
        </div>
    );
};