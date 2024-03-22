import { Spinner } from "react-bootstrap";


function LoadingComponent() {
    return (
        <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
            <h1>Caricamento ...</h1>
            <Spinner animation="border" />
        </div>
    );
}

export default LoadingComponent;