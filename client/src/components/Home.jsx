import { Container, Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import API from '../API';


import { useState, useEffect, useContext } from 'react';

import { LoggedInContext, FlightsInfoContext, DirtyContext } from '../App';


const Home = (props) => {

    const { setDirty } = useContext(DirtyContext);
    const { loggedIn } = useContext(LoggedInContext);

    const { flightsInfo, setFlightsInfo } = useContext(FlightsInfoContext);

    const urlImages = "http://localhost:3001/images/";


    const [errorMsg, setErrorMsg] = useState('');

    const handleError = (err) => {
        console.log(err);
        setErrorMsg(`Si è verificato un errore nel server: ${err.toString()}`);
        setTimeout(() => setErrorMsg(''), 5000);
    }

    useEffect(() => {

        for (let i = 0; i < flightsInfo.length; i++) {

            API.getFree(flightsInfo[i].plane)
                .then((obj) => {
                    setFlightsInfo((oldList) => oldList.map((e) => {
                        if (e.plane === obj.plane) {
                            return Object.assign({}, e, { freeSeats: obj.freeSeats });
                        } else {
                            return e;
                        }
                    }));
                })
                .catch((err) => handleError(err));
        }

        setDirty(false);

    }, []);



    return (
        <Container style={{ marginTop: "5%", textAlign: 'center' }}>

            <h1>Seleziona uno dei nostri voli</h1>
            <Row className="justify-content-center mt-5">

                {errorMsg !== '' ? <Alert variant='danger'>{errorMsg}</Alert> : <></>}

                {flightsInfo.length !== 0 && flightsInfo.map((item) => (

                    <Col key={item.id} md={4} >

                        <Card>

                            <Card.Body>
                                <Card.Title> {item.plane.toUpperCase()}</Card.Title>
                                <Card.Text>
                                    Aereo diretto {item.description}
                                </Card.Text>

                                <Card.Img style={{ marginBottom: '5px' }} src={urlImages.concat(item.img)} />

                                <br />
                                <Card.Text>
                                    Posti Totali: {item.rows * item.columns}
                                </Card.Text>
                                <Card.Text>
                                    Posti Disponibili: {item.freeSeats}
                                </Card.Text>
                                <Card.Text>
                                    Posti Occupati: {item.rows * item.columns - item.freeSeats}
                                </Card.Text>
                                <br />
                                <Link to={`/flights/${item.plane}`}>
                                    {loggedIn === true ? <Button variant="primary">Prenota/Modifica Prenotazione</Button> : <Button variant="primary">Controlla Disponibilità</Button>}
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}



            </Row>
            <br /> <br /><br />
        </Container>
    );
}


export default Home;