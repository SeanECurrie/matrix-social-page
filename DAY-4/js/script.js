const clientId = 'fc2dc4f525fb49c98a480c62c1659040';
const clientSecret = '1c6eb372e5424ba38004fad56ab3e1d7';
let token;
let studentData;
let song;
let currentTrack, currentArtist; // added for saving current track and artist

// geting canvas by Boujjou Achraf
var c = document.getElementById("c");
var ctx = c.getContext("2d");

//making the canvas full screen
c.height = window.innerHeight;
c.width = window.innerWidth;

//chinese characters - taken from the unicode charset
var matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
//converting the string into an array of single characters
matrix = matrix.split("");

var font_size = 10;
var columns = c.width/font_size; //number of columns for the rain
//an array of drops - one per column
var drops = [];
//x below is the x coordinate
//1 = y co-ordinate of the drop(same for every drop initially)
for(var x = 0; x < columns; x++)
    drops[x] = 1; 

//drawing the characters
function draw()
{
    //Black BG for the canvas
    //translucent BG to show trail
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = "#1ca152";//green text
    ctx.font = font_size + "px arial";
    //looping over drops
    for(var i = 0; i < drops.length; i++)
    {
        //a random chinese character to print
        var text = matrix[Math.floor(Math.random()*matrix.length)];
        //x = i*font_size, y = value of drops[i]*font_size
        ctx.fillText(text, i*font_size, drops[i]*font_size);

        //sending the drop back to the top randomly after it has crossed the screen
        //adding a randomness to the reset to make the drops scattered on the Y axis
        if(drops[i]*font_size > c.height && Math.random() > 0.975)
            drops[i] = 0;

        //incrementing Y coordinate
        drops[i]++;
    }
}
///////////////////////////
setInterval(draw, 35);
async function getToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    //fixed URL
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${btoa(clientId + ':' + clientSecret)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  if (res.ok) {
    const data = await res.json();
    return data.access_token;
  }
}

(async () => {
  token = await getToken();
})();

async function getSongApiCall(track, artist) {
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${track},${artist}&type=track,artist&`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        'Content-Type': 'application/json',
      },
    }
  );
  if (res.ok) {
    const data = await res.json();
    console.log(data.tracks.items[0].preview_url);
    return data.tracks.items[0].preview_url;
  }
}
const studentListDiv = document.getElementById('box');

window.playSong = async function (track, artist, buttonElement) {
  currentTrack = track;
  currentArtist = artist;
  if (song) {
    stopSong();
  }
  const playPauseBtn = buttonElement;
  playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  playPauseBtn.onclick = function () {
    pauseSong(playPauseBtn);
  };

  const galleryImgWrapper = buttonElement.parentElement;
  const imgElement = galleryImgWrapper.querySelector('.gallery-img');

  try {
    const songUrl = await getSongApiCall(track, artist);
    song = new Audio(songUrl);
    song.volume = 0.5;
    song.play();
  } catch (error) {
    console.error('Failed to get song:', error);
  }
};
window.pauseSong = function (buttonElement) {
  // added buttonElement as an argument
  if (song) {
    song.pause();
  }
  buttonElement.innerHTML = '<i class="fas fa-play"></i>';
  buttonElement.onclick = function () {
    playSong(currentTrack, currentArtist, buttonElement); // use saved track and artist
  };
};

window.stopSong = function () {
  if (song) {
    song.pause();
    song = null;
  }
};

fetch('../static/students/student_cards.json')
  .then((response) => response.json())
  .then((data) => {
    studentData = data;
    studentData.students.forEach((student) => {
      let studentDiv = document.createElement('div');
      studentDiv.className = 'box';

      let imgWrapper = document.createElement('div');
      imgWrapper.className = 'gallery-img-wrapper';

      let imgElement = document.createElement('img');
      imgElement.className = 'gallery-img';
      imgElement.src = `../static/images/${student.avatar_pic}`;
      imgElement.alt = `${student.track} - ${student.artist}`;

      let playPauseBtn = document.createElement('button');
      playPauseBtn.className = 'play-pause-btn';
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      playPauseBtn.onclick = function () {
        playSong(student.track, student.artist, this);
      };

      let studentName = document.createElement('div');
      studentName.className = 'student-name';
      studentName.textContent = student.name;

      imgWrapper.appendChild(imgElement);
      imgWrapper.appendChild(playPauseBtn);
      studentDiv.appendChild(imgWrapper);
      studentDiv.appendChild(studentName);

      studentListDiv.appendChild(studentDiv);
    });
  })
  .catch((error) => {
    console.error('Failed to fetch student data:', error);
  });
