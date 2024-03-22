"use strict"


const crypto = require('crypto');
const sqlite = require('sqlite3');
const db = new sqlite.Database("flights.sqlite", (err) => { if (err) throw err });

const port = 3001;



/*              FLIGHTS                 */

exports.getInfo = () => {

    return new Promise((resolve, reject) => {
        const query = `SELECT *  FROM flights`;

        db.all(query, (err, rows) => {

            if (err) {
                reject(err);
                return;

            } else {
                const list = rows.map((row) => ({
                    id: row.id,
                    rows: row.rows,
                    columns: row.columns,
                    plane: row.plane,
                    img: row.img,
                    description: row.description
                }));
                resolve(list);
            }
        });
    })
}

exports.getFree = (flight) => {

    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) as freeSeats,plane FROM seats WHERE free = 1 AND plane = ?`;

        db.get(query, [flight], (err, row) => {

            if (err) {
                reject(err);
                return;

            } else {
                //viene ritornata una sola riga con il numero di posti liberi
                const freeSeats = { plane: row.plane, freeSeats: row.freeSeats };
                resolve(freeSeats);
            }
        });
    })
}


exports.getAll = (flight, idUser) => {

    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM seats WHERE plane=? `;

        db.all(query, [flight], (err, rows) => {
            if (err) {
                reject(err);
                return;

            } else {

                const list = rows.map((row) => {

                    //Se ricevo l'id di un utente (autenticato), lo uso per rimandare al client il posto 
                    //con il suo id_user, utilizzandolo lato client per vedere quali sono i posti prenotati da lui
                    if (idUser !== undefined && idUser === row.id_user) {
                        return {
                            id: row.id,
                            seat: row.seat,
                            free: row.free,
                            id_user: row.id_user
                        }
                    } else {
                        //Altrimenti ogni altro posto viene mandato con id=null, in modo tale da non dare al client
                        //l'informazione su chi ha prenotato gli altri posti
                        return {
                            id: row.id,
                            seat: row.seat,
                            free: row.free,
                            id_user: null
                        }
                    }
                });


                resolve(list);
            }
        });
    })
}

exports.delete = (flight, id) => {

    return new Promise((resolve, reject) => {

        const query = `UPDATE seats SET free=1,id_user=0 WHERE id_user=? AND plane=?`;

        db.run(query, [id, flight], function (err) {

            if (err) {
                reject(err);
                return;

            } else {
                resolve(this.changes);
            }

        });
    })
}


exports.hasBooked = (flight, id) => {

    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) as bookings FROM seats WHERE id_user=? AND plane=?`;

        db.get(query, [id, flight], (err, row) => {

            if (err) {
                reject(err);
                return;

            } else {
                //ritorno true se l'utente ha prenotato, false altrimenti
                const hasBooked = row.bookings > 0;
                resolve(hasBooked);
            }
        });
    })
}

exports.exists = (seat) => {

    return new Promise((resolve, reject) => {
        const query = `SELECT count(*) as match FROM seats WHERE id=? AND seat=?`;

        db.get(query, [seat.id, seat.seat], (err, row) => {

            if (err) {
                reject(err);
                return;

            } else {
                //ritorno true se il posto esiste
                const exists = row.match > 0;
                resolve(exists);
            }
        });
    })

}

exports.isBooked = (idSeat, flight) => {

    return new Promise((resolve, reject) => {
        const query = `SELECT seat FROM seats WHERE id=? AND free=0 AND plane=?`;

        db.get(query, [idSeat, flight], (err, row) => {

            if (err) {
                reject(err);
                return;

            } else {
                //ritorno il posto se è prenotato
                if (row !== undefined)
                    resolve(row.seat);
                else
                    resolve("");
            }
        });
    })
}

exports.addBooking = (booking, flight) => {

    return new Promise((resolve, reject) => {
        const query = `UPDATE seats SET free=0, id_user=? WHERE id=? AND seat=? AND plane=?`;

        db.run(query, [booking.id_user, booking.id, booking.seat, flight], function (err) {

            if (err) {
                reject(err);
                return;
            }

            else {
                resolve(this.changes);
            }
        })
    })
}






/*          USER                     */

exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) { reject(err); }
            else if (row === undefined) { resolve(false); }
            else {
                const user = { id: row.id, username: row.email };

                const salt = row.salt;
                crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
                    if (err) reject(err);

                    const passwordHex = Buffer.from(row.password, 'hex');

                    if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
                        resolve(false);
                    else resolve(user);
                });
            }
        });
    });
};

exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve({ error: 'Utente non trovato.' });
            else {
                // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
                const user = { id: row.id, username: row.email }
                resolve(user);
            }
        });
    });
};
