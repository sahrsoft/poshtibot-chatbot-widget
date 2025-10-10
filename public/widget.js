(function () {
  const script = document.currentScript;
  const appId = script.getAttribute("data-app-id");
  const primaryColor = script.getAttribute("data-primary-color") || "#0078FF";
  const labelText = script.getAttribute("data-label-text") || "Ask here";

  const iframe = document.createElement("iframe");
  iframe.src = `https://widget.poshtibot.com/widget?app_id=${appId}&primary_color=${encodeURIComponent(primaryColor)}&label_text=${encodeURIComponent(labelText)}`;
  iframe.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    border: none;
    z-index: 9999;
  `;
  document.body.appendChild(iframe);
})();
