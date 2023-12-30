// fade in effect

addEventListener("scroll", updateVisibleTracks);

function updateVisibleTracks() {
    let tracks = document.querySelectorAll(".track:not(.fade_in)");
    tracks.forEach(p => {
        let box = p.getBoundingClientRect();
        if (box.top + 60 < window.innerHeight) {
            p.classList.add("fade_in");
        }
    });
}

window.addEventListener("load", updateVisibleTracks);







// loading and playing audio

function pauseAllAudio() {
    document.querySelectorAll(".audio_player").forEach(player => {
        const audio_element = player.querySelector("audio");
        audio_element.pause();
        player.classList.remove("playing");
    });
}

function durationString(duration_sec) {
    const minutes = Math.floor(duration_sec / 60);
    const seconds = Math.floor(duration_sec % 60);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}


//iterate through audio players and set up their audio

document.querySelectorAll(".audio_player").forEach(player => {
    // set repeated HTML interior here to remove clutter / redundancy
    player.innerHTML = `
    <button class="play_pause"><div class="play_pause_icon"></div></button>
    <div class="time_and_seek">
        <p class="time_display"><span class="current_time">0:00</span> / <span class="duration">0:00</span></p>
        <div class="seek_bar_event_target">
            <div class="seek_bar">
                <div class="seek_handle"></div>
            </div>
        </div>
    </div>`;

    const audio_element = new Audio();
    audio_element.preload = "metadata";
    audio_element.src = player.dataset.audioSrc;
    player.append(audio_element); // easier to implement pause all audio function

    let context; // don't initialize until after user interaction, to avoid warning

    // play button triggers audio
    const play_button = player.querySelector(".play_pause");
    play_button.addEventListener("click", e => {
        if (!context) {
            context = new AudioContext();
            const track = context.createMediaElementSource(audio_element);
            track.connect(context.destination);
        }
        if (player.classList.contains("playing")) {
            audio_element.pause();
        }
        else {
            pauseAllAudio();
            audio_element.play();
        }
    });

    // update UI to match play/pause state (not always caused by a click)
    audio_element.addEventListener("play", e => {
        player.classList.add("playing");
    });
    audio_element.addEventListener("pause", e => {
        player.classList.remove("playing");
    });

    // duration
    const seek_bar = player.querySelector(".seek_bar");
    const seek_bar_event_target = player.querySelector(".seek_bar_event_target");
    audio_element.addEventListener("loadedmetadata", e => {
        player.querySelector(".duration").textContent = durationString(audio_element.duration);
    });
    const setCurrentTimeDisplay = function (time) {
        player.querySelector(".current_time").textContent = durationString(time);
        const fraction = time / audio_element.duration;
        seek_bar.style.borderLeftWidth = fraction * seek_bar.getBoundingClientRect().width + "px";
    }
    audio_element.addEventListener("timeupdate", e => {
        if (player.classList.contains("seeking")) return;
        setCurrentTimeDisplay(audio_element.currentTime);
    });

    // seek
    let seek_time_target = 0; // store where we want to seek until we're done seeking, only then update audio's current time
    let seek = function (e) {
        player.classList.add("seeking");
        document.body.style.userSelect = "none";
        // use client coords to figure out position because offsetX is messed up by bigger event target, child elements, borders, translation, etc.
        const seek_rect = seek_bar.getBoundingClientRect();
        const fraction = Math.max(0, Math.min((e.clientX - seek_rect.x) / seek_rect.width, 1));
        seek_time_target = fraction * audio_element.duration;
        setCurrentTimeDisplay(seek_time_target);
    }
    seek_bar_event_target.addEventListener("pointerdown", seek);
    document.addEventListener("pointermove", e => {
        if (player.classList.contains("seeking")) {
            seek(e);
            e.preventDefault();
        }
    });
    document.addEventListener("pointerup", e => {
        if (player.classList.contains("seeking")) {
            audio_element.currentTime = seek_time_target;
            player.classList.remove("seeking");
            document.body.style.userSelect = "initial";
        } 
    });
});