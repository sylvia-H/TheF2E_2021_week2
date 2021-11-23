"use strict";

// 全域變數
var pos_lat; // 緯度

var pos_lng; // 經度

var bikeMap = L.map('map_show').setView([25.04, 121.54], 16);
var height = window.innerHeight;
window.addEventListener('resize', function () {
  return height = window.innerHeight;
}); // 監聽目前欲查詢狀態：租車 or 還車

var isLendBike = true;
var RP_Switch = document.getElementById('switchRP');
var footer_rentSwitch = document.getElementById('footer_rentSwitch');
var footer_parkingSwitch = document.getElementById('footer_parkingSwitch');
RP_Switch.addEventListener('click', function () {
  if (switchRP.checked) {
    isLendBike = true;
    set_lendMarkers();
    bikeMap.removeLayer(returnLayer);
  } else {
    isLendBike = false;
    set_returnMarkers();
    bikeMap.removeLayer(lendLayer);
  }
});
footer_rentSwitch.addEventListener('click', function () {
  isLendBike = true;

  if (returnLayer) {
    set_lendMarkers();
    bikeMap.removeLayer(returnLayer);
  }

  ;
});
footer_parkingSwitch.addEventListener('click', function () {
  isLendBike = false;

  if (lendLayer) {
    set_returnMarkers();
    bikeMap.removeLayer(lendLayer);
  }

  ;
}); // markerCluster 合併標記點
// let lendMarkers;
// let returnMarkers;
// 頁面初始渲染：取得目前所在位置經緯度座標並標記

window.onload = getCurrentPos(); // 監聽"附近"圖示，重置當前位置

var gps_currentPos = document.querySelector('.gps_currentPos');
gps_currentPos.addEventListener('click', function () {
  if (pos_lat && pos_lng) {
    bikeMap.setView([pos_lat, pos_lng], 16);
  } else {
    window.opener.location.href = window.opener.location.href;
    window.opener.location.reload();
  }
}); // 取得使用者目前所在位置、載入地圖圖資、標記當前位置
// 判斷當前頁面導入適當功能

function getCurrentPos() {
  // 先判斷使用者裝置是否有 navigator.geolocation 功能，並執行之
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error); // navigator.geolocation.watchPosition(success, error);
  } else {
    // 若出現錯誤，先自動將定位定在台北市中心
    pos_lat = 25.04;
    pos_lng = 121.54;
    alert('您的裝置不支援地理位置功能');
  } // fun：錯誤訊息處理


  function error(error) {
    // 若出現錯誤，先自動將定位定在台北市中心
    pos_lat = 25.04;
    pos_lng = 121.54; // 各種錯誤碼類型

    switch (error.code) {
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
  } // fun：成功執行


  function success(pos) {
    // 獲取目前位置經緯度
    pos_lat = pos.coords.latitude;
    pos_lng = pos.coords.longitude;
    console.log(pos.coords.latitude, pos.coords.longitude); // 設定地圖：以當前座標為中心點

    bikeMap.setView([pos_lat, pos_lng], 16); // let bikeMap = L.map('map_show', {
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
    }).addTo(bikeMap); // 目前所在位置 GPS 圖示內容

    var posGPSIcon = L.divIcon({
      iconSize: [70, 70],
      html: "<div id=\"lottie_GPS\"></div>"
    }); // 在地圖上標記所在位置 GPS 圖示

    L.marker([pos_lat, pos_lng], {
      icon: posGPSIcon
    }).addTo(bikeMap); // 顯示所在位置 GPS 圖示 lottie 動畫

    var gpsYoubike = lottie.loadAnimation({
      wrapper: lottie_GPS,
      animType: 'svg',
      loop: true,
      autoplay: false,
      path: './assets/images/youbike_GPS.json'
    });
    gpsYoubike.play(); // 取得附近站點資訊

    get_nearbyStation(pos_lat, pos_lng);
  }
} // 取得站點資訊，並賦予到 sourceData


