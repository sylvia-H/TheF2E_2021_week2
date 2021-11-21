const logoYoubike = lottie.loadAnimation({
    wrapper: lottie_youbike,
    animType: 'svg',
    loop: true,
    autoplay: false,
    path: './assets/images/youbike.json'
});

logoYoubike.play();

const gpsYoubike = lottie.loadAnimation({
    wrapper: lottie_youbike_GPS,
    animType: 'svg',
    loop: true,
    autoplay: false,
    path: './assets/images/youbike_GPS.json'
});

gpsYoubike.play();
