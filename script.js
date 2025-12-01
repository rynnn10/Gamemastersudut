function loadScore() { return parseInt(localStorage.getItem('masterSudutScore') || '0'); }
const state = { mode: null, targetAngle: 0, userAngle: 0, totalScore: loadScore(), isDragging: false, bgmVolume: 0.5, sfxVolume: 1.0, lastSoundAngle: -100, isMuted: false };
document.getElementById('total-score-display').innerText = state.totalScore;
function updateScore(points) { state.totalScore += points; localStorage.setItem('masterSudutScore', state.totalScore); document.getElementById('total-score-display').innerText = state.totalScore; }
const waNumber = "6282275894842";
const waMessage = "Halo Riyan, saya sudah bermain game Master Sudut. Saya ingin memberikan kritik dan saran: ";
document.getElementById('wa-link').href = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioElements = { bgm: document.getElementById('bgm') };
audioElements.bgm.volume = state.bgmVolume;

// GLOBAL CLICK HANDLER FIX FOR AUTOPLAY
document.addEventListener('click', function() {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
    if (audioElements.bgm.paused && !state.isMuted) {
        audioElements.bgm.play().catch(e => console.log("Audio play failed (waiting for interaction)", e));
    }
}, { once: true });

function toggleMute() {
    playSound('pop');
    state.isMuted = !state.isMuted;
    const btn = document.getElementById('btn-settings-mute');
    const icon = document.getElementById('mute-icon');
    const text = document.getElementById('mute-text');
    const controls = document.getElementById('audio-controls-container');
    const bgmSlider = document.getElementById('vol-bgm');
    const sfxSlider = document.getElementById('vol-sfx');

    if (state.isMuted) {
        audioElements.bgm.pause();
        btn.classList.remove('bg-green-100', 'text-green-700', 'hover:bg-green-200');
        btn.classList.add('bg-gray-200', 'text-gray-500', 'hover:bg-gray-300');
        icon.innerText = "🔇"; text.innerText = "Mati";
        controls.classList.add('opacity-50', 'pointer-events-none');
        bgmSlider.disabled = true; sfxSlider.disabled = true;
    } else {
        audioElements.bgm.volume = state.bgmVolume;
        if (state.bgmVolume > 0) audioElements.bgm.play().catch(()=>{});
        btn.classList.add('bg-green-100', 'text-green-700', 'hover:bg-green-200');
        btn.classList.remove('bg-gray-200', 'text-gray-500', 'hover:bg-gray-300');
        icon.innerText = "🔊"; text.innerText = "Nyala";
        controls.classList.remove('opacity-50', 'pointer-events-none');
        bgmSlider.disabled = false; sfxSlider.disabled = false;
    }
}

