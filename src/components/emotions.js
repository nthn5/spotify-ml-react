import './emotions.css';

const Emotions = (props) => {

    //make it so that it sends request to change seeds to flask (need to set that up)
    const drag = () => {
        
    }
    const drop = () => {
       
    }
    const dragOver = (e) => {
        e.preventDefault();
    }

    const shuffle = async () => {
        await fetch('http://localhost:5000/shuffle', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                mood: props.mood
            })
        }).then(async response => {
            await response.json().then(async seeds => {
                props.setSeeds(seeds);
            });
        });
    }

    const getRecs = async () => {
        await fetch('http://localhost:5000/getMoodRecs', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                mood: props.mood
            })
        }).then(async response => {
            await response.json().then(async recs => {
                props.setRecs(recs);
            });
        });
    }

    return (
        <div id='container'>
            <div id='songs-cont'>
                <h4>{props.mood}</h4>
                <div id='songs'>
                    {
                        Object.entries(props.moods[props.mood]).map(([key, value]) => (
                            <div key={key} id='track' draggable='true' onDrag={drag}>
                                <img src={value[2]} alt='cover art'></img>
                                <div>
                                    <h5>{value[0]}</h5>
                                    <h6>{value[1]}</h6>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div id='seeds-cont'>
                <h4>seeds</h4>
                <div id='seeds'>
                    {
                        Object.entries(props.seeds[props.mood]).map(([key, value]) => (
                            <div key={key} id='track' onDragOver={dragOver} onDrop={drop}>
                                <img src={value[2]} alt='cover art'></img>
                                <div>
                                    <h5>{value[0]}</h5>
                                    <h6>{value[1]}</h6>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div>
                    <button id='shuffle' onClick={shuffle}>shuffle</button>
                    <button id='get-recs' onClick={getRecs}>get recs</button>
                </div>
            </div>
            <div id='recs-cont'>
                <h4>recs</h4>
                <div id='recs'>
                    {
                        Object.entries(props.recs[props.mood]).map(([key, value]) => (
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
            </div>
        </div>
    );
}

export {Emotions}