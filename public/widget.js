(function () {
    const appId = document.currentScript.getAttribute("data-app-id")

    const iframe = document.createElement("iframe")
    iframe.src = "https://widget.poshtibot.com/widget-frame?app_id=" + appId
    iframe.style.position = "fixed"
    iframe.style.bottom = "80px"
    iframe.style.right = "20px"
    iframe.style.width = "400px"
    iframe.style.height = "600px"
    iframe.style.border = "none"
    iframe.style.borderRadius = "12px"
    iframe.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"
    iframe.style.zIndex = "9999"
    iframe.style.display = "none"

    const button = document.createElement("div")
    button.innerHTML = "💬"
    button.style.cssText = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:60px;
    height:60px;
    background:#007bff;
    color:white;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    z-index:9999;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  `

    button.addEventListener("click", () => {
        iframe.style.display = iframe.style.display === "none" ? "block" : "none"
    })

    document.body.appendChild(button)
    document.body.appendChild(iframe)
})()
