"use strict";

var pos_latitude;
var pos_longitude;
var bikeMap; // 取得附近一公里內 30 筆站點資訊:在地圖上呈現 lend 租車標記 icon

function getBikeStation_nearby_lend() {
  var endpoint = "https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$top=30&$spatialFilter=nearby(".concat(pos_latitude, ",").concat(pos_longitude, ",1000)&$format=JSON");
  axios.get(endpoint, {
    headers: getAuthorizationHeader()
  }).then(function (response) {
    var thisData = response.data;
    thisData.forEach(function (el) {
      var lat;
      var lon;
      var stationName = "";

      if (el.StationPosition.PositionLat) {
        lat = el.StationPosition.PositionLat;
      } else {
        lat = pos_latitude;
      }

      if (el.StationPosition.PositionLon) {
        lon = el.StationPosition.PositionLon;
      } else {
        lon = pos_longitude;
      }

      if (el.StationName) {
        stationName = el.StationName.Zh_tw;
      } else {
        stationName = "";
      }

      console.log(el.StationUID);
      console.log("lat:".concat(lat, ",lon:").concat(lon, ",stationName:").concat(stationName)); // 站點圖示

      var lendIcon = L.divIcon({
        iconSize: [0, 0],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        html: "\n          <div class=\"lendIcon\">\n            <img src=\"https://i.imgur.com/FlALjW8.png\"/>\n            <div class=\"bikeNum\">\n              <span class=\"".concat(el.StationUID, "\"></span>\n            </div>\n          </div")
      }); // popUp 內容

      var popUpContent = "\n          <p class=\"fz-5 fw-bold my-4\">".concat(stationName, "</p>\n          <a class=\"badge rounded-pill bg-blue text-white py-1 px-2 mb-2\" href=\"https://www.google.com/maps/search/?api=1&map_action=map&zoom=16&query=(").concat(el.StationAddress.Zh_tw, ")\">\n            \u4F7F\u7528 GoogleMap \u5C0E\u822A\n          </a>\n          <div class=\"row d-flex\">\n            <div class=\"col-6 py-3 fz-3 fw-bold text-center\">\n              \u53EF\u501F\u8ECA\u8F1B\n              <p id=\"").concat(el.StationUID, "_RentBikes\" class=\"fz-10 fw-bold text-success m-0\"></p>\n            </div>\n            <div class=\"col-6 py-3 fz-3 fw-bold text-center\">\n              \u53EF\u505C\u7A7A\u4F4D\n              <p id=\"").concat(el.StationUID, "_ReturnBikes\" class=\"fz-10 fw-bold text-warning m-0\"></p>\n            </div>\n          </div>"); // 標記站點 icon & 為站點綁上 popUp 彈跳視窗

      L.marker([lat, lon], {
        icon: lendIcon
      }).addTo(bikeMap).bindPopup().setPopupContent(popUpContent); // 用 StationUID 查詢站點借還車輛資訊

      getBikeStation_nearby2_lend(el.StationUID);
    });
  })["catch"](function (error) {
    console.log(error);
  });
} // 取得附近一公里內 30 筆站點資訊:在 icon 上標記 lend 可借車輛數量


function getBikeStation_nearby2_lend(StationUID) {
  var endpoint = "https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$top=30&$spatialFilter=nearby(".concat(pos_latitude, ",").concat(pos_longitude, ",1000)&$format=JSON");
  axios.get(endpoint, {
    headers: getAuthorizationHeader()
  }).then(function (response) {
    var thisData = response.data;
    var targetStation = thisData.filter(function (el) {
      return el.StationUID === StationUID;
    });
    var stationIcon = document.querySelector(".".concat(StationUID));
    stationIcon.innerHTML = targetStation[0].AvailableRentBikes;
    console.log(targetStation[0]);
    console.log("\u53EF\u501F\u6578\u91CF\uFF1A".concat(targetStation[0].AvailableRentBikes));
    console.log("\u9084\u8ECA\u7A7A\u4F4D\uFF1A".concat(targetStation[0].AvailableReturnBikes));
  })["catch"](function (error) {
    console.log(error);
  });
} // 點擊 popUp：呈現借還車輛數量資訊


