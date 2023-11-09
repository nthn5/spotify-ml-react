import './player.css';

const Player = (props) => {

    const add = async () => {

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