var sourceData = [];

function get_nearbyStation(lat, lng) {
  var endpoint = "https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$spatialFilter=nearby(".concat(lat, ",").concat(lng, ",1000)&$format=JSON");
  axios.get(endpoint, {
    headers: getAuthorizationHeader()
  }).then(function (response) {
    sourceData = response.data;
    get_nearbyAvailability(lat, lng);
  })["catch"](function (err) {
    return console.log(err);
  });
} // 取得站點進階資訊，並整合到 newData
// 判斷當前的 isLend 變數值，呈現不同的 marker


var newData = [];

function get_nearbyAvailability(lat, lng) {
  var endpoint = "https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$spatialFilter=nearby(".concat(lat, ",").concat(lng, ",1000)&$format=JSON");
  axios.get(endpoint, {
    headers: getAuthorizationHeader()
  }).then(function (response) {
    var availableData = response.data;
    sourceData.forEach(function (sourceItem) {
      availableData.forEach(function (newItem) {
        if (sourceItem.StationUID === newItem.StationUID) {
          newItem.StationName = sourceItem.StationName;
          newItem.StationAddress = sourceItem.StationAddress;
          newItem.StationPosition = sourceItem.StationPosition;
          newData.push(newItem);
        }
      });
    });
    set_lendMarkers();
  })["catch"](function (err) {
    return console.log(err);
  });
} // 標記租車站點與數量（黃色）


var lendLayer = null;

function set_lendMarkers() {
  // lendMarkers = new L.MarkerClusterGroup().addTo(bikeMap);
  newData.forEach(function (el) {
    // 站點圖示
    var lendIcon = L.divIcon({
      iconSize: [0, 0],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76],
      html: "\n      <div class=\"lendIcon\">\n        <img src=\"./assets/images/icons/stationMark_yellow.svg\"/>\n        <div class=\"bikeNum\">\n          <span>".concat(el.AvailableRentBikes, "</span>\n        </div>\n      </div")
    }); // 站點營運狀態判斷

    var stationStatus;
    var stationStatus_class;

    switch (el.ServiceStatus) {
      // [0:'停止營運',1:'正常營運',2:'暫停營運'] 
      case 0:
        stationStatus = '停止營運';
        stationStatus_class = 'bg-danger';
        break;

      case 1:
        stationStatus = '正常營運';
        stationStatus_class = 'bg-success';
        break;

      case 2:
        stationStatus = '暫停營運';
        stationStatus_class = 'bg-dark';
        break;
    } // popUp 內容


    var popUpContent = "\n      <p class=\"fz-5 fw-bold my-4 me-2\">".concat(el.StationName.Zh_tw, "</p>\n      <a class=\"rounded-pill bg-blue text-white py-2 px-3 mb-2\" href=\"https://www.google.com/maps/search/?api=1&map_action=map&zoom=16&query=(").concat(el.StationAddress.Zh_tw, ")\">\n        \u4F7F\u7528 GoogleMap \u5C0E\u822A\n      </a>\n      <span class=\"fz-3 badge py-2 px-2 ms-2 ").concat(stationStatus_class, "\">\n        ").concat(stationStatus, "\n      </span>\n      <div class=\"row d-flex\">\n        <div class=\"col-6 py-3 fz-3 fw-bold text-center\">\n          \u53EF\u501F\u8ECA\u8F1B\n          <p class=\"fz-10 fw-bold text-success m-0\">\n            ").concat(el.AvailableRentBikes, "\n          </p>\n        </div>\n        <div class=\"col-6 py-3 fz-3 fw-bold text-center\">\n          \u53EF\u505C\u7A7A\u4F4D\n          <p class=\"fz-10 fw-bold text-warning m-0\">\n            ").concat(el.AvailableReturnBikes, "\n          </p>\n        </div>\n      </div>");
    var lat = el.StationPosition.PositionLat;
    var lng = el.StationPosition.PositionLon; // 標記站點黃色 icon & 為站點綁上 popUp 彈跳視窗

    lendLayer = L.marker([lat, lng], {
      icon: lendIcon
    }).bindPopup().setPopupContent(popUpContent);
    lendLayer.addTo(bikeMap); // lendMarkers.addLayer(lendLayer);
  }); // bikeMap.addLayer(lendMarkers);
} // 標記還車站點與數量（黑色）


