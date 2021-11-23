
// 取得使用者目前所在位置、載入地圖圖資、標記當前位置
// 判斷當前頁面導入適當功能
function getCurrentPos_spot(){
  
    // 先判斷使用者裝置是否有 navigator.geolocation 功能，並執行之
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(success, error);
        // navigator.geolocation.watchPosition(success, error);
      } else {
        // 若出現錯誤，先自動將定位定在台北市中心
        pos_lat = 25.04;
        pos_lng = 121.54;
        alert('您的裝置不支援地理位置功能');
      }
    
    // fun：錯誤訊息處理
    function error(error){
      // 若出現錯誤，先自動將定位定在台北市中心
      pos_lat = 25.04;
      pos_lng = 121.54;
      // 各種錯誤碼類型
      switch(error.code)  {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
  
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
  
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
  
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
      }
    }
  
    // fun：成功執行
    function success(pos){
      // 獲取目前位置經緯度
      pos_lat = pos.coords.latitude;
      pos_lng = pos.coords.longitude;
      console.log(pos.coords.latitude,pos.coords.longitude);
  
      // 設定地圖：以當前座標為中心點
      spotMap.setView([pos_lat,pos_lng], 16);
      // let spotMap = L.map('map_show', {
      //     center: [pos_lat,pos_lng],
      //     zoom: 16
      // })
  
      // 載入圖磚
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 19,
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: 'pk.eyJ1Ijoic3lsdmlhaC10dyIsImEiOiJja3c2Nzl2eHUweXlmMnFtZTRjb2VjcDQxIn0.Gx5M_zr8rDs4T-jawF2UDQ'
      }).addTo(spotMap);
  
      // 目前所在位置 GPS 圖示內容
      let posGPSIcon = L.divIcon({
          iconSize: [70,70],
          html: `<div id="lottie_GPS"></div>`
      });
  
      // 在地圖上標記所在位置 GPS 圖示
      L.marker([pos_lat,pos_lng], {icon: posGPSIcon}).addTo(spotMap);
  
      // 顯示所在位置 GPS 圖示 lottie 動畫
      const gpsYoubike = lottie.loadAnimation({
      wrapper: lottie_GPS,
      animType: 'svg',
      loop: true,
      autoplay: false,
      path: './assets/images/youbike_GPS.json'
      });
      gpsYoubike.play();
  
      // 取得附近站點資訊
    //   get_nearbyStation(pos_lat,pos_lng);
  
    }
  
}
  