function getBikeStation_nearby2_popUp(StationUID) {
  var endpoint = "https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$top=30&$spatialFilter=nearby(".concat(pos_latitude, ",").concat(pos_longitude, ",1000)&$format=JSON");
  axios.get(endpoint, {
    headers: getAuthorizationHeader()
  }).then(function (response) {
    var thisData = response.data;
    var targetStation = thisData.filter(function (el) {
      return el.StationUID === StationUID;
    });
    var stationIcon = document.querySelector(".".concat(StationUID));
    var stationRentBikes = document.getElementById("".concat(StationUID, "_RentBikes"));
    var stationReturnBikes = document.getElementById("".concat(StationUID, "_ReturnBikes"));
    stationIcon.innerHTML = targetStation[0].AvailableRentBikes;
    stationRentBikes.innerHTML = targetStation[0].AvailableRentBikes;
    stationReturnBikes.innerHTML = targetStation[0].AvailableReturnBikes;
    console.log(stationIcon);
    console.log(targetStation[0]);
    console.log("\u53EF\u501F\u6578\u91CF\uFF1A".concat(targetStation[0].AvailableRentBikes));
    console.log("\u9084\u8ECA\u7A7A\u4F4D\uFF1A".concat(targetStation[0].AvailableReturnBikes));
  })["catch"](function (error) {
    console.log(error);
  });
} // 取得使用者所在位置


function getPosition() {
  // 錯誤訊息處理
  function error(error) {
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
  }

  function success(pos) {
    pos_latitude = pos.coords.latitude;
    pos_longitude = pos.coords.longitude;
    console.log("Accuracy\uFF1A".concat(pos.coords.accuracy));
    console.log(pos.coords.latitude, pos.coords.longitude);
  }

  if (navigator.geolocation) {
    // navigator.geolocation.getCurrentPosition(success, error);
    navigator.geolocation.watchPosition(success, error);
  } else {
    alert('您的裝置不支援地理位置功能');
  }
} // Bike 頁面：初始化渲染／呈現地圖圖資／標記 GPS 圖示／標記附近站點


function bike_init() {
  console.log("pos_latitude\uFF1A".concat(pos_latitude));
  console.log("pos_longitude\uFF1A".concat(pos_longitude)); // 呈現地圖圖資

  bikeMap = L.map('bikeMap_show', {
    center: [pos_latitude, pos_longitude],
    zoom: 15
  }).setView([pos_latitude, pos_longitude], 15);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoic3lsdmlhaC10dyIsImEiOiJja3c2Nzl2eHUweXlmMnFtZTRjb2VjcDQxIn0.Gx5M_zr8rDs4T-jawF2UDQ'
  }).addTo(bikeMap); // 目前所在位置 GPS 圖示內容

  var posGpsIcon = L.divIcon({
    iconSize: [70, 70],
    html: "<div id=\"lottie_GPS\"></div>"
  }); // 在地圖上標記所在位置 GPS 圖示

  L.marker([pos_latitude, pos_longitude], {
    icon: posGpsIcon
  }).addTo(bikeMap); // 顯示所在位置 GPS 圖示 lottie 動畫

  var gpsYoubike = lottie.loadAnimation({
    wrapper: lottie_GPS,
    animType: 'svg',
    loop: true,
    autoplay: false,
    path: './assets/images/youbike_GPS.json'
  });
  gpsYoubike.play(); // 標記附近站點 - 可借車輛資訊

  getBikeStation_nearby_lend();
} // Bike 頁面初始渲染：取得目前所在位置經緯度座標


window.onload = getPosition(); // Bike 頁面初始渲染：延遲執行地圖載入

setTimeout(bike_init, 500);
"use strict";

var logoYoubike = lottie.loadAnimation({
  wrapper: lottie_youbike,
  animType: 'svg',
  loop: true,
  autoplay: false,
  path: './assets/images/youbike.json'
});
logoYoubike.play();
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
