// analyze
function lumos_analyzeAITraffic() {
  try {
    // --- 1) Referrer check ---
    var referrer = document.referrer.toLowerCase();
    var page = window.location.href;
    var fragment = window.location.href;
    var ai_platform = '';
    var referrerMatch = false;

    try {
      if (referrer.indexOf("chatgpt.") !== -1 || referrer.indexOf("openai.") !== -1) {
        ai_platform = 1;
        referrerMatch = true;
      } else if (referrer.indexOf("claude.") !== -1) {
        ai_platform = 2;
        referrerMatch = true;
      } else if (referrer.indexOf("copilot.microsoft.") !== -1) {
        ai_platform = 3;
        referrerMatch = true;
      } else if (referrer.indexOf("perplexity.") !== -1) {
        ai_platform = 4;
        referrerMatch = true;
      } else if (referrer.indexOf("bing.com/chat") !== -1) {
        ai_platform = 5;
        referrerMatch = true;
      } else if (referrer.indexOf("huggingface.") !== -1) {
        ai_platform = 6;
        referrerMatch = true;
      } else if (referrer.indexOf("cohere.ai") !== -1) {
        ai_platform = 7;
        referrerMatch = true;
      } else if (referrer.indexOf("brave.com") !== -1) {
        ai_platform = 8;
        referrerMatch = true;
      } else if (referrer.indexOf("you.com/") !== -1) {
        ai_platform = 9;
        referrerMatch = true;
      } else if (referrer.indexOf("studio.ai21.com") !== -1) {
        ai_platform = 10;
        referrerMatch = true;
      }
    } catch (e) {}
    // ai_platform 11 = Google AI Overview
    // 12 etc is at is browser detection

    // Detect AI browser
    try {
      var ua = navigator.userAgent.toLowerCase();
      if (ua.includes("chatgpt") || ua.includes("openai")) {
        ai_platform = 12; //"ChatGPT Browser";
      } else if (ua.includes("gptbot")) {
        ai_platform = 13; //"OpenAI GPTBot";
      } else if (ua.includes("brave")) {
        ai_platform = 14; //"Brave";
      } else if (ua.includes("you.com")) {
        ai_platform = 15; // "You.com";
      } else if (ua.includes("perplexity")) {
        ai_platform = 16; // "Perplexity AI";
      } else if (ua.includes("copilot")) {
        ai_platform = 17; //"Microsoft Copilot";
      } else if (ua.includes("arc-browser")) {
        ai_platform = 18;  //"Arc Browser";
      }
    } catch (e) {}

    // --- UTM arameter check ---
    try {
      function getQueryParam(name) {
        var regex = new RegExp("[?&]" + name + "=([^&#]*)", "i");
        var result = regex.exec(window.location.search);
        return result ? decodeURIComponent(result[1]) : null;
      }

      var utmSource = getQueryParam("utm_source");
      var utmSourceMatch = false;
      if (utmSource) {
        var lowerUtm = utmSource.toLowerCase();
        utmSourceMatch = lowerUtm.indexOf("chatgpt") !== -1 || lowerUtm.indexOf("openai.") !== -1;
      }
    } catch (e) {}

    // Extract text fragment AI Overview
    var fragment = '';
    try {
      var match = performance.getEntries()[0].name.match("#:~:text=(.*)");
      fragment = match && match[1] ? decodeURIComponent(match[1]) : '';
      if (fragment != '' && (!referrerMatch || referrer.indexOf("google.") !== -1)) {
        ai_platform = 11; // Google AI Overview if text fragment but no referer match of other AI
      }
    } catch (e) {}

    // --- 3) Robuuste AJAX GET functie ---
    function ajaxGet(url, successCallback, errorCallback) {
      var xhr;
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else {
        // Voor IE6
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var response = xhr.responseText;
            var parsed;
            try {
              parsed = JSON.parse(response);
            } catch (e) {
              parsed = response; // plain text fallback
            }
            if (successCallback) {
              successCallback(parsed);
            }
          } else {
            if (errorCallback) {
              errorCallback(xhr.status, xhr.statusText);
            }
          }
        }
      };

      xhr.open("GET", url, true);
      xhr.send();
    }

    // --- 4) Doe iets als er een match is ---
    if (referrerMatch || utmSourceMatch || fragment != '' || ai_platform > 0) {

      var sjL = document.querySelector('script[data-lumos-a]');
      var a = sjL.getAttribute('data-lumos-a');
      var p = sjL.getAttribute('data-lumos-p');

      // <script async src="https://cdn.smilejet.com/xxxx.js" data-lumos-a="1005fc6d7be6a0d4408a" data-lumos-p="" crossorigin="anonymous"></script>
      var params = "?referrer=" + encodeURIComponent(document.referrer) + "&utm_source=" + encodeURIComponent(utmSource || "");
        ajaxGet("https://lumos-traffic.rrg-vdsanden.workers.dev/collect?m=" + ai_platform + "&t=" + encodeURIComponent(fragment) + "&u=" + encodeURIComponent(page) + "&a="+ a +"&p="+ p +"&utm_s=" + encodeURIComponent(utmSource || "") + "&r=12&ref=" + encodeURIComponent(document.referrer) + "",
          function(response) {
            console.log("Server response:", response);
          },
          function(status, statusText) {
            console.error("AJAX fout:", status, statusText);
          }
        );
    }
  } catch (error) {
    console.error("Lumos, there were some problems analyzing AI traffic:", error);
  }
}

// init
(function() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", lumos_analyzeAITraffic);
  } else {
    lumos_analyzeAITraffic();
  }
})();
