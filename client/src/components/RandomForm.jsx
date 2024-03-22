import { Row, Col, Form, Button } from "react-bootstrap";


const RandomForm = (props) => {

    const setNSeats = props.setNSeats;
    const randomSeats = props.randomSeats;

    return (

        <Form onSubmit={randomSeats} style={{ textAlign: "center" }}>

            <br />
            <Form.Group >
                <Form.Label>Inserisci numero posti per generare una combinazione casuale</Form.Label>
                <Form.Control disabled={props.selected.length !== 0} type="number" min={1} placeholder="N. Posti" onChange={ev => setNSeats(ev.target.value)} />
            </Form.Group>

            <br /> <br />

            <Row className="justify-content-center mb-5">
                <Col>
                    {props.selected.length === 0 ?
                        <Button style={{ width: '80%' }} variant="primary" type="submit"  >
                            Genera Combinazione
                        </Button>
                        :
                        <h5>Conferma o annulla nel riquadro a sinistra.</h5>

                    }
                </Col>
            </Row>
        </Form>
    );
}

export default RandomForm;