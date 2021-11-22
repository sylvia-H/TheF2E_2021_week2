// 首頁 lottie 動畫圖
const logoBike = lottie.loadAnimation({
    wrapper: lottie_youbike,
    animType: 'svg',
    loop: true,
    autoplay: true,
    path: './assets/images/youbike.json'
});

logoBike.play();

// bodymovin.loadAnimation({
//     container: document.getElementById('lottie_youbike'), // Required
//     path: './assets/images/youbike.json', // Required
//     renderer: 'svg', // Required
//     loop: true,
//     autoplay: true
// })