function playSynthSound(type) {
    if (state.isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    
    if (type === 'pop') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(state.sfxVolume, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'drag') {
        osc.type = 'square'; osc.frequency.setValueAtTime(220, now);
        gainNode.gain.setValueAtTime(state.sfxVolume * 0.4, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
    } else if (type === 'lock') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now);
        gainNode.gain.setValueAtTime(state.sfxVolume, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'win') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(500, now); osc.frequency.setValueAtTime(800, now + 0.1); osc.frequency.setValueAtTime(1200, now + 0.2);
        gainNode.gain.setValueAtTime(state.sfxVolume * 0.8, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'lose') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(100, now + 0.4);
        gainNode.gain.setValueAtTime(state.sfxVolume * 0.8, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    }
}

function playSound(type) {
    if (state.isMuted) return;
    if(audioElements.bgm.paused && type !== 'bgm' && type !== 'drag' && state.bgmVolume > 0) {
        audioElements.bgm.play().catch(()=>{});
    }
    playSynthSound(type);
}

function handleDragSound(currentAngle) {
    if (Math.abs(currentAngle - state.lastSoundAngle) >= 3) {
        playSynthSound('drag');
        state.lastSoundAngle = currentAngle;
    }
}

function updateVolumeLabels() {
    const bgmSlider = document.getElementById('vol-bgm');
    const sfxSlider = document.getElementById('vol-sfx');
    bgmSlider.value = state.bgmVolume * 100;
    document.getElementById('label-bgm-vol').innerText = Math.round(state.bgmVolume * 100) + "%";
    sfxSlider.value = state.sfxVolume * 100;
    document.getElementById('label-sfx-vol').innerText = Math.round(state.sfxVolume * 100) + "%";
}

document.getElementById('vol-bgm').addEventListener('input', (e) => {
    const val = e.target.value / 100;
    state.bgmVolume = val;
    audioElements.bgm.volume = val;
    document.getElementById('label-bgm-vol').innerText = Math.round(val * 100) + "%";
    if(!state.isMuted && val > 0 && audioElements.bgm.paused) audioElements.bgm.play().catch(()=>{});
});

document.getElementById('vol-sfx').addEventListener('input', (e) => {
    const val = e.target.value / 100;
    state.sfxVolume = val;
    document.getElementById('label-sfx-vol').innerText = Math.round(val * 100) + "%";
    if(!state.isMuted && Math.random() > 0.7) playSynthSound('pop');
        });

updateVolumeLabels();

function openSettings() {
    playSound('pop');
    updateVolumeLabels();
    document.getElementById('settings-modal').classList.remove('hidden');
    document.getElementById('settings-modal').classList.add('flex');
    switchSettingsView('main');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
    document.getElementById('settings-modal').classList.remove('flex');
}

function switchSettingsView(viewName) {
    document.getElementById('settings-view-main').classList.add('hidden');
    document.getElementById('settings-view-info').classList.add('hidden');
    document.getElementById('settings-view-about').classList.add('hidden');
    document.getElementById('settings-view-' + viewName).classList.remove('hidden');
    document.getElementById('settings-view-' + viewName).classList.add('flex');
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');
let centerX, centerY, radius;

function initCanvas() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    centerX = width / 2;
    centerY = height / 2;
    radius = (Math.min(width, height) / 2) - 60; 
}

function drawGame(showUserLine = true, showTargetLine = true, showArc = true) {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, width, height);

    if (state.mode === 'create') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 20, 0, 45 * (Math.PI/180));
        ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
        const arrowAngle = 45 * (Math.PI/180);
        const ax = centerX + (radius + 20) * Math.cos(arrowAngle);
        const ay = centerY + (radius + 20) * Math.sin(arrowAngle);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 5, ay - 5); ctx.lineTo(ax + 2, ay - 8); ctx.fillStyle = "#9ca3af"; ctx.fill();
    }

    ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); ctx.strokeStyle = '#eef2ff'; ctx.lineWidth = 8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + radius, centerY); ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();

    if (showTargetLine) {
        const rad = state.targetAngle * (Math.PI / 180);
        const endX = centerX + radius * Math.cos(rad);
        const endY = centerY + radius * Math.sin(rad);
        if (showArc) {
            ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, 0, rad, false); ctx.fillStyle = 'rgba(79, 70, 229, 0.1)'; ctx.fill();
        }
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(endX, endY); ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    }

    if (showUserLine) {
        const rad = state.userAngle * (Math.PI / 180);
        const endX = centerX + radius * Math.cos(rad);
        const endY = centerY + radius * Math.sin(rad);
        if (state.mode === 'create') {
            ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, 0, rad, false); ctx.fillStyle = 'rgba(147, 51, 234, 0.2)'; ctx.fill();
        }
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(endX, endY);
        ctx.strokeStyle = state.mode === 'create' ? '#9333ea' : '#ef4444'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
        ctx.beginPath(); ctx.arc(endX, endY, 14, 0, 2 * Math.PI); ctx.fillStyle = 'white'; ctx.fill();
        ctx.strokeStyle = state.mode === 'create' ? '#9333ea' : '#ef4444'; ctx.lineWidth = 4; ctx.stroke();
    }
}

function switchScreen(screenName) {
    const menu = document.getElementById('screen-menu');
    const game = document.getElementById('screen-game');
    const btnHome = document.getElementById('btn-home');
    if (screenName === 'menu') {
        menu.classList.remove('hidden'); menu.classList.add('flex');
        game.classList.add('hidden'); game.classList.remove('flex');
        btnHome.classList.add('hidden');
    } else {
        menu.classList.add('hidden'); menu.classList.remove('flex');
        game.classList.remove('hidden'); game.classList.add('flex');
        btnHome.classList.remove('hidden');
        requestAnimationFrame(() => { initCanvas(); nextRound(); });
    }
}

function startGame(mode) { playSound('pop'); state.mode = mode; switchScreen('game'); }

