{
  const script = document.currentScript
  const chatbotId = script.getAttribute("data-chatbot-id")

  const iframe = document.createElement("iframe")
  iframe.src = `https://widget.poshtibot.com/widget?chatbot_id=${chatbotId}`
  iframe.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    border: none;
    z-index: 9999;
  `
  document.body.appendChild(iframe)
}