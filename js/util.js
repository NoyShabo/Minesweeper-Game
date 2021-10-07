'use strict';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function startTimer() {
    var startTime = Date.now();
    gTimeInterval = setInterval(() => {
        var millis = Date.now() - startTime;
        gGame.secsPassed = Math.floor(millis / 1000);
        document.querySelector('.timer span').innerText = gGame.secsPassed;
    }, 1000);
}

function playMusic() {
    var elMusic = document.querySelector('.music');
    if (!gMusic.musicOn) {
        gMusic.song.play();
        gMusic.musicOn = true;
        elMusic.style.animationPlayState = 'running';
    } else {
        gMusic.song.pause();
        gMusic.musicOn = false;
        elMusic.style.animationPlayState = 'paused';
    }
}