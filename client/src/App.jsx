import { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MyNavbar from './components/MyNavbar';
import Home from './components/Home';
import LoadingComponent from './components/LoadingComponent';
import Flights from './components/Flights';
import API from './API';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Login from './components/Login';
import { Alert } from 'react-bootstrap';


export const UserContext = createContext();
export const LoggedInContext = createContext();
export const DirtyContext = createContext();
export const FlightsInfoContext = createContext();

function App() {


  const [initialLoading, setInitialLoading] = useState(true);

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(undefined);
  const [dirty, setDirty] = useState(true);

  const [flightsInfo, setFlightsInfo] = useState([]);  //aggiunto ora
  const [error, setError] = useState("");


  useEffect(() => {

    const checkAuth = async () => {
      try {
        //Se l'utente è autenticato, setto negli stati le sue informazioni
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        //Utente non autenticato, all'avvio è normale che non lo sia (401)
      }
    };

    checkAuth();

  }, [dirty]);



  useEffect(() => {

    API.getFlightsInfo()
      .then((list) => {

        setFlightsInfo(list);

        setInitialLoading(false);
      })
      .catch((err) => {
        setInitialLoading(false);
        setError("Errore nel caricamento iniziale.  Prova a ricaricare la pagina.");
      });



  }, []); //carico queste informazioni solamente al primo render, poichè sono informazioni statiche


  const doLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(undefined);
  }


  return (


    <>

      <BrowserRouter>

        <UserContext.Provider value={{ user, setUser }}>
          <LoggedInContext.Provider value={{ loggedIn, setLoggedIn }}>
            <DirtyContext.Provider value={{ dirty, setDirty }}>
              <FlightsInfoContext.Provider value={{ flightsInfo, setFlightsInfo }}>

                <MyNavbar doLogout={doLogout} />

                {initialLoading ? <LoadingComponent /> :

                  <>
                    {error !== "" ? <Alert variant='danger'>{error}</Alert> :
                      <Routes>


                        <Route path='/' element={<Home />} />

                        <Route path='/login' element={loggedIn === false ? <Login /> : <Navigate replace to='/' />} />

                        <Route path='/flights/:flightParam' element={<Flights />} />

                        <Route path='*' element={<Navigate replace to='/' />} />





                      </Routes>
                    }
                  </>
                }
              </FlightsInfoContext.Provider>
            </DirtyContext.Provider>
          </LoggedInContext.Provider>
        </UserContext.Provider>
      </BrowserRouter>


    </>
  )
}

export default App
