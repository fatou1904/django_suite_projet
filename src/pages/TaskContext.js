import React, { createContext, useState } from 'react';

export const TaskContext = createContext();

// Composant Provider
export const TaskProvider = ({ children }) => {
  // État pour déclencher les mises à jour
  const [taskUpdateTrigger, setTaskUpdateTrigger] = useState(0);
  
  // Fonction pour rafraîchir les tâches
  const refreshTasks = () => {
    setTaskUpdateTrigger(prev => prev + 1);
  };
  
  const contextValue = {
    taskUpdateTrigger,
    refreshTasks
  };
  
  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};