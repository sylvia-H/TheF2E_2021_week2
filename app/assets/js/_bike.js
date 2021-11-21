let pos_latitude;
let pos_longitude;
let bikeMap;
// 站點進階資訊
let bikeStation_lendData = [];

// 取得附近一公里內 30 筆站點資訊:在地圖上呈現 lend 租車標記 icon
function getBikeStation_nearby_Data(){
  const endpoint = `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$top=30&$spatialFilter=nearby(${pos_latitude},${pos_longitude},1000)&$format=JSON`;

  axios.get(endpoint,
     {
        headers: getAuthorizationHeader()
     })
    .then(function (response) {
      const thisData = response.data;
    
      thisData.forEach(el=>{
        let lat;
        let lon;
        let stationName = "";
        
        if(el.StationPosition.PositionLat) {
          lat = el.StationPosition.PositionLat;
        } else {
          lat = pos_latitude;
        }
        if(el.StationPosition.PositionLon) {
          lon = el.StationPosition.PositionLon;
        } else {
          lon = pos_longitude;
        }
        
        if(el.StationName) {
          stationName = el.StationName.Zh_tw;
        } else {
          stationName = "";
        }
        
        console.log(el.StationUID);
        console.log(`lat:${lat},lon:${lon},stationName:${stationName}`);
        
        // popUp 內容
        let popUpContent = `
          <p class="fz-5 fw-bold my-4 me-2">${stationName}</p>
          <a class="rounded-pill bg-blue text-white py-2 px-3 mb-2" href="https://www.google.com/maps/search/?api=1&map_action=map&zoom=16&query=(${el.StationAddress.Zh_tw})">
            使用 GoogleMap 導航
          </a>
          <span id="${el.StationUID}_status" class="fz-3 badge py-2 px-2 ms-2"></span>
          <div class="row d-flex">
            <div class="col-6 py-3 fz-3 fw-bold text-center">
              可借車輛
              <p id="${el.StationUID}_RentBikes" class="fz-10 fw-bold text-success m-0"></p>
            </div>
            <div class="col-6 py-3 fz-3 fw-bold text-center">
              可停空位
              <p id="${el.StationUID}_ReturnBikes" class="fz-10 fw-bold text-warning m-0"></p>
            </div>
          </div>`;
        
        // 站點圖示
        let lendIcon = L.divIcon({
          iconSize: [0,0],
          iconAnchor: [22, 94],
          popupAnchor: [-3, -76],
          html: `
          <div class="lendIcon">
            <img src="./assets/images/icons/stationMark_yellow.png"/>
            <div class="bikeNum">
              <span class="${el.StationUID}"></span>
            </div>
          </div`
        });

        // 標記站點黃色 icon & 為站點綁上 popUp 彈跳視窗
        L.marker([lat,lon], {icon: lendIcon})
        .addTo(bikeMap).bindPopup().setPopupContent(popUpContent);
        
        // 用 StationUID 查詢站點借還車輛資訊，並在 icon 上標記數量
        iconTag(el.StationUID);
        
      });

    })
    .catch(function (error) {
      console.log(error);
    }); 

}

// 取得附近一公里內 30 筆站點進階資訊
function getBikeStation_nearby2_Data(){
  const endpoint = `https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$top=30&$spatialFilter=nearby(${pos_latitude},${pos_longitude},1000)&$format=JSON`;
  axios.get(endpoint,
     {
        headers: getAuthorizationHeader()
     }
    )
    .then(function (response) {
      bikeStation_lendData = response.data;
    })
    .catch(function (error) {
      console.log(error);
    }); 
}


// 在 icon 上標記 lend 可借車輛數量
function iconTag(StationUID){
      const targetStation = bikeStation_lendData.filter(el=> el.StationUID === StationUID);
      const stationIcon = document.querySelector(`.${StationUID}`);
      if(isLendBike){
        stationIcon.innerHTML = targetStation[0].AvailableRentBikes;
      } else {
        stationIcon.innerHTML = targetStation[0].AvailableReturnBikes;
      }
      stationIcon.addEventListener('click',getBikeStation_nearby2_popUp);
}