function nextRound() {
    playSound('pop');
    state.targetAngle = Math.floor(Math.random() * 350) + 5;
    state.lastSoundAngle = -100; 
    document.getElementById('btn-submit').classList.remove('hidden'); document.getElementById('btn-submit').classList.add('flex');
    document.getElementById('btn-next').classList.add('hidden'); document.getElementById('btn-next').classList.remove('flex');
    document.getElementById('result-overlay').classList.add('hidden');
    
    const badge = document.getElementById('game-badge');
    const mainText = document.getElementById('game-instruction-main');
    
    if (state.mode === 'guess') {
        state.userAngle = 0; badge.innerText = "MODE TEBAK"; badge.className = "inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 bg-blue-100 text-blue-600"; mainText.innerText = "?";
        document.getElementById('controls-guess').classList.remove('hidden'); document.getElementById('controls-create').classList.add('hidden'); document.getElementById('touch-layer').style.pointerEvents = 'none';
        document.getElementById('guess-slider').value = 0; document.getElementById('guess-input').value = 0;
        drawGame(false, true, true);
    } else {
        state.userAngle = 0; badge.innerText = "MODE BUAT"; badge.className = "inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 bg-purple-100 text-purple-600"; mainText.innerHTML = `<span class="text-purple-600">${state.targetAngle}°</span>`;
        document.getElementById('controls-guess').classList.add('hidden'); document.getElementById('controls-create').classList.remove('hidden'); document.getElementById('touch-layer').style.pointerEvents = 'auto';
        drawGame(true, false, false);
    }
}

function submitAnswer() {
    playSound('lock');
    if (state.mode === 'guess') {
        const val = document.getElementById('guess-input').value;
        state.userAngle = val === '' ? 0 : parseInt(val);
    }
    const diff = Math.abs(state.targetAngle - state.userAngle);
    const score = Math.max(0, 100 - (diff * 2)); 
    setTimeout(() => { if (score > 60) playSound('win'); else playSound('lose'); }, 300);
    updateScore(score); 
    drawGame(true, true, true);
    document.getElementById('res-target').innerText = state.targetAngle + "°"; document.getElementById('res-user').innerText = state.userAngle + "°"; 
    document.getElementById('res-diff').innerText = diff + "°"; document.getElementById('score-detail').innerText = `100 - (${diff} x 2) = ${score}`;
    const title = document.getElementById('result-title'); const icon = document.getElementById('result-icon'); const fill = document.getElementById('score-bar-fill');
    if (score === 100) { icon.innerText = "👑"; title.innerText = "Sempurna!!"; fill.className = "h-full bg-emerald-500 rounded-full"; title.className="text-4xl font-black text-emerald-600 mb-4"; }
    else if (score >= 80) { icon.innerText = "🔥"; title.innerText = "Hebat!"; fill.className = "h-full bg-indigo-500 rounded-full"; title.className="text-4xl font-black text-indigo-600 mb-4";}
    else if (score >= 50) { icon.innerText = "👍"; title.innerText = "Bagus"; fill.className = "h-full bg-yellow-500 rounded-full"; title.className="text-4xl font-black text-yellow-600 mb-4";}
    else { icon.innerText = "📉"; title.innerText = "Belajar Lagi"; fill.className = "h-full bg-red-500 rounded-full"; title.className="text-4xl font-black text-red-600 mb-4";}
    document.getElementById('result-overlay').classList.remove('hidden');
    setTimeout(() => { fill.style.width = score + "%"; }, 100);
    document.getElementById('btn-submit').classList.add('hidden'); document.getElementById('btn-submit').classList.remove('flex');
    document.getElementById('btn-next').classList.remove('hidden'); document.getElementById('btn-next').classList.add('flex');
}

function updateAngle(e) {
    if (state.mode !== 'create') return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - (rect.width / 2); const y = clientY - rect.top - (rect.height / 2);
    let deg = Math.atan2(y, x) * (180 / Math.PI); if (deg < 0) deg += 360;
    state.userAngle = Math.round(deg); 
    handleDragSound(state.userAngle); 
    drawGame(true, false, false);
}

