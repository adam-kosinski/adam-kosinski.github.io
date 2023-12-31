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




function updateVisualizationCanvasDimensions(){
    document.querySelectorAll(".visualization_canvas").forEach(canvas => {
        // make canvas pixels twice as small as css pixels for better resolution
        canvas.width = 2 * canvas.getBoundingClientRect().width;
        canvas.height = 2 * canvas.getBoundingClientRect().height;
    });
}
window.addEventListener("resize", updateVisualizationCanvasDimensions);




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

    const audio_element = new Audio();
    audio_element.preload = "metadata";
    audio_element.src = player.dataset.audioSrc;
    player.append(audio_element); // easier to implement pause all audio function

    const visualization_canvas = player.querySelector(".visualization_canvas");

    // declare audio context variables, we will initialize after user interaction to avoid warning
    let context;
    let analyser;
    let frequency_data;
    let exp_coef; // exp_coef * exp_base ^ x_norm (where x_norm = x/canvas.width belongs to [0,1]) maps to the frequency plotted at that x
    let exp_base;
    // we use x_norm instead of x, because the canvas width might change and I don't want to refit the exponential function

    // visualization config
    const low_hz_bound = 5; // x = 0 will map to this hz
    const high_hz_bound = 2000; // x = canvas width will map to this hz
    const baseline_px = 4; // when amplitude is zero, still show some height to guarantee a solid stroke / fill
    const top_clearance_px = 2; // so the stroke doesn't clip the canvas top

    const initAudioContext = function () {
        context = new AudioContext();

        analyser = context.createAnalyser();
        analyser.fftSize = 8192;
        frequency_data = new Uint8Array(analyser.frequencyBinCount);

        // calculate exp_coef and exp_base, we want:
        // exp_coef * (exp_base ^ 0) = low_hz_bound
        // exp_coef * (exp_base ^ 1) = high_hz_bound
        exp_coef = low_hz_bound;
        exp_base = high_hz_bound / exp_coef;

        const track = context.createMediaElementSource(audio_element);
        track.connect(analyser);
        analyser.connect(context.destination);
    }

    const visualize = function () {
        requestAnimationFrame(visualize);
        if (!frequency_data) return;

        analyser.getByteFrequencyData(frequency_data);

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
            const y = (ctx.canvas.height - baseline_px) - amplitude_fraction**1.5 * (ctx.canvas.height - baseline_px - top_clearance_px);
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
    visualize();

    // play button triggers audio
    const play_button = player.querySelector(".play_pause");
    play_button.addEventListener("click", e => {
        if (!context) initAudioContext();

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
        seek_bar.style.borderLeftWidth = 0; // hack so that getBoundingClientRect() works on shrinking window resize (remove border briefly so that width can be calculated by the browser correctly)
        const fraction = time / audio_element.duration;
        seek_bar.style.borderLeftWidth = fraction * seek_bar.getBoundingClientRect().width + "px";
    }
    audio_element.addEventListener("timeupdate", e => {
        if (player.classList.contains("seeking")) return;
        setCurrentTimeDisplay(audio_element.currentTime);
    });
    window.addEventListener("resize", e => { setCurrentTimeDisplay(audio_element.currentTime); });

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

updateVisualizationCanvasDimensions();