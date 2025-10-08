(async function() {
  const appId = document.currentScript.getAttribute("data-app-id");

  const theme = searchParams?.theme ? JSON.parse(searchParams.theme) : {};

  // 1️⃣ Fetch configuration from Frappe
  let config = {};
  try {
    const res = await fetch(
      `https://server.poshtibot.com/api/method/poshtibot.api.get_widget_config?app_id=${appId}`
    );
    const data = await res.json();
    config = data?.message || {};
  } catch (e) {
    console.warn("Using default config", e);
    config = {
      primary_color: "#007bff",
      label_text: "Ask here",
      font_family: "sans-serif",
      logo_url: "",
      animation_duration: 300,
      widget_position: "right-bottom"
    };
  }

  // 2️⃣ Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = `https://widget.poshtibot.com/widget-frame?app_id=${appId}&theme=${encodeURIComponent(JSON.stringify(config))}`;
  iframe.style.position = "fixed";
  iframe.style.width = "400px";
  iframe.style.height = "600px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.transition = `all ${config.animation_duration}ms ease`;
  iframe.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  iframe.style.zIndex = "9999";
  iframe.style.opacity = "0";
  iframe.style.transform = "scale(0)";
  iframe.style.pointerEvents = "none";

  if (config.widget_position === "left-bottom") {
    iframe.style.left = "20px";
    iframe.style.bottom = "80px";
  } else {
    iframe.style.right = "20px";
    iframe.style.bottom = "80px";
  }

  // 3️⃣ Create button
  const button = document.createElement("div");
  button.style.cssText = `
    position:fixed;
    ${config.widget_position === "left-bottom" ? "left:20px" : "right:20px"};
    bottom:20px;
    width:60px;
    height:60px;
    background:${config.primary_color};
    color:white;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    z-index:9999;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
    font-size:26px;
  `;
  button.innerHTML = config.logo_url
    ? `<img src="https://server.poshtibot.com${config.logo_url}" style="width:60%;height:60%;object-fit:contain;border-radius:50%;" />`
    : "💬";

  // 4️⃣ Create label
  const label = document.createElement("div");
  label.innerText = config.label_text || "Ask here";
  label.style.cssText = `
    position:fixed;
    ${config.widget_position === "left-bottom" ? "left:90px" : "right:90px"};
    bottom:35px;
    background:${config.primary_color};
    color:white;
    font-family:${config.font_family};
    padding:6px 10px;
    border-radius:8px;
    font-size:14px;
    opacity:1;
    transition:opacity 0.3s ease;
  `;

  // 5️⃣ Animation logic
  let isOpen = false;
  button.addEventListener("click", () => {
    if (!isOpen) {
      iframe.style.opacity = "1";
      iframe.style.transform = "scale(1)";
      iframe.style.pointerEvents = "auto";
      label.style.opacity = "0";
      isOpen = true;
    } else {
      iframe.style.opacity = "0";
      iframe.style.transform = "scale(0)";
      iframe.style.pointerEvents = "none";
      label.style.opacity = "1";
      isOpen = false;
    }
  });

  document.body.appendChild(button);
  document.body.appendChild(label);
  document.body.appendChild(iframe);
})();
