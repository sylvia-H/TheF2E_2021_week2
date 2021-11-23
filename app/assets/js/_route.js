
// 取得使用者目前所在位置、載入地圖圖資、標記當前位置
// 判斷當前頁面導入適當功能
function getCurrentPos_route(){
  
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
      routeMap.setView([pos_lat,pos_lng], 16);
      // let routeMap = L.map('map_show', {
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
      }).addTo(routeMap);
  
      // 目前所在位置 GPS 圖示內容
      let posGPSIcon = L.divIcon({
          iconSize: [70,70],
          html: `<div id="lottie_GPS"></div>`
      });
  
      // 在地圖上標記所在位置 GPS 圖示
      L.marker([pos_lat,pos_lng], {icon: posGPSIcon}).addTo(routeMap);
  
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

let cityRoute = [];
function get_cityRoute(city){
  const endpoint = `https://ptx.transportdata.tw/MOTC/v2/Cycling/Shape/${city}`;

  axios.get(endpoint,
    {
      headers: getAuthorizationHeader()
    })
  .then(response => {
    cityRoute = response.data;
    console.log(cityRoute);
    let str = '<option selected>選擇路線</option>';
    cityRoute.forEach(el => {
      str += `<option value="${el.RouteName}">${el.RouteName}</option>`
    })
    select_route.innerHTML = str;
  })
  .catch(err => console.log(err));

}

function get_Route(route){

    if(routeLayer) {
      routeMap.removeLayer(routeLayer);
    }
    
    cityRoute.forEach(el => {
      if (el.RouteName === route) {
        const geo = el.Geometry;
        polyLine(geo);
      }
    });

}


// 畫出自行車的路線
let routeLayer = null;

function polyLine(geoData) {
  // 建立 wkt 的實體
  const wicket = new Wkt.Wkt();
  const geojsonFeature = wicket.read(geoData).toJson();
  console.log(geojsonFeature.coordinates[0][0]);
  // 預設樣式
  const path = {
    "color": "#44CCFF",
    "weight": 16,
    "opacity": 0.65
  };
  const routeLayer = L.geoJSON(geojsonFeature, {
    style: path
  }).addTo(routeMap);

  routeLayer.addData(geojsonFeature);
  routeMap.fitBounds(routeLayer.getBounds());

}
