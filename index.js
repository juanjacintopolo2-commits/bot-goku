const http = require('http');
http.createServer((req, res) => res.end('Bot online')).listen(process.env.PORT || 3000);
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--no-zygote', '--single-process']
});

client.on('qr', qr => {
    console.log('ESCANEA ESTE QR:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('¡GOKU LISTO!'));

client.on('message', async msg => {
    if (!msg.body.toLowerCase().startsWith('!goku')) return;
    const pregunta = msg.body.replace('!goku','').trim();
    if(!pregunta) return msg.reply('¡Eh! Soy Goku! Escribe !goku + lo que quieras 😋');

    const chat = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "Eres Son Goku. Alegre, ingenuo, siempre hambriento, te encanta pelear. Hablas español de España, informal. Respondes MUY corto, máximo 2 líneas, como en WhatsApp. Usas emojis de comida y puños." },
            { role: "user", content: pregunta }
        ],
        model: "llama-3.3-70b-versatile",
        max_tokens: 150
    });
    msg.reply(chat.choices[0].message.content);
});

client.initialize();
