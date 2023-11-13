import './player.css';

const Player = (props) => {

    const add = async () => {
        await fetch('http://localhost:5000/addRec', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                id: Object.keys(props.song)[0]
            })
        });
    }

    return (
        <div>
            {
                Object.entries(props.song).map(([key, value]) => (
                    <div id='footer'>
                        <div songid={key} id='footer-track'>
                            <img src={value['cover']} alt='cover art'></img>
                            <div>
                                <h4>{value['name']}</h4>
                                <h5>{value['artist']}</h5>
                            </div>
                        </div>
                        <audio id='audio' controls autoPlay src={value['preview']}></audio>
                        <div id='add'>
                            <button onClick={add}>add</button>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export { Player }