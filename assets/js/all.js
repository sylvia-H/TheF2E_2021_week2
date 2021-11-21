"use strict";

var pos_latitude = 25.04;
var pos_longitude = 121.54;
var bikeMap; // 取得附近一公里內 30 筆站點資訊

function getBikeStation_nearby() {
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
        html: "\n          <div class=\"lendIcon\">\n            <img src=\"https://i.imgur.com/FlALjW8.png\"/>\n            <div class=\"bikeNum\">\n              <span class=\"".concat(el.StationUID, "\">55</span>\n            </div>\n          </div")
      }); // popUp 內容

      var popUpContent = "\n          ".concat(stationName, "<br>\n          \u7AD9\u9EDE\u8ECA\u8F1B\u7E3D\u6578:").concat(el.BikesCapacity, "<br>\n          \u7AD9\u9EDE\u5730\u5740:").concat(el.StationAddress.Zh_tw, "<br>\n          <a target=\"_blank\" href=\"https://www.google.com/maps/search/?api=1&map_action=map&zoom=16&query=(").concat(el.StationAddress.Zh_tw, ")\">\n          \u4F7F\u7528 GoogleMap \u5C0E\u822A\n          </a>"); // 標記站點 icon & 為站點綁上 popUp 彈跳視窗

      L.marker([lat, lon], {
        icon: lendIcon
      }).addTo(bikeMap).bindPopup().setPopupContent(popUpContent); // 用 StationUID 查詢站點借還車輛資訊

      getBikeStation_nearby2(el.StationUID);
    });
  })["catch"](function (error) {
    console.log(error);
  });
} // 取得附近一公里內 30 筆站點資訊:含借還車輛數量資訊


function getBikeStation_nearby2(StationUID) {
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
}

function init() {
  console.log("pos_latitude\uFF1A".concat(pos_latitude));
  console.log("pos_longitude\uFF1A".concat(pos_longitude));
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
  }).addTo(bikeMap); // 目前所在位置 GPS 圖示

  var posGpsIcon = L.divIcon({
    iconSize: [60, 60],
    html: "<div id=\"lottie_youbike_GPS\"></div>"
  }); // 標記 icon

  var marker = L.marker([pos_latitude, pos_longitude]).addTo(bikeMap); // 標記附近站點

  getBikeStation_nearby();
} // 初始渲染：取得目前所在位置經緯度座標


window.onload = getPosition(); // 初始渲染：延遲執行地圖載入

setTimeout(init, 500);
"use strict";

var logoYoubike = lottie.loadAnimation({
  wrapper: lottie_youbike,
  animType: 'svg',
  loop: true,
  autoplay: false,
  path: './assets/images/youbike.json'
});
logoYoubike.play();
var gpsYoubike = lottie.loadAnimation({
  wrapper: lottie_youbike_GPS,
  animType: 'svg',
  loop: true,
  autoplay: false,
  path: './assets/images/youbike_GPS.json'
});
gpsYoubike.play();
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
