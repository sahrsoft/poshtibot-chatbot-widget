(() => {
  try {
    // Prefer global config (WordPress plugin style)
    const globalConfig = window.POSHTIBOT_CONFIG || {}

    // Fallback to script attributes
    const script = document.currentScript
    const chatbotId =
      globalConfig.chatbotId ||
      (script && script.getAttribute("data-chatbot-id"))

    if (!chatbotId) {
      console.error("Poshtibot: chatbotId is missing")
      return
    }

    // Create iframe
    const iframe = document.createElement("iframe")

    iframe.src = `https://widget.poshtibot.com/widget?chatbot_id=${chatbotId}`

    iframe.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 380px;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      z-index: 9999;
    `

    iframe.id = "poshtibot-widget-frame"

    document.body.appendChild(iframe)

  } catch (err) {
    console.error("Poshtibot widget error:", err)
  }
})()