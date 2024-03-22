import { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';

import { useNavigate } from 'react-router-dom';
import validator from 'validator';

import API from '../API';

import { UserContext, LoggedInContext } from '../App';


const Login = (props) => {


    const { setLoggedIn } = useContext(LoggedInContext);
    const { setUser } = useContext(UserContext);


    const [username, setUsername] = useState('utente1@abc.it');
    const [password, setPassword] = useState('abc');

    const [error, setError] = useState('');

    const navigate = useNavigate();


    const handleSubmit = (event) => {

        event.preventDefault();

        const credentials = { username, password };

        if (username === '' || password === '') {

            setError('Riempi i campi del Form!');

        } else if (!validator.isEmail(username)) {

            setError('Inserisci una mail valida!');
        } else {

            API.login(credentials)
                .then(user => {
                    setUser(user);
                    setLoggedIn((true));
                    navigate('/');
                })
                .catch(err => {
                    setError(err)
                })
        }
    }

    return (

        <Container className="justify-content-center mt-5" style={{ backgroundColor: "#dcedf9", borderRadius: "20px", border: "1px solid", width: "50%" }}>
            <Row className="justify-content-center" >
                <Col md={6}>


                    <Form onSubmit={handleSubmit} style={{ textAlign: "center" }}>

                        <h2 className="text-center mt-5 mb-4">Login</h2>

                        <Form.Group controlId="email">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" value={username} placeholder="Enter email" onChange={ev => setUsername(ev.target.value)} />
                        </Form.Group>
                        <br />
                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={password} placeholder="Password" onChange={ev => setPassword(ev.target.value)} />
                        </Form.Group>

                        <br /> <br /> <br />

                        <Row className="justify-content-center mb-5">
                            <Col>
                                <Button style={{ width: '100%' }} variant="primary" type="submit" >
                                    Login
                                </Button>
                            </Col>

                            <Col>
                                <Button style={{ width: '100%' }} variant="secondary" onClick={() => navigate('/')} >
                                    Torna alla Home
                                </Button>
                            </Col>
                        </Row>

                        <Row>
                            <br />
                            {error === '' ? <></> : <Alert variant='danger'>{error}</Alert>}

                        </Row>

                    </Form>


                </Col>
            </Row>
        </Container>
    );
}


export default Login;