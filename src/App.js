import './App.css';
import { useState, useEffect } from 'react';
import { Emotions } from './components/emotions';

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
  const [emotions, setEmotions] = useState({'sad': {}, 'calm': {}, 'happy': {}, 'energetic': {}});

  const playlists = async () => {
    const response = await fetch('http://localhost:5000/playlists');
    const data = await response.json();
    setEmotions(data);
    console.log(data);
  }

  //might want to make it all work first, then experiment with using components for each item
  return (
    <div>
      <div id='buttons'>
        <button onClick={signIn}>sign in</button>
        <button onClick={playlists}>generate</button>
      </div>
      <div id='emotions'>
        <Emotions emotion={emotions} name='sad'></Emotions>
        <Emotions emotion={emotions} name='calm'></Emotions>
        <Emotions emotion={emotions} name='happy'></Emotions>
        <Emotions emotion={emotions} name='energetic'></Emotions>
      </div>
    </div>
  );
}

export default App;