const audio = document.getElementById('radioAudio');
const btnPlayPause = document.getElementById('btnPlayPause');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const soundWave = document.getElementById('soundWave');
const songTitle = document.getElementById('songTitle');
const volumeControl = document.getElementById('volumeControl');
const btnCopyPix = document.getElementById('btnCopyPix');
const pixFeedback = document.getElementById('pixFeedback');

let isPlaying = false;

// 1. Play / Pause
btnPlayPause.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    soundWave.classList.remove('active');
    isPlaying = false;
  } else {
    // Recarrega o stream fresco para evitar delay acumulado
    audio.src = 'https://live.paineldj.com.br/proxy/87fmmg?mp=/stream';
    audio.play().then(() => {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      soundWave.classList.add('active');
      isPlaying = true;
    }).catch(err => console.log('Erro ao iniciar áudio:', err));
  }
});

// 2. Volume
volumeControl.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});

// 3. Atualização de Metadados em Tempo Real (com Media Session para lock screen)
function updateMediaSession(trackName) {
  if ('mediaSession' in navigator) {
    const parts = (trackName || '').split(' - ');
    const artist = parts.length > 1 ? parts[0].trim() : '87 FM Guaxupé';
    const title = parts.length > 1 ? parts[1].trim() : (trackName || 'Ao Vivo');

    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: artist,
      album: '87.9 FM Guaxupé',
      artwork: [
        { src: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGDssoBTjTSWhYl7Xq8d4cYOtLsNq8uNQE2HckDCleKXiV7_8xnz75gei-P9pbCPmc5IH0V7oADMM9pOlF74k4y5vJzBI2RjNB3OkBBreRtpKsz3mOfqjqCDSElv23PFAB7JqocEubrjtD/s1600-r/notasenoticias.jpg', sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => btnPlayPause.click());
    navigator.mediaSession.setActionHandler('pause', () => btnPlayPause.click());
  }
}

function fetchCurrentSong() {
  // Consulta primária na API Centova
  fetch('https://sd.dnip.com.br:2199/rpc/87fmmg/streaminfo.get')
    .then(r => r.json())
    .then(d => {
      if (d && d.data && d.data[0] && d.data[0].song) {
        const song = d.data[0].song.trim();
        if (song) {
          songTitle.textContent = song;
          updateMediaSession(song);
          return;
        }
      }
      fallbackIcecast();
    })
    .catch(() => fallbackIcecast());

  function fallbackIcecast() {
    fetch('https://live.paineldj.com.br/proxy/87fmmg/status-json.xsl')
      .then(r => r.json())
      .then(data => {
        if (data && data.icestats && data.icestats.source) {
          const src = Array.isArray(data.icestats.source) ? data.icestats.source[0] : data.icestats.source;
          if (src && src.title) {
            songTitle.textContent = src.title.trim();
            updateMediaSession(src.title.trim());
          }
        }
      })
      .catch(() => {});
  }
}

setInterval(fetchCurrentSong, 8000);
fetchCurrentSong();

// 4. Copiar Chave Pix
btnCopyPix.addEventListener('click', () => {
  navigator.clipboard.writeText('01.650.919/0001-93').then(() => {
    pixFeedback.textContent = 'Chave Copiada!';
    setTimeout(() => { pixFeedback.textContent = 'Copiar Chave'; }, 3000);
  });
});

// 5. Instalação PWA
let deferredPrompt;
const btnInstall = document.getElementById('btnInstall');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.style.display = 'block';
});

btnInstall.addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      btnInstall.style.display = 'none';
      deferredPrompt = null;
    });
  }
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW falhou:', err));
}
