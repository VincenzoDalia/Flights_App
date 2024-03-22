'use strict';

const express = require('express');
const morgan = require('morgan'); // log messages middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const cors = require('cors');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions


/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    dao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Credenziali errate, prova di nuovo.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  dao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});




// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('./public')); //per le immagini dei voli

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));


// middleware per controllare che una richiesta provenga da un utente autenticato 
const isLoggedIn = (req, res, next) => {

  if (req.isAuthenticated()) //req.isAuthenticated() da Passport.js
    return next();

  return res.status(401).json({ sessionError: 'Utente non autenticato.' });
}


// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wge8d239bwd93rkskb',   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());




/*** APIs ***/


/*  FLIGHTS */

// GET /api/flights/:flight/free
app.get('/api/flights/:flight/free', (req, res) => {
  dao.getFree(req.params.flight)
    .then(freeSeats => res.json(freeSeats))
    .catch(() => res.status(500).end());
});

// GET /api/flights/info
app.get('/api/flights/info', (req, res) => {
  dao.getInfo()
    .then(list => res.json(list))
    .catch(() => res.status(500).end());
});

// POST /api/flights/:flight/delete
app.post('/api/flights/:flight/delete', isLoggedIn, async (req, res) => {

  console.log("req.params.flight: " + req.params.flight);

  try {
    const hasBooked = await dao.hasBooked(req.params.flight, req.user.id);

    if (hasBooked === false) {
      res.status(404).json("Non hai prenotato nessun posto su questo aereo.");
    } else {
      const deletedBooking = await dao.delete(req.params.flight, req.user.id);
      res.json(deletedBooking);

    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }

});


// GET /api/flights/:flight
app.get('/api/flights/:flight', (req, res) => {

  if (req.user !== undefined) {
    dao.getAll(req.params.flight, req.user.id)   //se l'utente è autenticato, uso il suo id per poi filtrare il risultato della query    
      .then(list => res.json(list))
      .catch(() => res.status(500).end());
  } else {
    dao.getAll(req.params.flight)
      .then(list => res.json(list))
      .catch(() => res.status(500).end());
  }

});


// POST /api/flights/:flight/booking
app.post('/api/flights/:flight/booking', isLoggedIn, [
  check('seatsNumber').isInt({ min: 1 }),
  check('selected').isArray().isLength({ min: 1 })

], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty() || req.body.selected.length !== req.body.seatsNumber) {
    return res.status(422).json("Richiesta non valida");
  }

  try {
    // Non inserisco un primo controllo per verificare se il numero di posti richiesti è minore dei posti disponibili,
    // poichè nel caso limite in cui per esempio rimangono solo 3 posti liberi, un utente vuole prenotarli tutti e tre,
    // ma nel frattempo qualcuno ne occupa 1 dei tre, non sarebbe possibile colorarlo di viola,
    // poichè il controllo sulla disponibilità farebbe terminare l'esecuzione prima ancora
    // di determinare quali posti sono stati occupati da altri utenti

    //Eventualmente il controllo sarebbe stato il seguente:

    /* const freeSeats = await dao.getFree(req.params.flight);
    if (req.body.seatsNumber > freeSeats) {
      return res.status(422).json("Il numero di posti selezionati è maggiore di quelli liberi.");
    } */


    //        Controllo per vedere se l'utente ha già prenotato
    const hasBooked = await dao.hasBooked(req.params.flight, req.user.id);
    if (hasBooked === true) {
      return res.status(403).json("Hai già una prenotazione su questo volo.");
    }

    //        Controllo se i posti richiesti esistono
    let seatsToCheck1 = await Promise.all(req.body.selected.map(async (seat) => {
      return await dao.exists(seat);
    }));

    //seatsToCheck1 sarà a questo punto un array di true e false, rimuovo tutti i posti che sono stati trovati sul DB
    seatsToCheck1 = seatsToCheck1.filter((e) => e !== true);

    if (seatsToCheck1.length > 0) {
      // se contiene almeno un 'false' allora significa che è stato richiesto un posto inesistente
      return res.status(404).json("Uno o più posti selezionati non esistono.");

    }

    //        Controllo che i posti selezionati non siano stati occupati da qualcun altro

    const seatsToCheck2 = await Promise.all(req.body.selected.map(async (seat) => {
      return await dao.isBooked(seat.id, req.params.flight);
    }));

    const bookedSeats = seatsToCheck2.filter((e) => e !== ""); //rimuovo le 'righe' vuote restituite dal DB, lasciando solo i posti che sono stati occupati da qualcuno mentre l'utente stava prenotando

    if (bookedSeats.length > 0) {
      //almeno un posto è stato occupato, annullo la prenotazione e ritorno quali posti sono stati occupati da altri
      return res.status(409).json(bookedSeats);

    } else {

      //effettuo la prenotazione dei posti utilizzando l'array ricevuto dalla req
      const result = await Promise.all(req.body.selected.map(async (seat) => {
        const newBooking = {
          id: seat.id,
          seat: seat.seat,
          id_user: req.user.id

        }

        return await dao.addBooking(newBooking, req.params.flight);
      }));

      //console.log(result);
      return res.status(201).json(result.length);  //uso result.length per ritornare quante righe ho modificato, 1 per ogni volta che si esegue la query

    }

  } catch (err) {
    console.log(err);
    res.status(500).end();
  }

});




/*    USER          */

// POST /api/sessions
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from dao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});


// GET /sessions/current
// controllo per vedere se un utente è autenticato o meno
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ sessionError: "Utente non autenticato" });
});


// DELETE /sessions/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});






// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


