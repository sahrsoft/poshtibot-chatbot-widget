(function () {
  if (window.PoshtibotLoaded) return;
  window.PoshtibotLoaded = true;

  const scriptTag = document.currentScript;
  const appId = scriptTag.getAttribute("data-app-id");

  const iframe = document.createElement("iframe");
  // iframe.src = `https://widget.poshtibot.com?app_id=${appId}`;
  iframe.src = `https://widget.poshtibot.com/widget?app_id=${appId}&primary_color=${encodeURIComponent(primaryColor)}&label_text=${encodeURIComponent(labelText)}`;
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "80px";
  iframe.style.height = "80px";
  iframe.style.border = "none";
  iframe.style.zIndex = "9999";
  iframe.allow = "cross-origin-isolated";

  document.body.appendChild(iframe);
})();
