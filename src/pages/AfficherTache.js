import { useState, useEffect, useContext } from "react";
import Nav from "react-bootstrap/Nav";
import { useParams } from "react-router-dom";
import { TaskContext } from "./TaskContext";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { Modal, Button, Tab, Tabs } from 'react-bootstrap';

export const AfficherTache = () => {
  const { taskUpdateTrigger } = useContext(TaskContext);
  const { id: projetId } = useParams();
  const [taches, setTaches] = useState([]);
  const [tachesAssignees, setTachesAssignees] = useState([]);
  const [error, setError] = useState(null);
  const [projetTitre, setProjetTitre] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); 
  

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      setCurrentUser({ id: parseInt(userId) });
    }
  }, []);

  useEffect(() => {
    const fetchTaches = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Vous n'êtes pas connecté.");
          return;
        }

        if (projetId) {
          const projetResponse = await fetch(
            `http://localhost:8000/projet/${projetId}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (projetResponse.ok) {
            const projetData = await projetResponse.json();
            setProjetTitre(projetData.titre || "");
          }
        }

        // Récupérer les tâches du projet
        let endpoint;
        if (projetId) {
          endpoint = `http://localhost:8000/taches/projet/${projetId}/`;
        } else {
          endpoint = "http://localhost:8000/taches/";
        }

        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error("Impossible de récupérer les tâches");
        }
        
        const data = await response.json();
        setTaches(data);
        
        // Récupérer les tâches assignées à l'utilisateur dans ce projet
        if (projetId && currentUser) {
          const assignedEndpoint = `http://localhost:8000/assignees/projet/${projetId}/`;
          const assignedResponse = await fetch(assignedEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
          });
          
          if (assignedResponse.ok) {
            const assignedData = await assignedResponse.json();
            setTachesAssignees(assignedData);
          } else {
            const assignedTasks = data.filter(task => task.assigned_to === currentUser.id);
            setTachesAssignees(assignedTasks);
          }
        } else if (currentUser) {
          const assignedTasks = data.filter(task => task.assigned_to === currentUser.id);
          setTachesAssignees(assignedTasks);
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de récupérer les tâches.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaches();
  }, [projetId, taskUpdateTrigger, currentUser]);


  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getCalendarEvents = () => {
    const tasksToDisplay = activeTab === 'all' ? taches : tachesAssignees;
    
    return tasksToDisplay.map(task => {
      let backgroundColor;
      let borderColor;
      
      if (currentUser && task.assigned_to === currentUser.id) {
        backgroundColor = '#86b7fe';
        borderColor = '#0d6efd';
      } else {
        switch (task.statut) {
          case 'À faire':
            backgroundColor = '#ffc107';
            borderColor = '#ffc107';
            break;
          case 'En cours':
            backgroundColor = '#17a2b8';
            borderColor = '#17a2b8';
            break;
          case 'Terminée':
            backgroundColor = '#28a745';
            borderColor = '#28a745';
            break;
          default:
            backgroundColor = '#6c757d';
            borderColor = '#6c757d';
        }
      }

      return {
        id: task.id,
        title: task.titre,
        start: task.date_echeance,
        end: task.date_fin_reelle || task.date_echeance,
        allDay: true,
        extendedProps: {
          description: task.description,
          status: task.statut,
          progression: task.progression,
          assignedTo: task.assigned_to_username,
          createdBy: task.user_username || task.user,
          completeOnTime: task.termine_dans_delai
        },
        backgroundColor,
        borderColor
      };
    });
  };

  const handleEventClick = (clickInfo) => {
    const taskId = parseInt(clickInfo.event.id);
    const task = taches.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowModal(true);
    }
  };


  return (
    <div className="container mt-4">
      <h3>
        {projetId ? `Tâches du projet : ${projetTitre}` : "Tâches"}
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <Button 
          variant={viewMode === 'calendar' ? 'primary' : 'outline-primary'} 
          onClick={() => setViewMode('calendar')}
          className="me-2"
        >
          Vue Calendrier
        </Button>
        <Button 
          variant={viewMode === 'list' ? 'primary' : 'outline-primary'} 
          onClick={() => setViewMode('list')}
        >
          Vue Liste
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="calendar-container">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="all" title="Toutes les tâches">
            </Tab>
            <Tab eventKey="assigned" title="Mes tâches assignées">
            </Tab>
          </Tabs>
          
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={getCalendarEvents()}
            eventClick={handleEventClick}
            height="auto"
            locale={frLocale}
          />
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="all" title="Toutes les tâches">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Progression</th>
                  <th>Date d'échéance</th>
                  <th>Date de fin réelle</th>
                  <th>Terminé dans délai</th>
                  <th>Assignée à</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {taches.length > 0 ? (
                  taches.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        currentUser && item.assigned_to === currentUser.id
                          ? "table-primary"
                          : ""
                      }
                    >
                      <td>{item.titre}</td>
                      <td>{item.description}</td>
                      <td>{item.statut}</td>
                      <td>{item.progression}%</td>
                      <td>{formatDate(item.date_echeance)}</td>
                      <td>{formatDate(item.date_fin_reelle)}</td>
                      <td>{item.termine_dans_delai ? "Oui" : "Non"}</td>
                      <td>{item.assigned_to_username || "Non assignée"}</td>
                      <td>
                        <Nav.Link href={`/editerTache/${item.id}`}>Modifier</Nav.Link>
                        <Nav.Link href={`/deleteTache/${item.id}`}>Supprimer</Nav.Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Aucune tâche disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Tab>
          <Tab eventKey="assigned" title="Mes tâches assignées">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Progression</th>
                  <th>Date d'échéance</th>
                  <th>Créée par</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tachesAssignees.length > 0 ? (
                  tachesAssignees.map((item, index) => (
                    <tr key={index} className="table-primary">
                      <td>{item.titre}</td>
                      <td>{item.description}</td>
                      <td>{item.statut}</td>
                      <td>{item.progression}%</td>
                      <td>{formatDate(item.date_echeance)}</td>
                      <td>{item.user_username || item.user}</td>
                      <td>
                        <Nav.Link href={`/editerTache/${item.id}`}>Modifier</Nav.Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Aucune tâche ne vous est assignée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Tab>
        </Tabs>
      )}

      {projetId && (
        <Nav.Link href="/afficherProjet" className="btn btn-secondary mt-3">
          Retour à la liste des projets
        </Nav.Link>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        {selectedTask && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedTask.titre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>Description:</strong> {selectedTask.description}</p>
              <p><strong>Statut:</strong> {selectedTask.statut}</p>
              <p><strong>Progression:</strong> {selectedTask.progression}%</p>
              <p><strong>Date d'échéance:</strong> {formatDate(selectedTask.date_echeance)}</p>
              <p><strong>Date de fin réelle:</strong> {formatDate(selectedTask.date_fin_reelle)}</p>
              <p><strong>Terminé dans délai:</strong> {selectedTask.termine_dans_delai ? "Oui" : "Non"}</p>
              <p><strong>Assignée à:</strong> {selectedTask.assigned_to_username || "Non assignée"}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Fermer
              </Button>
              <Button variant="primary" href={`/editerTache/${selectedTask.id}`}>
        
                Modifier
              </Button>

              <Button variant="primary" href={`/deleteTache/${selectedTask.id}`}>
        
                Supprimer
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};