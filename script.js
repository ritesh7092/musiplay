console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutes(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "00:00";
    }
    seconds = Math.abs(seconds);

    
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Ensure leading zeros for single-digit minutes and seconds
    var formattedMinutes = (minutes < 10) ? '0' + minutes : minutes;
    var formattedSeconds = (remainingSeconds < 10) ? '0' + remainingSeconds : remainingSeconds;

    // Return the formatted time string
    return formattedMinutes + ':' + formattedSeconds;
}



async function getSongs(folder){
    currFolder = folder;

    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
     songs = []
    for(let index=0; index<as.length; index++){
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // 
     // Show all the songs in the playlist
     let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
     songUL.innerHTML = ""
     for (const song of songs) {
         songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                             <div class="info">
                                 <div> ${song.replaceAll("%20", " ")}</div>
                                 <div>Harry</div>
                             </div>
                             <div class="playnow">
                                 <span>Play Now</span>
                                 <img class="invert" src="img/play.svg" alt="">
                             </div> </li>`;
     }
 
     // Attach an event listener to each song
     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
         e.addEventListener("click", element => {
             playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
 
         })
     })
    //  
    return songs
}

const playMusic = (track, pause=false)=>{
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + decodeURI(track);
    if(!pause){
        currentSong.play();
        play.src="pause.svg";
    }
    
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let folders = []
    Array.from(anchors).forEach(e=>{
        if(e.href.includes("/songs")){
            console.log(e.href.split("/").slice(-2)[0])
        }
    })
}

async function main(){
    // Get the list of all the songs 
    songs = await getSongs("songs/ncs")
    playMusic(songs[0], true)
    
    //  Display all the albums on the page
    displayAlbums()
    // Attach an event listener to play, next and previous
   play.addEventListener("click", ()=>{
    if(currentSong.paused){
        currentSong.play();
        play.src="pause.svg"
    }
    else{
        currentSong.pause();
        play.src = "play.svg"
    }
   })

    //    Listent for time update event
    currentSong.addEventListener("timeupdate", ()=>{
       console.log(currentSong.currentTime, currentSong.duration);
       document.querySelector(".songtime").innerHTML =  
       `${secondsToMinutes(currentSong.currentTime)} /
       ${secondsToMinutes(currentSong.duration)}`
       document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    })

    // Add an event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent  + "%";
        currentSong.currentTime = ((currentSong.duration) * percent)/100;
    })

    // Add an event listener for haburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous and next
    previous.addEventListener("click", ()=>{
        console.log("Previous clicked");
        console.log(currentSong);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }

    })

    next.addEventListener("click", ()=>{
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    // Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",
    (e)=>{
        currentSong.volume = parseInt(e.target.value)/100;
    })

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

} 

main()