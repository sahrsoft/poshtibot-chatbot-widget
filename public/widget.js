;(async () => {
  const script = document.currentScript
  const chatbotId = script.getAttribute('data-chatbot-id')

  if (!chatbotId) {
    console.error('Poshtibot: chatbot-id is missing')
    return
  }

  let position = 'right'
  try {
    const res = await fetch(
      `https://server.poshtibot.com/api/method/poshtibot.api.get_widget_config?chatbot_id=${chatbotId}`
    )
    if (res.ok) {
      const data = await res.json()
      position = data.message.widget_config.widget_position || 'right'
    }
  } catch {
    // use default
  }

  const iframe = document.createElement('iframe')
  iframe.src = `https://widget.poshtibot.com/widget?chatbot_id=${chatbotId}`
  iframe.id = 'poshtibot-widget-frame'
  iframe.style.cssText = `
    position: fixed;
    bottom: 24px;
    ${position}: 24px;
    width: 80px;
    height: 80px;
    border: none;
    background: transparent;
    z-index: 999999;
    overflow: hidden;
    transition: width 0.25s ease, height 0.25s ease;
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
  `
  document.body.appendChild(iframe)

  window.addEventListener('message', (event) => {
    if (!event.data?.type) return

    if (event.data.type === 'OPEN_WIDGET') {
      if (window.innerWidth < 640) {
        iframe.style.width = '100vw'
        iframe.style.height = '100vh'
        iframe.style.bottom = '0'
        iframe.style[position] = '0'
      } else {
        iframe.style.width = '380px'
        iframe.style.height = '700px'
      }
    }

    if (event.data.type === 'CLOSE_WIDGET') {
      iframe.style.width = '80px'
      iframe.style.height = '80px'
      iframe.style.bottom = '24px'
      iframe.style[position] = '24px'
    }
  })

  document.addEventListener('mousedown', (event) => {
    const rect = iframe.getBoundingClientRect()
    const clickedInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom

    if (!clickedInside) {
      iframe.contentWindow.postMessage({ type: 'OUTSIDE_CLICK' }, '*')
    }
  })
})()
