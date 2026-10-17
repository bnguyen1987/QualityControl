// English / Spanish switch (same approach as Production Hub).
// The app is written in English. When Spanish is on, this swaps the text on screen
// (labels, buttons, messages, placeholders) using the word list below. Anything a person
// typed (inputs, notes) is never touched, and switching back to English restores the
// original text without reloading. Machine names and the machine/customer line are marked
// data-no-i18n so they always show exactly as entered.
(function () {
  "use strict";
  const LANG_KEY = "qc.lang";

  const ES = {
    // Header, tabs
    "Line QC Camera": "Cámara de Calidad",
    "GoldenWest · Ontario": "GoldenWest · Ontario",
    "Setup": "Configuración", "Inspect": "Inspección", "Log": "Registro", "Alerts": "Alertas",
    "Light / dark": "Claro / oscuro", "Switch light or dark": "Cambiar claro u oscuro",
    "Checking AI…": "Revisando IA…", "AI ready": "IA lista", "AI ready (Netlify)": "IA lista",
    "Enter access code": "Ingrese el código de acceso", "Wrong access code": "Código de acceso incorrecto",
    "Site not set up": "Sitio no configurado", "Offline": "Sin conexión",
    "Test mode — no AI key": "Modo de prueba — sin IA", "AI key looks wrong": "Clave de IA incorrecta",
    "AI key rejected": "Clave de IA rechazada", "AI out of credit": "IA sin crédito",
    "No machine set": "Sin máquina asignada",

    // Inspect
    "This run": "Esta corrida", "Inspected": "Inspeccionados", "Pass": "Pasa", "Check": "Revisar", "Fail": "Falla",
    "Last inspection": "Última inspección", "Nothing inspected yet.": "Nada inspeccionado todavía.",
    "This camera hasn't been set up yet.": "Esta cámara todavía no está configurada.",
    "Go to Setup": "Ir a Configuración",
    "Camera is off": "La cámara está apagada",
    "Mount the camera over the conveyor, then click Start camera.": "Monte la cámara sobre el transportador y haga clic en Encender cámara.",
    "Idle": "En espera", "Drag to draw the trigger zone": "Arrastre para dibujar la zona de disparo",
    "Start camera": "Encender cámara", "Stop camera": "Apagar cámara",
    "Start inspecting": "Empezar a inspeccionar", "Pause inspecting": "Pausar inspección",
    "Learn empty belt": "Aprender banda vacía", "Set trigger zone": "Marcar zona de disparo",
    "Inspect now": "Inspeccionar ahora", "Default camera": "Cámara predeterminada", "No camera found": "No se encontró cámara",
    "Triggering works best after you tap": "El disparo funciona mejor después de tocar",
    "with nothing in the yellow zone.": "sin nada en la zona amarilla.",
    "Live camera isn't available here. You can still inspect one product at a time:": "La cámara en vivo no está disponible aquí. Aún puede inspeccionar un producto a la vez:",
    "Take a photo to inspect": "Tomar foto para inspeccionar",
    "Waiting for product": "Esperando producto", "Product in view": "Producto a la vista",
    "Inspecting…": "Inspeccionando…", "Paused": "En pausa", "Product leaving": "Producto saliendo",
    "Reset counts": "Reiniciar conteos",

    // Verdicts
    "PASS": "PASA", "FAIL": "FALLA", "CHECK": "REVISAR", "UNCLEAR": "NO CLARO", "ERROR": "ERROR",
    "CAPTURED": "CAPTURADO", "CAMERA OFF": "CÁMARA APAGADA",
    "minor": "menor", "major": "mayor",

    // Setup
    "Set up this camera": "Configurar esta cámara",
    "Work through the steps in order. A step turns green when it's done. When a new order starts, only steps 2, 5 and 6 need updating.":
      "Siga los pasos en orden. Cada paso se pone verde cuando está listo. Cuando empieza una orden nueva, solo hay que actualizar los pasos 2, 5 y 6.",
    "Connect": "Conectar",
    "Enter the plant access code. Each computer needs it once.": "Ingrese el código de acceso de la planta. Cada computadora lo necesita una sola vez.",
    "Access code": "Código de acceso", "Connected": "Conectado",
    "Machine and job": "Máquina y trabajo", "Shows on every alarm and in the log.": "Aparece en cada alarma y en el registro.",
    "Machine": "Máquina", "Choose a machine…": "Elija una máquina…", "Other (type it in)": "Otra (escríbala)",
    "Type the machine name": "Escriba el nombre de la máquina",
    "Customer name": "Nombre del cliente", "e.g. ABC Produce": "ej. ABC Produce", "Order #": "Orden #", "e.g. 123456": "ej. 123456", "Quantity": "Cantidad", "e.g. 10000": "ej. 10000",
    "Camera": "Cámara",
    "Pick the USB camera, start it, and aim it so a whole product fits in the picture.": "Elija la cámara USB, enciéndala y apúntela para que el producto completo quepa en la imagen.",
    "Choose the camera from the list, then click": "Elija la cámara de la lista y haga clic en",
    ". Click": ". Haga clic en", "Allow": "Permitir", "if the browser asks.": "si el navegador lo pregunta.",
    "Mount it 2–4 ft above the belt, pointing straight down, with steady light and no glare.": "Móntela de 2 a 4 pies sobre la banda, apuntando hacia abajo, con luz constante y sin reflejos.",
    "Trigger zone and empty belt": "Zona de disparo y banda vacía",
    "Tells the camera when a product has arrived.": "Le indica a la cámara cuándo llegó un producto.",
    "Click": "Haga clic en", "and drag a box across the belt where each product fully shows.": "y arrastre un recuadro sobre la banda donde se vea cada producto completo.",
    "With nothing in the yellow box, click": "Sin nada en el recuadro amarillo, haga clic en",
    "Use the camera picture in step 3 for both.": "Use la imagen de la cámara del paso 3 para ambos.",
    "What to check": "Qué revisar", "The AI only looks for what's ticked here.": "La IA solo busca lo que esté marcado aquí.",
    "Print quality & registration": "Calidad de impresión y registro",
    "Smears, voids, missing print, off-register colors": "Manchas, huecos, impresión faltante, colores fuera de registro",
    "Ink color": "Color de tinta", "Color matches the good sample": "El color coincide con la muestra buena",
    "Slotting & scoring": "Ranurado y marcado", "Slots clean and in position, scores not cracked": "Ranuras limpias y en posición, dobleces sin cuarteaduras",
    "Die cutting": "Suaje", "Clean cuts, no hanging trim or ragged edges": "Cortes limpios, sin desperdicio colgando ni orillas rotas",
    "Glue joint": "Pegado", "Joint glued, even gap, no fishtail": "Unión pegada, separación pareja, sin cola de pescado",
    "Board damage": "Daño al cartón", "Crushed flute, tears, warp, water damage": "Flauta aplastada, rasgaduras, pandeo, daño por agua",
    "Bundle & strapping": "Bulto y fleje", "Straps present, bundle square and even": "Flejes presentes, bulto cuadrado y parejo",
    "Load tag": "Etiqueta de carga", "Tag present and readable": "Etiqueta presente y legible",
    "Job notes for the inspector": "Notas del trabajo para el inspector",
    "Optional. Anything a new operator would need to know: logo color, text that must appear, which panel faces up.":
      "Opcional. Lo que un operador nuevo necesitaría saber: color del logo, texto que debe aparecer, qué panel va hacia arriba.",
    "e.g. Logo is red on the long panels. 'FRAGILE' must print on both end panels.": "ej. El logo es rojo en los paneles largos. 'FRÁGIL' debe imprimirse en ambos paneles de los extremos.",
    "Good sample": "Muestra buena",
    "A photo of an approved product. The AI compares every product against it. Retake it on every job change.":
      "Una foto de un producto aprobado. La IA compara cada producto contra ella. Vuelva a tomarla en cada cambio de trabajo.",
    "No sample yet": "Sin muestra todavía",
    "Put an approved product in the yellow zone, then take the photo.": "Ponga un producto aprobado en la zona amarilla y tome la foto.",
    "Take good sample now": "Tomar muestra buena ahora", "Upload photo": "Subir foto", "Remove": "Quitar",
    "Inspection settings": "Ajustes de inspección", "The defaults work for most lines. Adjust after a test run.": "Los valores predeterminados funcionan para la mayoría de las líneas. Ajuste después de una corrida de prueba.",
    "Inspection speed": "Velocidad de inspección",
    "Fast (about 1–3 s per product)": "Rápida (1–3 s por producto)", "Thorough (about 5–15 s per product)": "Detallada (5–15 s por producto)",
    "Inspect every": "Inspeccionar cada",
    "Every product": "Cada producto", "Every 2nd product": "Cada 2do producto", "Every 5th product": "Cada 5to producto",
    "Every 10th product": "Cada 10mo producto", "Every 25th product": "Cada 25vo producto", "Every 50th product": "Cada 50vo producto",
    "On fast lines, use a higher number so the AI can keep up.": "En líneas rápidas use un número mayor para que la IA alcance.",
    "Trigger sensitivity": "Sensibilidad del disparo",
    "Raise it if products are missed; lower it if one product triggers twice.": "Súbala si se pierden productos; bájela si un producto dispara dos veces.",
    "Photo delay after product enters": "Retraso de la foto después de que entra el producto",
    "Raise it if products are cut off at the edge of the photo.": "Súbalo si los productos salen cortados en la orilla de la foto.",
    "Start camera and inspecting automatically when this page opens (recommended on the machine PC)":
      "Encender la cámara e inspeccionar automáticamente al abrir esta página (recomendado en la PC de la máquina)",
    "Alarm": "Alarma", "Make sure the operator can hear it over the machine.": "Asegúrese de que el operador la escuche sobre el ruido de la máquina.",
    "Alarm sound on failures": "Sonido de alarma en fallas", "Also alarm on \"Check\" results": "También alarma en resultados de \"Revisar\"",
    "Send a test alarm": "Enviar alarma de prueba", "Sounds here and on every supervisor phone with alarms on.": "Suena aquí y en cada teléfono de supervisor con alarmas activadas.",
    "Finish setup — go to Inspect": "Terminar configuración — ir a Inspección",
    "Finish the steps above, then start inspecting.": "Termine los pasos de arriba y luego empiece a inspeccionar.",
    "All set. Go to Inspect and start inspecting.": "Todo listo. Vaya a Inspección y empiece a inspeccionar.",

    // Log
    "Inspection log": "Registro de inspecciones", "All results": "Todos los resultados", "Test captures": "Capturas de prueba",
    "Export CSV": "Exportar CSV", "Clear log": "Borrar registro",
    "Kept on this device (last 150 inspections). Record failures on the QF120 waste/comments log as usual.":
      "Se guarda en este equipo (últimas 150 inspecciones). Anote las fallas en el registro de desperdicio/comentarios del QF120 como siempre.",
    "No inspections to show.": "No hay inspecciones para mostrar.",

    // Alerts
    "Alerts from all lines": "Alertas de todas las líneas",
    "Every Fail and Check from any camera station shows here. Supervisors can open this page on their own phone and leave this tab open.":
      "Cada Falla y Revisar de cualquier cámara aparece aquí. Los supervisores pueden abrir esta página en su teléfono y dejar esta pestaña abierta.",
    "Sound the alarm on this phone for new failures": "Sonar la alarma en este teléfono con fallas nuevas",
    "Can't reach the shared alert feed. Check the access code in Setup and the internet connection.":
      "No se puede conectar a las alertas compartidas. Revise el código de acceso en Configuración y la conexión a internet.",
    "No failures or checks reported yet.": "No hay fallas ni revisiones reportadas todavía.",
    "Acknowledge": "Enterado", "Acknowledged": "Atendido",

    // Automatic trigger
    "Relearn empty belt": "Volver a aprender banda vacía",
    "Click": "Haga clic en",
    "and drag a box across the belt where each product fully shows (use the camera picture in step 3).": "y arrastre un recuadro sobre la banda donde se vea cada producto completo (use la imagen de la cámara del paso 3).",
    "Keep the yellow box clear for a few seconds. The camera learns the empty belt and sets itself up on the first few products. Nothing to adjust.":
      "Mantenga el recuadro amarillo despejado unos segundos. La cámara aprende la banda vacía y se ajusta sola con los primeros productos. No hay nada que ajustar.",
    "Adjust the trigger and photo timing automatically (recommended)": "Ajustar el disparo y el momento de la foto automáticamente (recomendado)",
    "Learning the empty belt… keep the yellow box clear.": "Aprendiendo la banda vacía… mantenga despejado el recuadro amarillo.",
    "Waiting for the belt to be still and the yellow box to be clear…": "Esperando que la banda esté quieta y el recuadro amarillo despejado…",
    "Empty belt not learned yet.": "Banda vacía todavía no aprendida.",
    "Trigger ready.": "Disparo listo.",
    "Keep the yellow box clear for a few seconds.": "Mantenga despejado el recuadro amarillo unos segundos.",
    "Zone saved. Keep it clear for a few seconds while it learns the empty belt.": "Zona guardada. Manténgala despejada unos segundos mientras aprende la banda vacía.",
    "Camera changed. Keep the yellow box clear for a few seconds while it relearns the belt.": "Cámara cambiada. Mantenga despejado el recuadro amarillo unos segundos mientras vuelve a aprender la banda.",

    "Retake the good sample: the order, trigger zone or camera changed since it was taken.": "Vuelva a tomar la muestra buena: la orden, la zona de disparo o la cámara cambiaron desde que se tomó.",
    "The good sample needs to be retaken (new order, zone or camera), so it isn't being used.": "Hay que volver a tomar la muestra buena (orden, zona o cámara nueva), así que no se está usando.",
    "New order: counts reset. Take a new good sample in Setup step 6.": "Orden nueva: conteos reiniciados. Tome una muestra buena nueva en el paso 6 de Configuración.",
    "The AI took too long.": "La IA tardó demasiado.",

    // Feedback, pilot results
    "Real defect": "Defecto real", "False alarm": "Falsa alarma", "AI missed a defect": "La IA no vio un defecto",
    "Record that the AI passed a product that was actually bad?": "¿Registrar que la IA pasó un producto que en realidad estaba malo?",
    "Missed defect recorded. Thank you.": "Defecto no detectado registrado. Gracias.",
    "Operator found a defect the AI passed.": "El operador encontró un defecto que la IA pasó.",
    "MISSED": "NO DETECTADO", "Missed defects": "Defectos no detectados", "Needs review": "Por revisar",
    "Pilot results": "Resultados de la prueba", "Last 7 days": "Últimos 7 días", "Last 30 days": "Últimos 30 días",
    "From the operators' Real defect / False alarm answers on this computer.": "Según las respuestas de Defecto real / Falsa alarma de los operadores en esta computadora.",
    "Fail / Check": "Falla / Revisar", "Real defects": "Defectos reales", "False alarms": "Falsas alarmas",
    "Not yet reviewed": "Sin revisar", "Catch rate": "Tasa de detección", "False alarm rate": "Tasa de falsas alarmas",
    "Take a new good sample in Setup step 6.": "Tome una muestra buena nueva en el paso 6 de Configuración.",

    // Photos
    "Photos": "Fotos", "Photo archive": "Archivo de fotos",
    "Up to 5 photos per order: the good sample plus a few products spread through the run (a Fail is always saved first). Photos are kept for 1 year.":
      "Hasta 5 fotos por orden: la muestra buena y algunos productos repartidos durante la corrida (una Falla siempre se guarda primero). Las fotos se guardan por 1 año.",
    "Look up": "Buscar", "Recent orders": "Órdenes recientes", "Loading…": "Cargando…",
    "Enter the access code in Setup first.": "Primero ingrese el código de acceso en Configuración.",
    "No photos saved yet.": "Todavía no hay fotos guardadas.", "No photos saved for this order.": "No hay fotos guardadas para esta orden.",
    "Can't reach the photo archive. Check the internet connection.": "No se puede conectar al archivo de fotos. Revise la conexión a internet.",
    "First product": "Primer producto", "Photo": "Foto", "Download": "Descargar", "Close": "Cerrar",

    // Messages
    "Empty belt learned.": "Banda vacía aprendida.", "Good sample saved.": "Muestra buena guardada.",
    "Start the camera in step 3 first.": "Primero encienda la cámara en el paso 3.",
    "Still inspecting the last product.": "Todavía inspeccionando el producto anterior.",
    "Zone saved. Tap Learn empty belt with the belt clear.": "Zona guardada. Toque Aprender banda vacía con la banda despejada.",
    "Camera changed. Tap Learn empty belt with the belt clear.": "Cámara cambiada. Toque Aprender banda vacía con la banda despejada.",
    "Camera reconnected. Inspection resumed.": "Cámara reconectada. Inspección reanudada.",
    "The selected camera wasn't found. Using the default camera — check the USB cable.": "No se encontró la cámara elegida. Usando la cámara predeterminada — revise el cable USB.",
    "Click Start inspecting when the line is running.": "Haga clic en Empezar a inspeccionar cuando la línea esté corriendo.",
    "Camera disconnected. Check the USB cable. Inspection will resume when the camera is back.": "Cámara desconectada. Revise el cable USB. La inspección seguirá cuando regrese la cámara.",
    "TEST ALARM — not a real defect.": "ALARMA DE PRUEBA — no es un defecto real.",
    "Couldn't reach the site. Check Wi-Fi.": "No se pudo conectar al sitio. Revise la conexión.",
    "Wrong access code. Fix it in Setup.": "Código de acceso incorrecto. Corríjalo en Configuración.",
    "AI is busy or the usage limit was reached. Inspect fewer products (Setup → Inspect every).": "La IA está ocupada o se llegó al límite de uso. Inspeccione menos productos (Configuración → Inspeccionar cada).",
    "Inspection took too long. Try Fast mode.": "La inspección tardó demasiado. Use el modo Rápida.",
    "AI service error. It will try again on the next product.": "Error del servicio de IA. Lo intentará otra vez con el siguiente producto.",
    "Inspection didn't complete (connection or service error).": "La inspección no terminó (error de conexión o de servicio).",
    "The site isn't set up yet (missing setting in Netlify). Tell the plant manager.": "El sitio todavía no está configurado. Avise al gerente de planta.",
    "Clear the inspection log on this device?": "¿Borrar el registro de inspecciones de este equipo?",
    "Reset this camera's counts to zero?": "¿Reiniciar los conteos de esta cámara a cero?",
    "Some steps aren't finished yet, so inspections may not work well. Go to Inspect anyway?": "Algunos pasos no están terminados, así que la inspección puede no funcionar bien. ¿Ir a Inspección de todos modos?",
    "Photo captured (test mode, AI not connected yet).": "Foto capturada (modo de prueba, IA no conectada).",
    "No issues seen.": "Sin problemas.", "See details.": "Vea los detalles."
  };

  // Text with numbers or names inside
  const PATTERNS = [
    [/^Products seen: (\d+) · Not inspected \(AI busy\): (\d+) · Unclear photos: (\d+)(?: · Test captures: (\d+))?$/,
      (m, a, b, c, d) => `Productos vistos: ${a} · No inspeccionados (IA ocupada): ${b} · Fotos no claras: ${c}` + (d ? ` · Capturas de prueba: ${d}` : "")],
    [/^Still to do: (.+)\.$/, (m, list) => "Falta: " + list.split(", ").map(s => ES[s] || s).join(", ") + "."],
    [/^— low \(big products, busy background\), (\d+)\/10$/, (m, n) => `— baja (productos grandes, fondo con movimiento), ${n}/10`],
    [/^— high \(small or light-colored products\), (\d+)\/10$/, (m, n) => `— alta (productos chicos o de color claro), ${n}/10`],
    [/^— medium, (\d+)\/10$/, (m, n) => `— media, ${n}/10`],
    [/^\+(\d+) more since this alarm$/, (m, n) => `+${n} más desde esta alarma`],
    [/^(.*) · confidence (\d+)%(.*)$/, (m, a, n, b) => `${a} · confianza ${n}%${b}`],
    [/^Calibrating: (\d+) of (\d+) products seen\.$/, (m, a, b) => `Calibrando: ${a} de ${b} productos vistos.`],
    [/^(\d+) photos$/, (m, n) => `${n} fotos`],
    [/^Check: (.*)$/, (m, s) => "Revisar: " + s],
    [/^Camera (\d+)$/, (m, n) => "Cámara " + n],
    [/^This window was hidden for about (\d+) min, so some products may have been missed\. Keep Line QC visible, or start it with the Line QC shortcut\.$/,
      (m, n) => `Esta ventana estuvo oculta unos ${n} min, así que pudieron perderse productos. Mantenga visible la Cámara de Calidad o ábrala con su acceso directo.`],
    [/^AI isn't ready \((.*)\)\. Products will be counted but not inspected\.$/, (m, s) => `La IA no está lista (${ES[s] || s}). Los productos se contarán pero no se inspeccionarán.`],
    [/^Anthropic rejected the site's AI key(.*)\. Tell the plant manager\.$/, (m, s) => `El servicio de IA rechazó la clave${s}. Avise al gerente de planta.`],
    [/^AI isn't ready: (.*)\.$/, (m, s) => `La IA no está lista: ${ES[s] || s}.`],
    [/^(PASS|FAIL|CHECK|UNCLEAR|ERROR|CAPTURED)( — .*)$/, (m, v, rest) => ES[v] + rest],
    [/^(PASS|FAIL|CHECK|UNCLEAR) (\d+ ?\w*) ago — (.*)$/, (m, v, t, s) => `${ES[v]} hace ${t} — ${s}`]
  ];

  const norm = s => s.replace(/\s+/g, " ").trim();
  function tr(s) {
    if (s == null || getLang() !== "es") return s;
    const raw = String(s), key = norm(raw);
    if (!key || !/[A-Za-z]/.test(key)) return raw;
    let out = ES[key];
    if (out === undefined) for (const [re, fn] of PATTERNS) { if (re.test(key)) { out = key.replace(re, fn); break; } }
    if (out === undefined) return raw;
    return raw.match(/^\s*/)[0] + out + raw.match(/\s*$/)[0];
  }

  function getLang() { try { return localStorage.getItem(LANG_KEY) === "es" ? "es" : "en"; } catch { return "en"; } }
  function setLang(l) { try { localStorage.setItem(LANG_KEY, l === "es" ? "es" : "en"); } catch {} }

  // --- swap text on screen ---
  const ATTRS = ["placeholder", "title", "aria-label"];
  const SKIP = "script,style,textarea,[data-no-i18n]";
  const done = new Map();
  let obs = null;
  const skip = el => !el || !!el.closest(SKIP);

  function doText(n) {
    const p = n.parentElement;
    if (!p || skip(p)) return;
    const prev = done.get(n);
    if (prev && n.nodeValue === prev.out) return;
    const t = tr(n.nodeValue);
    if (t === n.nodeValue) return;
    done.set(n, { orig: n.nodeValue, out: t });
    n.nodeValue = t;
  }
  function doAttrs(el) {
    if (!el.getAttribute || (el.closest && el.closest("[data-no-i18n]"))) return;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (!v) continue;
      const rec = done.get(el) || {};
      if (rec[a] && rec[a].out === v) continue;
      const t = tr(v);
      if (t !== v) { rec[a] = { orig: v, out: t }; done.set(el, rec); el.setAttribute(a, t); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1) return;
    doAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = w.nextNode())) n.nodeType === 3 ? doText(n) : doAttrs(n);
  }
  function start() {
    if (obs) return;
    walk(document.body);
    obs = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === "characterData") doText(m.target);
        else if (m.type === "attributes") doAttrs(m.target);
        else m.addedNodes.forEach(walk);
      }
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  function stop() {
    if (obs) { obs.disconnect(); obs = null; }
    for (const [n, rec] of done) {
      if (!n.isConnected) continue;
      if (n.nodeType === 3) { if (n.nodeValue === rec.out) n.nodeValue = rec.orig; }
      else for (const a of ATTRS) if (rec[a] && n.getAttribute(a) === rec[a].out) n.setAttribute(a, rec[a].orig);
    }
    done.clear();
  }

  const _confirm = window.confirm.bind(window);
  window.confirm = m => _confirm(tr(m));

  function applyLang() {
    document.documentElement.lang = getLang();
    if (getLang() === "es") start(); else stop();
    document.querySelectorAll("#topLang [data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === getLang())));
  }

  window.QCI18N = { tr, getLang, setLang, applyLang };
})();
