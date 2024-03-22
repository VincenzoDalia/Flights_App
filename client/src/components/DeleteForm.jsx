import { useState, useEffect } from "react";
import { Fragment } from 'react';

import { Row, Col, Container, Form, Button, Card, Alert } from "react-bootstrap";


const DeleteForm = (props) => {

    const bookedSeats = props.bookedSeats;
    const deleteBooking = props.deleteBooking;

    return (

        <Form onSubmit={deleteBooking} style={{ textAlign: "center" }}>

            <br />
            <Form.Group >
                <Form.Label>Per questo volo hai già prenotato i voli:</Form.Label>
                <br />
                <Row style={{ justifyContent: 'center' }}>
                    {bookedSeats.map((e) => (

                        <Col md={2} key={e.id}><h3 >{e.seat}</h3></Col>
                    ))}
                </Row>
            </Form.Group>

            <br /> <br />

            <Row className="justify-content-center mb-5">
                <Col>
                    <Button style={{ width: '80%' }} variant="danger" type="submit" >
                        Cancella prenotazione
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

export default DeleteForm;