const URL = 'http://localhost:3001/api';


/*          FLIGHTS CON PARAMETRO             */

async function addBooking(booking, flight) {

    const response = await fetch(URL + `/flights/${flight}/booking`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.assign({}, booking))
        });

    const changes = await response.json();

    if (response.ok) {
        return changes;

    } else {
        throw changes;
    }
}

async function deleteBooking(flight) {

    const response = await fetch(URL + `/flights/${flight}/delete`, {
        method: 'POST',
        credentials: "include"
    });
    const changes = await response.json();

    if (response.ok) {
        return changes;

    } else {
        throw changes;
    }
}

async function getAll(flight) {

    const response = await fetch(URL + `/flights/${flight}`, {
        credentials: "include"
    });
    const list = await response.json();

    if (response.ok) {
        return list;

    } else {
        throw list;
    }
}

/*          HOME                 */

async function getFree(flight) {

    const response = await fetch(URL + `/flights/${flight}/free`);

    const freeSeats = await response.json();

    if (response.ok) {
        return freeSeats;

    } else {
        throw freeSeats;
    }
}


/*          APP                  */

async function getFlightsInfo() {

    const response = await fetch(URL + "/flights/info");

    const list = await response.json();

    if (response.ok) {
        return list;

    } else {
        throw list;
    }
}




/*          USER                  */


async function login(credentials) {

    let response = await fetch(URL + '/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function getUserInfo() {
    const response = await fetch(URL + '/sessions/current', {
        credentials: 'include'
    });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}

async function logout() {
    await fetch(URL + '/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
}



const API = {

    //flights
    deleteBooking, getAll, addBooking,

    //home
    getFlightsInfo, getFree,

    //user
    login, getUserInfo, logout
};

export default API;