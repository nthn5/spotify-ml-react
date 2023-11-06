import './emotions.css';

const Emotions = (props) => {

    return (
        <div id='container'>
            <h4>{props.name}</h4>
            {
                Object.entries(props.emotion[props.name]).map(([key, value]) => (
                    <div key={key} id='track'>
                        <img src={value[2]} alt='cover art'></img>
                        <div>
                            <h5>{value[0]}</h5>
                            <h6>{value[1]}</h6>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}

export {Emotions}