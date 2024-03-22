import { useState, useEffect, useContext } from "react";

import { Row, Col, Container, Form, Button, Card, Alert } from "react-bootstrap";
import GrigliaPosti from "./GrigliaPosti";
import DeleteForm from "./DeleteForm";
import RandomForm from "./RandomForm";
import { useParams, useNavigate } from "react-router-dom";

import API from "../API";

import { UserContext, LoggedInContext, DirtyContext, FlightsInfoContext } from "../App";


const Flights = (props) => {

    const navigate = useNavigate();

    const { flightsInfo } = useContext(FlightsInfoContext);
    const { user } = useContext(UserContext);
    const { loggedIn } = useContext(LoggedInContext);
    const { dirty, setDirty } = useContext(DirtyContext);


    const { flightParam } = useParams();


    const [rows, setRows] = useState(0);
    const [columns, setColumns] = useState(0);
    const [flightDescription, setFlightDescription] = useState('');


    const [freeSeats, setFreeSeats] = useState(0);  //posti liberi che recupero dalla getAll(), in modo da averceli aggiornati


    const [seats, setSeats] = useState([]);           //array totale dei posti presi dal DB
    const [selected, setSelected] = useState([]);     //stato per gestire i posti selezionati dall'utente per poi prenotarli
    const [nSeats, setNSeats] = useState(0);          //numero di posti da prenotare con assegnazione casuale, da usare per il Form

    const [bookedSeats, setBookedSeats] = useState([]);    //se l'utente ha prenotato dei posti, li conservo in questo stato

    const [stolenSeats, setStolenSeats] = useState([]);  //conservo in questo stato eventuali posti, tra quelli selezionati manualmente dall'utente, che sono stai occupati da qualcuno prima che l'utente terminasse la prenotazione

    const [errorMsg, setErrorMsg] = useState("");      //uso questi 2 Msg per contenere il messaggio da mostrare all'utente in seguito ad una sua operazione
    const [successMsg, setSuccessMsg] = useState("");



    const modifySelected = (seat) => {

        const compactSeat = { id: seat.id, seat: seat.seat }; //creo una versione ridotta del posto selezionato

        // Rimuovi dai selezionati
        if (selected.some((item) => JSON.stringify(item) === JSON.stringify(compactSeat))) {

            setSelected((oldList) => oldList.filter(
                (e) => e.id !== compactSeat.id
            ));

            setSeats((oldList) => oldList.map((e) => {
                if (e.id === compactSeat.id) {
                    return Object.assign({}, e, { selected: 0 });
                } else {
                    return e;
                }
            })
            )

        } else {
            // Aggiungi ai selezionati
            setSelected((oldList) => [...oldList, compactSeat]);

            setSeats((oldList) => oldList.map((e) => {
                if (e.id === compactSeat.id) {
                    return Object.assign({}, e, { selected: 1 });
                } else {
                    return e;
                }
            })
            )
        }
    }

    const undoSelection = () => {
        for (let i = 0; i < selected.length; i++) {
            modifySelected(selected[i]);
        }
    }

    const randomSeats = (event) => {
        event.preventDefault();
        setErrorMsg("");

        if (nSeats > freeSeats.length || nSeats == 0) {
            setErrorMsg(`Il range valido è tra 1 e ${freeSeats.length}.`)
        } else {
            for (let i = 0; i < nSeats; i++) {
                modifySelected(freeSeats[i]);
            }
        }

        setNSeats(0);
    }

    const addBooking = (event) => {
        event.preventDefault();

        const booking = { seatsNumber: selected.length, selected: selected };

        API.addBooking(booking, flightParam)
            .then((changes) => {
                setSuccessMsg(`Hai prenotato correttamente ${changes} posti.`);
                setTimeout(() => setSuccessMsg(''), 5000);
            })
            .catch(err => {
                console.log('err: ' + err);
                if (Array.isArray(err)) {
                    setStolenSeats(err);  //in questo caso 'err' è l'array di posti occupati da un altro utente al momento della prenotazione
                    setErrorMsg(`Purtroppo i posti ${err.toString()} da te selezionati, sono stati occupati.La prenotazione è stata annullata.`);

                    setTimeout(() => { //dopo 5 secondi azzero lo stato stolen e l'attributo stolen della lista, attributo che uso per la visualizzazione 
                        setStolenSeats([]);
                        setErrorMsg("");
                    }, 5000);
                }

                else {
                    setErrorMsg(`Si è verificato un errore:\n${err}`);
                    setTimeout(() => setSuccessMsg(""), 5000);
                }
            })

        setSelected([]);

        setDirty(true);
    }

    const deleteBooking = (event) => {

        event.preventDefault();

        API.deleteBooking(flightParam)
            .then((changes) => {
                setSuccessMsg(`Hai eliminato correttamente la prenotazione per ${changes} posti.`);
                setTimeout(() => setSuccessMsg(""), 5000);
            })

            .catch(err => {
                if (err.sessionError) {
                    setErrorMsg(`Si è verificato un errore:\n${err.sessionError}`);
                    setTimeout(() => setSuccessMsg(""), 5000);
                } else {
                    setErrorMsg(`Si è verificato un errore:\n${err}`);
                    setTimeout(() => setSuccessMsg(""), 5000);
                }

            })

        setDirty(true);
    }

    // Recupero tutti i posti dalla tabella 'seats' dell'aereo relativo al flightParam.
    // Quando flightParam cambia o viene settato dirty=true, aggiorno le informazioni per l'aereo corrente
    useEffect(() => {

        API.getAll(flightParam)
            .then((list) => {
                setSeats(list);
                setFreeSeats(list.filter(element => element.free === 1));

                if (user !== undefined) {
                    setBookedSeats(list.filter(element => element.id_user === user.id));
                }

                setDirty(false);
            })
            .catch((err) => setErrorMsg(`Si è verificato un errore nel server: ${err.toString()}`))

    }, [dirty, flightParam]);



    // Setto le informazioni statiche (righe,colonne e descrizione tratta) dell'aereo relativo al flightParam.
    // Quando flightParam cambia,  aggiorno le informazioni per l'aereo corrente
    useEffect(() => {

        if (flightsInfo.length !== 0) {

            setRows(flightsInfo.filter((item) => {
                if (item.plane === flightParam)
                    return item.rows;
            })
                .map((e) => e.rows));

            setColumns(flightsInfo.filter((item) => {
                if (item.plane === flightParam)
                    return item.columns;
            })
                .map((e) => e.columns));

            setFlightDescription(flightsInfo.filter((item) => {
                if (item.plane === flightParam)
                    return item.description;
            })
                .map((e) => e.description));
        }

    }, [flightParam]);


    return (

        <div style={{ marginTop: "100px" }}>

            <Row style={{ justifyContent: 'center', textAlign: 'center' }}>
                < Col className="col-4" style={{ backgroundColor: "#dcedf9", borderRadius: "20px", border: "1px solid" }}>
                    <Card style={{ backgroundColor: "#dcedf9", border: "0px" }}>
                        <Card.Body>
                            <Card.Title> Disponibilità Volo {flightDescription}</Card.Title>
                            <Card.Text>
                                Posti totali: {rows * columns}
                                <br />
                                Posti occupati: {rows * columns - freeSeats.length}
                                <br />
                                Posti disponibili: {freeSeats.length - selected.length}
                                <br />
                                Posti richiesti: {selected.length}
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    {selected.length === 0 ?

                        <>{bookedSeats.length === 0 ?
                            <h4>Seleziona i posti che vuoi prenotare cliccandoci sopra, altrimenti genera una combinazione casuale</h4>
                            :
                            <h4>Prenotazione attiva su questo volo.</h4>}
                        </>

                        :
                        <Form onSubmit={addBooking} style={{ textAlign: "center" }}>

                            <Form.Group >
                                <Form.Label>Hai selezionato i seguenti {selected.length} posti:</Form.Label>
                                <Row style={{ justifyContent: 'center' }}>
                                    {selected.map((e) => (
                                        <Col md={1} key={e.id}><h3>{e.seat}</h3></Col>
                                    ))}
                                </Row>
                            </Form.Group>

                            <Button style={{ width: '45%', marginRight: '5px' }} variant="primary" type="submit" >
                                Prenota selezionati
                            </Button>

                            <Button style={{ width: '45%' }} variant="danger" onClick={() => undoSelection()}>
                                Cancella selezione
                            </Button>

                        </Form>
                    }
                </Col>

                <Col className="col-3">
                    <Container style={{ backgroundColor: "#dcedf9", borderRadius: "5px", border: "1px solid" }}>

                        {loggedIn === true ?

                            //LOGGATO
                            <>
                                {bookedSeats.length === 0 ?
                                    //NO PRENOTAZIONI ATTIVE    
                                    <RandomForm randomSeats={randomSeats} undoSelection={undoSelection} selected={selected} errorMsg={errorMsg} nSeats={nSeats} setNSeats={setNSeats} />
                                    :
                                    //PRENOTAZIONI ATTIVE   
                                    <DeleteForm deleteBooking={deleteBooking} bookedSeats={bookedSeats} />
                                }
                            </>
                            :
                            //NON LOGGATO
                            <h3>Per effettuare/cancellare una prenotazione devi prima fare il Login.</h3>
                        }
                    </Container>
                </Col>
            </Row >

            <br /> <br />

            <Row style={{ justifyContent: 'center', textAlign: 'center' }}>
                {successMsg === '' ? <></> : <Alert style={{ width: '40%' }} dismissible variant="success" >{successMsg}</Alert>}
                {errorMsg === '' ? <></> : <Alert style={{ width: '40%' }} dismissible variant="danger" >{errorMsg}</Alert>}
            </Row>

            <Row style={{ justifyContent: 'center', textAlign: 'center' }}>

                <Col className="col-6" style={{ backgroundColor: "#A3E6A0", paddingBottom: '20px', borderRadius: "30px", border: "1px solid", width: '40%', textAlign: 'center' }} >
                    <GrigliaPosti seats={seats} bookedSeats={bookedSeats} stolenSeats={stolenSeats} modifySelected={modifySelected}
                        columns={columns} />
                </Col  >
            </Row>

            <br /> <br /> <br /> <br />
        </div >
    );
}

export default Flights;

