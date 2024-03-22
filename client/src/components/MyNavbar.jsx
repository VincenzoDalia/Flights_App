import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import icona from '../assets/react.svg';
import profilo from "../assets/profilo.svg";
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

import { useContext } from 'react';


import { LoggedInContext } from '../App';

const MyNavBar = (props) => {

  const { loggedIn } = useContext(LoggedInContext);


  return (

    <Navbar className='sticky-top' expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand >
          <img
            alt=""
            src={icona}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          Progetto Voli
        </Navbar.Brand>

        <Nav className="me-auto">
          <Link to={'/'}><Button variant='dark' >Home</Button></Link>
          <Link to={'/flights/local'}><Button variant='dark'>Volo Locale</Button></Link>
          <Link to={'/flights/regional'}><Button variant='dark'>Volo Regionale</Button></Link>
          <Link to={'/flights/international'}><Button variant='dark'>Volo Internazionale</Button></Link>
        </Nav>


        {loggedIn === false ?

          <Nav>

            <Link to={'/login'}>
              <Button variant="outline-light" style={{ borderRadius: "25px" }}>
                Login
              </Button>
            </Link>

          </Nav>
          :
          <Nav>

            &nbsp; &nbsp; &nbsp;
            <Link to={'/'}>
              <Button variant="danger" style={{ borderRadius: "25px" }} onClick={props.doLogout}>
                Logout
              </Button>
            </Link>

          </Nav>
        }


      </Container>
    </Navbar >

  );
}

export default MyNavBar;