const layer = document.getElementById('touch-layer');
layer.addEventListener('mousedown', (e) => { state.isDragging = true; updateAngle(e); });
window.addEventListener('mousemove', (e) => { if (state.isDragging) updateAngle(e); });
window.addEventListener('mouseup', () => { state.isDragging = false; });
layer.addEventListener('touchstart', (e) => { e.preventDefault(); state.isDragging = true; updateAngle(e); }, {passive: false});
layer.addEventListener('touchmove', (e) => { e.preventDefault(); if (state.isDragging) updateAngle(e); }, {passive: false});
layer.addEventListener('touchend', () => { state.isDragging = false; });
const slider = document.getElementById('guess-slider'); const inputNum = document.getElementById('guess-input');
slider.addEventListener('input', (e) => { let val = parseInt(e.target.value); state.userAngle = val; inputNum.value = val; handleDragSound(val); });
inputNum.addEventListener('input', (e) => { let val = parseInt(e.target.value); if(isNaN(val)) val = 0; if(val>360) val=360; if(val<0) val=0; state.userAngle = val; slider.value = val; });

// FIX RESIZE BUG
window.addEventListener('resize', () => { 
    if(!document.getElementById('screen-game').classList.contains('hidden')) {
        initCanvas(); 
        // Logic untuk gambar ulang sesuai state saat ini
        if(document.getElementById('btn-submit').classList.contains('hidden')) {
             drawGame(true, true, true); // Sedang di result
        } else {
             if(state.mode === 'guess') drawGame(false, true, true);
             else drawGame(true, false, false);
        }
    } 
});


        bgmSlider.disabled = true; sfxSlider.disabled = true;
    } else {
        audioElements.bgm.volume = state.bgmVolume;
        if (state.bgmVolume > 0) audioElements.bgm.play().catch(()=>{});
        btn.classList.add('bg-green-100', 'text-green-700', 'hover:bg-green-200');
        btn.classList.remove('bg-gray-200', 'text-gray-500', 'hover:bg-gray-300');
        icon.innerText = "🔊"; text.innerText = "Nyala";
        controls.classList.remove('opacity-50', 'pointer-events-none');
        bgmSlider.disabled = false; sfxSlider.disabled = false;
    }
}