// 點擊 popUp：呈現借還車輛數量資訊
function getBikeStation_nearby2_popUp(e){
  // 取點擊站點的 StationUID
  const StationUID = e.target.getAttribute('Class');

  // 延遲執行抓取 DOM 元素
  setTimeout(getNums,200);
  function getNums(){
    // 站點可借還車輛數量
    const rentBikes = document.getElementById(`${StationUID}_RentBikes`);
    const returnBikes = document.getElementById(`${StationUID}_ReturnBikes`);
    const targetStation = bikeStation_lendData.filter(el=> el.StationUID === StationUID);
    rentBikes.innerHTML = targetStation[0].AvailableRentBikes;
    returnBikes.innerHTML = targetStation[0].AvailableReturnBikes;
    // 站點營運狀態
    const stationStatus = document.getElementById(`${StationUID}_status`);
    switch (targetStation[0].ServiceStatus) {
      // [0:'停止營運',1:'正常營運',2:'暫停營運'] 
      case 0:
        stationStatus.innerText = '停止營運';
        stationStatus.classList.add('bg-danger');
        break;
      case 1:
        stationStatus.innerText = '正常營運';
        stationStatus.classList.add('bg-success');
        break;
      case 2:
        stationStatus.innerText = '暫停營運';
        stationStatus.classList.add('bg-dark');
        break;
    }
  }
}

// 取得使用者所在位置
function getPosition(){
  // 錯誤訊息處理
  function error(error){
    // 若出現錯誤，先自動將定位定在台北市中心
    pos_latitude = 25.04;
    pos_longitude = 121.54;
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

  function success(pos){
    pos_latitude = pos.coords.latitude;
    pos_longitude = pos.coords.longitude;
    console.log(pos.coords.latitude,pos.coords.longitude);
  }
  
  if(navigator.geolocation){
    // navigator.geolocation.getCurrentPosition(success, error);
    navigator.geolocation.watchPosition(success, error);
  } else {
    // 若出現錯誤，先自動將定位定在台北市中心
    pos_latitude = 25.04;
    pos_longitude = 121.54;
    alert('您的裝置不支援地理位置功能');
  }
}

// Bike 頁面：初始化渲染／呈現地圖圖資／標記 GPS 圖示／標記附近站點
function bike_init(){
  console.log(`pos_latitude：${pos_latitude}`);
  console.log(`pos_longitude：${pos_longitude}`);
  
  // 取得附近站點進階資訊
  getBikeStation_nearby2_Data();

  // 呈現地圖圖資
  bikeMap = L.map('bikeMap_show', {
      center: [pos_latitude,pos_longitude],
      zoom: 16
  }).setView([pos_latitude,pos_longitude], 16);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1Ijoic3lsdmlhaC10dyIsImEiOiJja3c2Nzl2eHUweXlmMnFtZTRjb2VjcDQxIn0.Gx5M_zr8rDs4T-jawF2UDQ'
  }).addTo(bikeMap);

  // 目前所在位置 GPS 圖示內容
  let posGpsIcon = L.divIcon({
      iconSize: [70,70],
      html: `<div id="lottie_GPS"></div>`
  });
  
  // 在地圖上標記所在位置 GPS 圖示
  L.marker([pos_latitude,pos_longitude], {icon: posGpsIcon}).addTo(bikeMap);

  // 顯示所在位置 GPS 圖示 lottie 動畫
  const gpsYoubike = lottie.loadAnimation({
    wrapper: lottie_GPS,
    animType: 'svg',
    loop: true,
    autoplay: false,
    path: './assets/images/youbike_GPS.json'
  });
  gpsYoubike.play();

  // 標記附近站點 - 可借車輛資訊
  getBikeStation_nearby_Data();

}

// Bike 頁面初始渲染：取得目前所在位置經緯度座標
window.onload = getPosition();

// Bike 頁面初始渲染：延遲執行地圖載入
setTimeout(bike_init, 800);

// 監聽目前欲查詢狀態：租車 or 還車
let isLendBike = true;

const nav_rentSwitch = document.getElementById('rentSwitch');
const nav_parkingSwitch = document.getElementById('parkingSwitch');
const footer_rentSwitch = document.getElementById('footer_rentSwitch');
const footer_parkingSwitch = document.getElementById('footer_parkingSwitch');

nav_rentSwitch.addEventListener('click',()=>{if(rentSwitch.checked) isLendBike = true;});
nav_parkingSwitch.addEventListener('click',()=>{if(parkingSwitch.checked) isLendBike = false;});
footer_rentSwitch.addEventListener('click',()=>{if(footer_rentSwitch.checked) isLendBike = true;});
footer_parkingSwitch.addEventListener('click',()=>{if(footer_parkingSwitch.checked) isLendBike = false;});