var returnLayer = null;

function set_returnMarkers() {
  // returnMarkers = new L.MarkerClusterGroup().addTo(bikeMap);
  newData.forEach(function (el) {
    // 站點圖示
    var returnIcon = L.divIcon({
      iconSize: [0, 0],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76],
      html: "\n      <div class=\"returnIcon\">\n        <img src=\"./assets/images/icons/stationMark_black.svg\"/>\n        <div class=\"bikeNum\">\n          <span class=\"text-primary\">".concat(el.AvailableReturnBikes, "</span>\n        </div>\n      </div")
    }); // 站點營運狀態判斷

    var stationStatus;
    var stationStatus_class;

    switch (el.ServiceStatus) {
      // [0:'停止營運',1:'正常營運',2:'暫停營運'] 
      case 0:
        stationStatus = '停止營運';
        stationStatus_class = 'bg-danger';
        break;

      case 1:
        stationStatus = '正常營運';
        stationStatus_class = 'bg-success';
        break;

      case 2:
        stationStatus = '暫停營運';
        stationStatus_class = 'bg-dark';
        break;
    } // popUp 內容


    var popUpContent = "\n      <p class=\"fz-5 fw-bold my-4 me-2\">".concat(el.StationName.Zh_tw, "</p>\n      <a class=\"rounded-pill bg-blue text-white py-2 px-3 mb-2\" href=\"https://www.google.com/maps/search/?api=1&map_action=map&zoom=16&query=(").concat(el.StationAddress.Zh_tw, ")\">\n        \u4F7F\u7528 GoogleMap \u5C0E\u822A\n      </a>\n      <span class=\"fz-3 badge py-2 px-2 ms-2 ").concat(stationStatus_class, "\">\n        ").concat(stationStatus, "\n      </span>\n      <div class=\"row d-flex\">\n        <div class=\"col-6 py-3 fz-3 fw-bold text-center\">\n          \u53EF\u501F\u8ECA\u8F1B\n          <p class=\"fz-10 fw-bold text-success m-0\">\n            ").concat(el.AvailableRentBikes, "\n          </p>\n        </div>\n        <div class=\"col-6 py-3 fz-3 fw-bold text-center\">\n          \u53EF\u505C\u7A7A\u4F4D\n          <p class=\"fz-10 fw-bold text-warning m-0\">\n            ").concat(el.AvailableReturnBikes, "\n          </p>\n        </div>\n      </div>");
    var lat = el.StationPosition.PositionLat;
    var lng = el.StationPosition.PositionLon; // 標記站點黃色 icon & 為站點綁上 popUp 彈跳視窗

    returnLayer = L.marker([lat, lng], {
      icon: returnIcon
    }).bindPopup().setPopupContent(popUpContent);
    returnLayer.addTo(bikeMap); // returnMarkers.addLayer(returnLayer);
  }); // bikeMap.addLayer(returnMarkers);
}
"use strict";
"use strict";

// header 驗證
function getAuthorizationHeader() {
  var AppID = '9eeb30e3588740618367a446631cbc3f';
  var AppKey = 'CKTwBadJd3_0_EdqiXE0kEg8fTw';
  var GMTString = new Date().toGMTString();
  var ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(AppKey, 'TEXT');
  ShaObj.update('x-date: ' + GMTString);
  var HMAC = ShaObj.getHMAC('B64');
  var Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';
  return {
    'Authorization': Authorization,
    'X-Date': GMTString
  };
}
//# sourceMappingURL=all.js.map
