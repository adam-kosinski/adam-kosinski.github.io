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




function updateVisualizationCanvasDimensions() {
    document.querySelectorAll(".visualization_canvas").forEach(canvas => {
        // make canvas pixels twice as small as css pixels for better resolution
        canvas.width = 2 * canvas.getBoundingClientRect().width;
        canvas.height = 2 * canvas.getBoundingClientRect().height;
    });
}
window.addEventListener("resize", updateVisualizationCanvasDimensions);




// loading and playing audio

let howls = []; // so we can pause them later
let most_recent_howl; // for media session plays/pauses

function pauseAllAudio() {
    howls.forEach(howl => howl.pause());
    document.querySelectorAll(".audio_player").forEach(player => {
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
        <div class="time_and_seek_top_row">
            <p class="time_display"><span class="current_time">0:00</span> / <span class="duration">0:00</span></p>
            <canvas class="visualization_canvas"></canvas>
        </div>
        <div class="seek_bar_event_target">
            <div class="seek_bar">
                <div class="seek_handle"></div>
            </div>
        </div>
    </div>`;

    const visualization_canvas = player.querySelector(".visualization_canvas");

    let howl = new Howl({
        src: [player.dataset.audioSrc],
        html5: true
    });
    howls.push(howl);

    let locked = true; // don't let howler update the display time until after unlocking, to preserve any initial seeks
    // see howler event listeners and display_loop for usage

    /*
    ANALYSER FOR VISUALIZATION
    To set up the visualizer, need to do some hacky bits because the {html5: true} option breaks
    just connecting an analyser to the Howler.masterGain node, and we need the html5 option
    for audio to play on iOS Safari.
    See github issue here: https://github.com/goldfire/howler.js/issues/874
    */
    const audio_source_node = Howler.ctx.createMediaElementSource(howl._sounds[0]._node);
    const analyser = Howler.ctx.createAnalyser();
    analyser.fftSize = 8192;
    audio_source_node.connect(analyser);
    analyser.connect(Howler.ctx.destination)
    const frequency_data = new Uint8Array(analyser.frequencyBinCount);

    // visualization config
    const low_hz_bound = 5; // x = 0 will map to this hz
    const high_hz_bound = 2000; // x = canvas width will map to this hz
    const baseline_px = 4; // when amplitude is zero, still show some height to guarantee a solid stroke / fill
    const top_clearance_px = 2; // so the stroke doesn't clip the canvas top

    // use an exponential function to scale the frequencies more sensibly
    // exp_coef * exp_base ^ x_norm (where x_norm = x/canvas.width belongs to [0,1]) maps to the frequency plotted at that x
    // we use x_norm instead of x, because the canvas width might change and I don't want to refit the exponential function
    // calculate exp_coef and exp_base, we want:
    // exp_coef * (exp_base ^ 0) = low_hz_bound
    // exp_coef * (exp_base ^ 1) = high_hz_bound
    const exp_coef = low_hz_bound;
    const exp_base = high_hz_bound / exp_coef;


    // play button triggers audio
    const play_button = player.querySelector(".play_pause");
    play_button.addEventListener("click", e => {
        if (player.classList.contains("playing")) {
            howl.pause();
        }
        else {
            pauseAllAudio();
            howl.play();
            most_recent_howl = howl;
        }
    });

    // update UI to match play/pause state (not always caused by a click, see media session handling below)
    howl.on("play", () => { player.classList.add("playing") });
    howl.on("pause", () => { player.classList.remove("playing") });
    howl.on("end", () => { player.classList.remove("playing") });


    // duration

    const seek_bar = player.querySelector(".seek_bar");
    howl.on("load", () => {
        player.querySelector(".duration").textContent = durationString(howl.duration());
    });
    const setCurrentTimeDisplay = function (time) {
        player.querySelector(".current_time").textContent = durationString(time);
        seek_bar.style.borderLeftWidth = 0; // hack so that getBoundingClientRect() works on shrinking window resize (remove border briefly so that width can be calculated by the browser correctly)
        const fraction = time / howl.duration();
        seek_bar.style.borderLeftWidth = fraction * seek_bar.getBoundingClientRect().width + "px";
    }
    window.addEventListener("resize", e => { setCurrentTimeDisplay(howl.seek()); });


    // seek

    let seek_time_target = 0; // store where we want to seek until we're done seeking, only then update audio's current time
    let seek = function (e) {
        player.classList.add("seeking");
        // use client coords to figure out position because offsetX is messed up by bigger event target, child elements, borders, translation, etc.
        const seek_rect = seek_bar.getBoundingClientRect();
        const fraction = Math.max(0, Math.min((e.clientX - seek_rect.x) / seek_rect.width, 1));
        seek_time_target = fraction * howl.duration();
        setCurrentTimeDisplay(seek_time_target);
    }
    player.querySelector(".seek_bar_event_target").addEventListener("pointerdown", seek);
    document.addEventListener("pointermove", e => {
        if (player.classList.contains("seeking")) {
            seek(e);
        }
    });
    document.addEventListener("pointerup", e => {
        if (player.classList.contains("seeking")) {
            howl.seek(seek_time_target);
            player.classList.remove("seeking");
        }
    });


    // dealing with howlerjs unlocking behavior
    howl.on("unlock", () => {
        locked = false;
        howl.seek(seek_time_target)
    });


    // display loop for animation and showing the current time
    const display_loop = function () {
        requestAnimationFrame(display_loop);

        if (!locked && !player.classList.contains("seeking")) {
            setCurrentTimeDisplay(howl.seek());
        }

        if (!frequency_data) return;

        analyser.getByteFrequencyData(frequency_data);
        // console.log(Math.max.apply(this, frequency_data))

        // draw a frame
        const ctx = visualization_canvas.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();

        let x = 0;
        let prev_freq_index;

        for (; x < ctx.canvas.width; x++) {

            const x_norm = x / ctx.canvas.width; // using x_norm instead of x because canvas width isn't guaranteed to stay the same
            const freq_index = Math.floor(exp_coef * (exp_base ** x_norm));

            if (freq_index < 0 || freq_index >= frequency_data.length) continue; // just in case
            if (prev_freq_index && freq_index == prev_freq_index) continue; //smoothing, don't add a new point if we don't have new info
            prev_freq_index = freq_index;

            const amplitude_fraction = frequency_data[freq_index] / 255;
            // raise amplitude (0-1) to a power to emphasize strong frequencies, and deemphasize quieter ones
            const y = (ctx.canvas.height - baseline_px) - amplitude_fraction ** 1.5 * (ctx.canvas.height - baseline_px - top_clearance_px);
            ctx.lineTo(x, y);
        }

        ctx.lineTo(x, ctx.canvas.height - baseline_px);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.stroke();

        //do baseline bit
        ctx.lineTo(x, ctx.canvas.height);
        ctx.lineTo(0, ctx.canvas.height);

        ctx.closePath();
        ctx.fillStyle = "#fff3";
        ctx.fill();
    }
    display_loop();
});

updateVisualizationCanvasDimensions();


// media session support (e.g. pressing my play/pause F4 key)

navigator.mediaSession.setActionHandler("play", () => {
    console.log("media session play");
    if (most_recent_howl) most_recent_howl.play();
});
navigator.mediaSession.setActionHandler("pause", () => {
    console.log("media session pause");
    pauseAllAudio();
});


// really hacky fix for safari iOS audio bugs caused by minimizing and reopening the page
// pause music manually when the app is closed / minimized to avoid music speed-up and pausing failures
// (bug where it will loop the last half second or so indefinitely when you pause)
document.addEventListener("visibilitychange", e => {
    if (/iPhone/.test(navigator.userAgent) && document.visibilityState != "visible") {
        pauseAllAudio();
    }
});