function playSynthSound(type) {
    if (state.isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    
    if (type === 'pop') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(state.sfxVolume, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'drag') {
        osc.type = 'square'; osc.frequency.setValueAtTime(220, now);
        gainNode.gain.setValueAtTime(state.sfxVolume * 0.4, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
    } else if (type === 'lock') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now);
        gainNode.gain.setValueAtTime(state.sfxVolume, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'win') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(500, now); osc.frequency.setValueAtTime(800, now + 0.1); osc.frequency.setValueAtTime(1200, now + 0.2);
        gainNode.gain.setValueAtTime(state.sfxVolume * 0.8, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'lose') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(100, now + 0.4);
        gainNode.gain.setValueAtTime(state.sfxVolume * 0.8, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    }
}

function playSound(type) {
    if (state.isMuted) return;
    if(audioElements.bgm.paused && type !== 'bgm' && type !== 'drag' && state.bgmVolume > 0) {
        audioElements.bgm.play().catch(()=>{});
    }
    playSynthSound(type);
}

function handleDragSound(currentAngle) {
    if (Math.abs(currentAngle - state.lastSoundAngle) >= 3) {
        playSynthSound('drag');
        state.lastSoundAngle = currentAngle;
    }
}

function updateVolumeLabels() {
    const bgmSlider = document.getElementById('vol-bgm');
    const sfxSlider = document.getElementById('vol-sfx');
    bgmSlider.value = state.bgmVolume * 100;
    document.getElementById('label-bgm-vol').innerText = Math.round(state.bgmVolume * 100) + "%";
    sfxSlider.value = state.sfxVolume * 100;
    document.getElementById('label-sfx-vol').innerText = Math.round(state.sfxVolume * 100) + "%";
}

document.getElementById('vol-bgm').addEventListener('input', (e) => {
    const val = e.target.value / 100;
    state.bgmVolume = val;
    audioElements.bgm.volume = val;
    document.getElementById('label-bgm-vol').innerText = Math.round(val * 100) + "%";
    if(!state.isMuted && val > 0 && audioElements.bgm.paused) audioElements.bgm.play().catch(()=>{});
});

document.getElementById('vol-sfx').addEventListener('input', (e) => {
    const val = e.target.value / 100;
    state.sfxVolume = val;
    document.getElementById('label-sfx-vol').innerText = Math.round(val * 100) + "%";
    if(!state.isMuted && Math.random() > 0.7) playSynthSound('pop');
});

updateVolumeLabels();

function openSettings() {
    playSound('pop');
    updateVolumeLabels();
    document.getElementById('settings-modal').classList.remove('hidden');
    document.getElementById('settings-modal').classList.add('flex');
    switchSettingsView('main');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
    document.getElementById('settings-modal').classList.remove('flex');
}

function switchSettingsView(viewName) {
    document.getElementById('settings-view-main').classList.add('hidden');
    document.getElementById('settings-view-info').classList.add('hidden');
    document.getElementById('settings-view-about').classList.add('hidden');
    document.getElementById('settings-view-' + viewName).classList.remove('hidden');
    document.getElementById('settings-view-' + viewName).classList.add('flex');
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');
let centerX, centerY, radius;

function initCanvas() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    centerX = width / 2;
    centerY = height / 2;
    radius = (Math.min(width, height) / 2) - 60; 
}

function drawGame(showUserLine = true, showTargetLine = true, showArc = true) {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, width, height);

    if (state.mode === 'create') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 20, 0, 45 * (Math.PI/180));
        ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
        const arrowAngle = 45 * (Math.PI/180);
        const ax = centerX + (radius + 20) * Math.cos(arrowAngle);
        const ay = centerY + (radius + 20) * Math.sin(arrowAngle);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 5, ay - 5); ctx.lineTo(ax + 2, ay - 8); ctx.fillStyle = "#9ca3af"; ctx.fill();
    }

    ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); ctx.strokeStyle = '#eef2ff'; ctx.lineWidth = 8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + radius, centerY); ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();

    if (showTargetLine) {
        const rad = state.targetAngle * (Math.PI / 180);
        const endX = centerX + radius * Math.cos(rad);
        const endY = centerY + radius * Math.sin(rad);
        if (showArc) {
            ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, 0, rad, false); ctx.fillStyle = 'rgba(79, 70, 229, 0.1)'; ctx.fill();
        }
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(endX, endY); ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    }

    if (showUserLine) {
        const rad = state.userAngle * (Math.PI / 180);
        const endX = centerX + radius * Math.cos(rad);
        const endY = centerY + radius * Math.sin(rad);
        if (state.mode === 'create') {
            ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, 0, rad, false); ctx.fillStyle = 'rgba(147, 51, 234, 0.2)'; ctx.fill();
        }
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(endX, endY);
        ctx.strokeStyle = state.mode === 'create' ? '#9333ea' : '#ef4444'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
        ctx.beginPath(); ctx.arc(endX, endY, 14, 0, 2 * Math.PI); ctx.fillStyle = 'white'; ctx.fill();
        ctx.strokeStyle = state.mode === 'create' ? '#9333ea' : '#ef4444'; ctx.lineWidth = 4; ctx.stroke();
    }
}

function switchScreen(screenName) {
    const menu = document.getElementById('screen-menu');
    const game = document.getElementById('screen-game');
    const btnHome = document.getElementById('btn-home');
    if (screenName === 'menu') {
        menu.classList.remove('hidden'); menu.classList.add('flex');
        game.classList.add('hidden'); game.classList.remove('flex');
        btnHome.classList.add('hidden');
    } else {
        menu.classList.add('hidden'); menu.classList.remove('flex');
        game.classList.remove('hidden'); game.classList.add('flex');
        btnHome.classList.remove('hidden');
        requestAnimationFrame(() => { initCanvas(); nextRound(); });
    }
}

function startGame(mode) { playSound('pop'); state.mode = mode; switchScreen('game'); }

function nextRound() {
    playSound('pop');
    state.targetAngle = Math.floor(Math.random() * 350) + 5;
    state.lastSoundAngle = -100; 
    document.getElementById('btn-submit').classList.remove('hidden'); document.getElementById('btn-submit').classList.add('flex');
    document.getElementById('btn-next').classList.add('hidden'); document.getElementById('btn-next').classList.remove('flex');
    document.getElementById('result-overlay').classList.add('hidden');
    
    const badge = document.getElementById('game-badge');
    const mainText = document.getElementById('game-instruction-main');
    
    if (state.mode === 'guess') {
        state.userAngle = 0; badge.innerText = "MODE TEBAK"; badge.className = "inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 bg-blue-100 text-blue-600"; mainText.innerText = "?";
        document.getElementById('controls-guess').classList.remove('hidden'); document.getElementById('controls-create').classList.add('hidden'); document.getElementById('touch-layer').style.pointerEvents = 'none';
        document.getElementById('guess-slider').value = 0; document.getElementById('guess-input').value = 0;
        drawGame(false, true, true);
    } else {
        state.userAngle = 0; badge.innerText = "MODE BUAT"; badge.className = "inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 bg-purple-100 text-purple-600"; mainText.innerHTML = `<span class="text-purple-600">${state.targetAngle}°</span>`;
        document.getElementById('controls-guess').classList.add('hidden'); document.getElementById('controls-create').classList.remove('hidden'); document.getElementById('touch-layer').style.pointerEvents = 'auto';
        drawGame(true, false, false);
    }
}

