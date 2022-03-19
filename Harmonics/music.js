const synth = new Tone.Synth().Destination();
const now = Tone.now();
synth.triggerAttackRelease("C4", now + 1);

document.getElementById("play-button").addEventListener("click", function(){
  
});
