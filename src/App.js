import './App.css';
import { useState, useEffect } from 'react';
import { Emotions } from './components/emotions';
import { Player } from './components/player';

function App() {
  useEffect(() => {
    authorize().then(
      postUsername()
    );
  }, []);
  
  //Sign In Stuff
  const signIn = async () => {
    const client_id = localStorage.getItem('client_id');
    // generates random string for auth flow
    const generateRandomString = (length) => {
      let text = '';
      let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    //hashes the code verifier
    const generateCodeChallenge = async (codeVerifier) => {
      function base64encode(string) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      }
    
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
    
      return [base64encode(digest), client_id];
    }
    
    let codeVerifier = generateRandomString(128);

    //redirects the user to the sign in screen and then back to application
    generateCodeChallenge(codeVerifier).then(codeChallenge => {
      let state = generateRandomString(16);
      const scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-read-private';

      localStorage.setItem('code_verifier', codeVerifier);

      let args = new URLSearchParams({
        response_type: 'code',
        client_id: codeChallenge[1],
        scope: scope,
        redirect_uri: 'http://localhost:3000',
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge[0]
      });

      window.location = 'https://accounts.spotify.com/authorize?' + args;
    });

  }
  const authorize = async () => {
    const response = await fetch('http://localhost:5000/get_client_id');
    const data = await response.json();
    const client_id = data.client_id;
    localStorage.setItem('client_id', client_id);

    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    let codeVerifier = localStorage.getItem('code_verifier');
    
    let body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'http://localhost:3000',
      client_id: client_id,
      code_verifier: codeVerifier
    });

    await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
      }
      return response.json();
    })
    .then(async data => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('access_token')
        }
      })
      .then(res => res.json()
      .then(data => localStorage.setItem('user_id', data.id)))
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  const postUsername = async () => {
    await fetch('http://localhost:5000/post_username', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        username: localStorage.getItem('user_id')
      })
    });
  }

  //Actual Functions
  //-------------------------------------------------------------------------------------
  const [moods, setMoods] = useState({'sad': {}, 'calm': {}, 'happy': {}, 'energetic': {}});
  const [seeds, setSeeds] = useState({'sad': {}, 'calm': {}, 'happy': {}, 'energetic': {}});
  const [recs, setRecs] = useState({'sad': {}, 'calm': {}, 'happy': {}, 'energetic': {}});
  const [mood, setMood] = useState('sad');
  const [song, setSong] = useState({'': {'name': null, 'artist': null, 'cover': null, 'preview': null, }});
  const [backupMoods, setBackupMoods] = useState({'sad': {}, 'calm': {}, 'happy': {}, 'energetic': {}});
  //change cover to a gray picture

  const playlists = async () => {
    alert('generating playlists');
    await fetch('http://localhost:5000/playlists').then(async response => {
      await response.json().then(async songs => {
        setMoods(songs);
        setBackupMoods(songs);
        await fetch('http://localhost:5000/randomizeSeeds').then(async response => {
          await response.json().then(async seeds => {
            setSeeds(seeds);
            await fetch('http://localhost:5000/getRecs').then(async response => {
              await response.json().then(async recs => {
                setRecs(recs);
              });
            });
          });
        });
      });
    });
  }

  const changeMood = (e) => {
    setMood(e.target.id);
  }

  const create = async () => {
    await fetch('http://localhost:5000/create', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            moods: backupMoods
        })
    });
  }

  //might want to make it all work first, then experiment with using components for each item
  return (
    <div>
      <div id='body'>
        <div id='emotions'>
          <div className='btns'>
            <button onClick={signIn}>sign in</button>
            <button onClick={playlists}>generate</button>
          </div>
          <div className='btns'>
            <button onClick={changeMood} id='sad'>sad</button>
            <button onClick={changeMood} id='calm'>calm</button>
            <button onClick={changeMood} id='happy'>happy</button>
            <button onClick={changeMood} id='energetic'>energetic</button>
            <button onClick={changeMood} id='all'>all</button>
          </div>
          <div className='btns'>
            <button onClick={create} id='create'>add playlists</button>
          </div>
        </div>
        <Emotions backupMoods={backupMoods} setBackupMoods={setBackupMoods} setSong={setSong} moods={moods} seeds={seeds} recs={recs} mood={mood} setSeeds={setSeeds} setRecs={setRecs} setMoods={setMoods}></Emotions>
      </div>
      <Player song={song} setSong={setSong}></Player>
    </div>
  );
}

export default App;