function submitAnswer() {
    playSound('lock');
    if (state.mode === 'guess') {
        const val = document.getElementById('guess-input').value;
        state.userAngle = val === '' ? 0 : parseInt(val);
    }
    const diff = Math.abs(state.targetAngle - state.userAngle);
    const score = Math.max(0, 100 - (diff * 2)); 
    setTimeout(() => { if (score > 60) playSound('win'); else playSound('lose'); }, 300);
    updateScore(score); 
    drawGame(true, true, true);
    document.getElementById('res-target').innerText = state.targetAngle + "°"; document.getElementById('res-user').innerText = state.userAngle + "°"; 
    document.getElementById('res-diff').innerText = diff + "°"; document.getElementById('score-detail').innerText = `100 - (${diff} x 2) = ${score}`;
    const title = document.getElementById('result-title'); const icon = document.getElementById('result-icon'); const fill = document.getElementById('score-bar-fill');
    if (score === 100) { icon.innerText = "👑"; title.innerText = "Sempurna!!"; fill.className = "h-full bg-emerald-500 rounded-full"; title.className="text-4xl font-black text-emerald-600 mb-4"; }
    else if (score >= 80) { icon.innerText = "🔥"; title.innerText = "Hebat!"; fill.className = "h-full bg-indigo-500 rounded-full"; title.className="text-4xl font-black text-indigo-600 mb-4";}
    else if (score >= 50) { icon.innerText = "👍"; title.innerText = "Bagus"; fill.className = "h-full bg-yellow-500 rounded-full"; title.className="text-4xl font-black text-yellow-600 mb-4";}
    else { icon.innerText = "📉"; title.innerText = "Belajar Lagi"; fill.className = "h-full bg-red-500 rounded-full"; title.className="text-4xl font-black text-red-600 mb-4";}
    document.getElementById('result-overlay').classList.remove('hidden');
    setTimeout(() => { fill.style.width = score + "%"; }, 100);
    document.getElementById('btn-submit').classList.add('hidden'); document.getElementById('btn-submit').classList.remove('flex');
    document.getElementById('btn-next').classList.remove('hidden'); document.getElementById('btn-next').classList.add('flex');
}

function updateAngle(e) {
    if (state.mode !== 'create') return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - (rect.width / 2); const y = clientY - rect.top - (rect.height / 2);
    let deg = Math.atan2(y, x) * (180 / Math.PI); if (deg < 0) deg += 360;
    state.userAngle = Math.round(deg); 
    handleDragSound(state.userAngle); 
    drawGame(true, false, false);
}

const layer = document.getElementById('touch-layer');
layer.addEventListener('mousedown', (e) => { state.isDragging = true; updateAngle(e); });
window.addEventListener('mousemove', (e) => { if (state.isDragging) updateAngle(e); });
window.addEventListener('mouseup', () => { state.isDragging = false; });
layer.addEventListener('touchstart', (e) => { e.preventDefault(); state.isDragging = true; updateAngle(e); }, {passive: false});
layer.addEventListener('touchmove', (e) => { e.preventDefault(); if (state.isDragging) updateAngle(e); }, {passive: false});
layer.addEventListener('touchend', () => { state.isDragging = false; });
const slider = document.getElementById('guess-slider'); const inputNum = document.getElementById('guess-input');
slider.addEventListener('input', (e) => { let val = parseInt(e.target.value); state.userAngle = val; inputNum.value = val; handleDragSound(val); });
inputNum.addEventListener('input', (e) => { let val = parseInt(e.target.value); if(isNaN(val)) val = 0; if(val>360) val=360; if(val<0) val=0; state.userAngle = val; slider.value = val; });
window.addEventListener('resize', () => { if(!document.getElementById('screen-game').classList.contains('hidden')) initCanvas(); });

