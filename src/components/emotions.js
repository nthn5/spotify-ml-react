import './emotions.css';

const Emotions = (props) => {

    const dragStart = (e) => {
        while(!e.target.id){
            e.target = e.target.parentNode;
        }
        e.dataTransfer.setData('dragged-song', JSON.stringify({'id': e.target.id, 'name': e.target.getAttribute('name'), 'artist': e.target.getAttribute('artist'), 'cover': e.target.getAttribute('cover'), 'preview': e.target.getAttribute('preview'),}));
    }
    const drop = async (e) => {
        while(!e.target.id){
            e.target = e.target.parentNode;
        }
        let draggedSong = e.dataTransfer.getData('dragged-song');
        draggedSong = JSON.parse(draggedSong);
        for (let i in props.seeds[props.mood]){
            if (e.target.id === i){
                await fetch('http://localhost:5000/seedSwitch', {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        newSeed: draggedSong['id'],
                        oldSeed: i,
                        mood: props.mood,
                        attr: {
                            name: draggedSong['name'],
                            artist: draggedSong['artist'],
                            cover: draggedSong['cover'],
                            preview: draggedSong['preview']
                        }
                    })
                }).then(async response => {
                    await response.json().then(async seeds => {
                        console.log(props.seeds);
                        props.setSeeds(seeds);
                        console.log(seeds);
                    });
                });
            }
        }

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
    const selectSong = (e) => {
        while(!e.target.id){
            e.target = e.target.parentNode;
        }
        const song = {};
        song[e.target.id] = {'name': e.target.getAttribute('name'), 'artist': e.target.getAttribute('artist'), 'cover': e.target.getAttribute('cover'), 'preview': e.target.getAttribute('preview')};
        props.setSong(song);
    }

    const search = (e) => {
        const matches = {};
        const search = e.target.value;
        for (let i of Object.keys(props.backupMoods[props.mood])){
            if (props.backupMoods[props.mood][i]['name'].toLowerCase().includes(search.toLowerCase()) || props.backupMoods[props.mood][i]['artist'].toLowerCase().includes(search.toLowerCase())){
                matches[i] = (props.backupMoods[props.mood][i]);
            }
        }
        const moods = {'sad': props.moods['sad'], 'calm': props.moods['calm'], 'happy': props.moods['happy'], 'energetic': props.moods['energetic']}
        moods[props.mood] = matches;
        props.setMoods(moods);
    }

    return (
        <div id='container'>
            <div className='border'>
                <div id='songs-cont' className='cont'>
                    <div id='search-cont'>
                        <h2 id='seeds-label'>{props.mood}</h2>
                        <input onChange={search}></input>
                    </div>
                    <div id='songs'>
                        {
                            Object.entries(props.moods[props.mood]).map(([key, value]) => (
                                <div id={key} className='track' name={value['name']} artist={value['artist']} cover={value['cover']} preview={value['preview']} draggable='true' onDragStart={dragStart} onClick={selectSong}>
                                    <img src={value['cover']} alt='cover art'></img>
                                    <div>
                                        <h4>{value['name']}</h4>
                                        <h5>{value['artist']}</h5>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className='border'>
                <div id='seeds-cont' className='cont'>
                    <h2>seeds</h2>
                    <div id='seeds'>
                        {
                            Object.entries(props.seeds[props.mood]).map(([key, value]) => (
                                <div id={key} className='track' onDragOver={dragOver} onDrop={drop} onClick={selectSong}>
                                    <img src={value['cover']} alt='cover art'></img>
                                    <div>
                                        <h4>{value['name']}</h4>
                                        <h5>{value['artist']}</h5>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className='shuffle-recs'>
                        <button id='shuffle' onClick={shuffle}>shuffle</button>
                    </div>
                </div>
            </div>
            <div className='border'>
                <div id='recs-cont' className='cont'>
                    <h2>recs</h2>
                    <div id='recs'>
                        {
                            Object.entries(props.recs[props.mood]).map(([key, value]) => (
                                <div id={key} className='track' name={value['name']} artist={value['artist']} cover={value['cover']} preview={value['preview']} onClick={selectSong} draggable='true' onDragStart={dragStart}>
                                    <img src={value['cover']} alt='cover art'></img>
                                    <div>
                                        <h4>{value['name']}</h4>
                                        <h5>{value['artist']}</h5>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className='shuffle-recs'>
                        <button id='get-recs' onClick={getRecs}>get recs</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export {Emotions}