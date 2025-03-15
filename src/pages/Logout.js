import { useEffect } from "react";
import axios from "axios";

export const Logout = () => {
    useEffect(() => {
       (async () => {
         try {
            await axios.post('http://localhost:8000/logout/', {
               refresh_token: localStorage.getItem('refresh_token')
           }, {
               headers: { 'Content-Type': 'application/json' },
               withCredentials: true
           });

           localStorage.clear();
           axios.defaults.headers.common['Authorization'] = null;
           
           window.location.href = '/login';
         } catch (e) {
           console.log('Erreur de déconnexion:', e);
         }
       })();
    }, []);

    return (
       <div>Déconnexion en cours...</div>
    );
}
