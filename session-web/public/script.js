const startBtn = document.getElementById('startBtn');
const qrSection = document.getElementById('qrSection');
const codeSection = document.getElementById('codeSection');
const pairCodeDiv = document.getElementById('pairCode');
const whatsappNumberInput = document.getElementById('whatsappNumber');
const typingDiv = document.getElementById('typingEffect');

const bgMusic = document.getElementById('bgMusic');
const playMusic = document.getElementById('playMusic');
const pauseMusic = document.getElementById('pauseMusic');
const volumeUp = document.getElementById('volumeUp');
const volumeDown = document.getElementById('volumeDown');

const sendCommandBtn = document.getElementById('sendCommandBtn');
const botCommandInput = document.getElementById('botCommandInput');
const commandSection = document.getElementById('commandSection');

// Typing effect
function typeEffect(text, speed = 50) {
    typingDiv.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            typingDiv.textContent += text[i];
            i++;
        } else clearInterval(interval);
    }, speed);
}

// Music controls
playMusic.addEventListener('click', () => bgMusic.play());
pauseMusic.addEventListener('click', () => bgMusic.pause());
volumeUp.addEventListener('click', () => bgMusic.volume = Math.min(bgMusic.volume + 0.1, 1));
volumeDown.addEventListener('click', () => bgMusic.volume = Math.max(bgMusic.volume - 0.1, 0));

let countdownInterval;
startBtn.addEventListener('click', async () => {
    const number = whatsappNumberInput.value.trim();
    const mode = document.querySelector('input[name="mode"]:checked').value;
    if (!number) return alert('Please enter your WhatsApp number!');

    typeEffect('⌛ Creating session, please wait...');
    const res = await fetch('/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, mode })
    });

    const data = await res.json();
    const sessionID = data.sessionID;
    let expiresIn = data.expiresIn;

    if (mode === 'qr') {
        qrSection.style.display = 'block';
        codeSection.style.display = 'none';
        QRCode.toCanvas(document.getElementById('qrCodeCanvas'), sessionID, err => err && console.error(err));
    } else {
        qrSection.style.display = 'none';
        codeSection.style.display = 'block';
        pairCodeDiv.textContent = sessionID;
    }

    typeEffect(`✅ Session created! Session ID: ${sessionID}`);

    commandSection.classList.add('disabled');

    clearInterval(countdownInterval);
    countdownInterval = setInterval(async () => {
        if (expiresIn <= 0) {
            clearInterval(countdownInterval);
            typeEffect('⏰ Session expired!');
            commandSection.classList.add('disabled');
            return;
        }
        expiresIn--;

        const check = await fetch('/validate-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionID })
        });
        const status = await check.json();
        if (status.valid && status.status === 'linked') {
            clearInterval(countdownInterval);
            typeEffect('✅ Session successfully linked! You can now use the bot.');
            commandSection.classList.remove('disabled');
        }
    }, 1000);
});

// Bot commands
sendCommandBtn?.addEventListener('click', async () => {
    const command = botCommandInput.value.trim();
    if (!command) return;
    const sessionID = pairCodeDiv.textContent;
    const res = await fetch('/bot-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionID, command })
    });
    const data = await res.json();
    typeEffect(`📝 ${JSON.stringify(data)}`);
});
