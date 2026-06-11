(() => {

  const script = document.currentScript
  const chatbotId = script.getAttribute("data-chatbot-id")

  if (!chatbotId) {
    console.error("Poshtibot: chatbot-id is missing")
    return
  }

  // -----------------------------------
  // CREATE IFRAME
  // -----------------------------------

  const iframe = document.createElement("iframe")

  iframe.src =
    `https://widget.poshtibot.com/widget?chatbot_id=${chatbotId}`

  iframe.id = "poshtibot-widget-frame"

  iframe.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;

    width: 80px;
    height: 80px;

    border: none;
    background: transparent;

    z-index: 999999;

    overflow: hidden;

    transition:
      width 0.25s ease,
      height 0.25s ease;

    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
  `

  document.body.appendChild(iframe)

  // -----------------------------------
  // LISTEN FOR OPEN/CLOSE EVENTS
  // -----------------------------------

  window.addEventListener("message", (event) => {

    if (!event.data?.type) return

    // OPEN
    if (event.data.type === "OPEN_WIDGET") {

      if (window.innerWidth < 640) {

        iframe.style.width = "100vw"
        iframe.style.height = "100vh"

        iframe.style.right = "0"
        iframe.style.bottom = "0"

      } else {

        iframe.style.width = "380px"
        iframe.style.height = "700px"

      }
    }

    // CLOSE
    if (event.data.type === "CLOSE_WIDGET") {

      iframe.style.width = "80px"
      iframe.style.height = "80px"

      iframe.style.right = "24px"
      iframe.style.bottom = "24px"
    }
  })

  // -----------------------------------
  // OUTSIDE CLICK
  // -----------------------------------

  document.addEventListener("mousedown", function (event) {

    const rect = iframe.getBoundingClientRect()

    const clickedInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom

    if (!clickedInside) {

      iframe.contentWindow.postMessage(
        {
          type: "OUTSIDE_CLICK"
        },
        "*"
      )
    }
  })

})()