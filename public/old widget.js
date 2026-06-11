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

    let mode = script && script.getAttribute("data-chatbot-id")

    if (!mode) mode = "full"

    // Check if we should start closed (bubble mode)
    const startClosed = globalConfig.startClosed !== false // Default: true

    // Create container
    const container = document.createElement('div')
    container.id = "poshtibot-container"
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    `

    // Create iframe
    const iframe = document.createElement("iframe")
    iframe.id = "poshtibot-widget-frame"
    iframe.src = `https://widget.poshtibot.com/widget?chatbot_id=${chatbotId}&mode=${mode}`
    iframe.style.cssText = `
      border: none;
      transition: all 0.3s ease;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      cursor: pointer;
    `
    iframe.allow = "microphone; camera"

    if (startClosed) {
      // Start as bubble (closed)
      iframe.style.width = "70px"
      iframe.style.height = "70px"
      iframe.style.borderRadius = "50%"

      let isOpen = false

      // Toggle on click
      iframe.addEventListener('click', (e) => {
        e.stopPropagation()
        if (!isOpen) {
          // Open widget
          iframe.style.width = "380px"
          iframe.style.height = "600px"
          iframe.style.borderRadius = "12px"
          isOpen = true
        } else {
          // Close widget
          iframe.style.width = "70px"
          iframe.style.height = "70px"
          iframe.style.borderRadius = "50%"
          isOpen = false
        }
      })

      // Optional: Close when clicking outside
      document.addEventListener('click', (e) => {
        if (isOpen && !container.contains(e.target)) {
          iframe.style.width = "70px"
          iframe.style.height = "70px"
          iframe.style.borderRadius = "50%"
          isOpen = false
        }
      })
    } else {
      // Start open
      iframe.style.width = "380px"
      iframe.style.height = "600px"
      iframe.style.borderRadius = "12px"
    }

    container.appendChild(iframe)
    document.body.appendChild(container)

  } catch (err) {
    console.error("Poshtibot widget error:", err)
  }
})()