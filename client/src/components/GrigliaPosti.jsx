import { Fragment, useContext } from 'react';
import { Button } from "react-bootstrap";
import { LoggedInContext } from "../App";



const GrigliaPosti = (props) => {

    const { loggedIn } = useContext(LoggedInContext);

    const seats = props.seats;
    const modifySelected = props.modifySelected;
    const bookedSeats = props.bookedSeats;
    const stolenSeats = props.stolenSeats;
    const columns = props.columns;

    return (


        //Per creare il 'corridoio' all'interno dell'aereo utilizzo un marginLeft 
        //di 25px, presente o meno in base alla seguente condizione {index % columns === parseInt(columns / 2)}

        <>
            {seats.length !== 0 && seats.map((item, index) => (
                <Fragment key={item.id}>
                    {index % columns === 0 && <br />}
                    <Button disabled={(loggedIn === false || item.free === 0 || bookedSeats.length !== 0) ? true : false}
                        variant={item.free === 1 ? 'primary' : 'danger'}
                        style={{ margin: '1px', marginLeft: (index % columns === parseInt(columns / 2)) ? '25px' : '', border: "2px solid", borderColor: 'black', backgroundColor: item.selected === 1 ? 'orange' : stolenSeats.includes(item.seat) ? 'purple' : '' }}
                        onClick={() => modifySelected(item)} >

                        {`${item.seat}`}

                    </Button>
                </Fragment>
            ))
            }
        </>



    );
}

export default GrigliaPosti;