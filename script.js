/**
 * =================================================================
 * A LITTLE BIRTHDAY SURPRISE - INTERACTIVE JAVASCRIPT
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. STATE & CONFIGURATION INITIALIZATION
    // -------------------------------------------------------------
    const defaultPhotos = [
        {
            url: "photos/photo1.jpg",
            caption: "Momen kecil yang selalu kukenang ♡",
            date: "Kenangan Manis",
            detail: "Setiap detik bersamamu selalu terasa begitu hangat dan berarti. Terima kasih telah menjadi bagian terbaik di setiap hariku."
        },
        {
            url: "photos/photo2.jpg",
            caption: "Senyummu adalah alasan bahagiaku ✨",
            date: "Hari yang Indah",
            detail: "Melihat kembali foto ini selalu membuatku tersenyum. Tawa dan senyumanmu adalah tempat terfavoritku di dunia."
        },
        {
            url: "photos/photo3.jpg",
            caption: "Obrolan hangat & hari yang tenang ☕",
            date: "Momen Sederhana",
            detail: "Hal paling membahagiakan bukanlah tempat yang mewah, melainkan kebersamaan dan cerita sederhana yang kita bagi."
        },
        {
            url: "photos/photo4.jpg",
            caption: "Di bawah pendar cahaya indah 🌟",
            date: "Tak Terlupakan",
            detail: "Kamu selalu menjadi sinar indah yang menghangatkan suasana di mana pun kamu berada."
        },
        {
            url: "photos/photo5.jpg",
            caption: "Selalu bersyukur memiliki kamu 🤍",
            date: "Hari Spesial",
            detail: "Di usiamu yang baru ini, semoga hatimu selalu dipenuhi dengan kebahagiaan dan rasa damai yang tak terbatas."
        }
    ];

    const config = window.birthdayConfig || (typeof birthdayConfig !== 'undefined' ? birthdayConfig : null) || {
        name: "Sayang",
        sender: "Orang yang Mencintaimu",
        birthdayMessage: "Selamat Ulang Tahun!",
        song: { title: "Lagu Spesial Untukmu ♡", artist: "Melodi Indah Kita", src: "music.mp3", cover: "photos/photo1.jpg" },
        photos: defaultPhotos,
        surprisePhoto: "photos/photo1.jpg"
    };

    // Guarantee config.photos is populated
    if (!config.photos || config.photos.length === 0) {
        config.photos = defaultPhotos;
    }

    let audioContext = null;
    let isPlaying = false;
    let typewriterTimer = null;

    // DOM Elements
    const views = {
        opening: document.getElementById('view-opening'),
        menu: document.getElementById('view-menu'),
        photos: document.getElementById('view-photos'),
        song: document.getElementById('view-song'),
        message: document.getElementById('view-message'),
        game: document.getElementById('view-game')
    };

    const globalBackBtn = document.getElementById('global-back-btn');
    const bgAudio = document.getElementById('bg-audio');

    // Image Path Candidate Fallback Resolver
    function setupImgFallback(imgElement, initialUrl) {
        if (!imgElement) return;
        const filename = (initialUrl || '').split('/').pop() || 'photo1.jpg';
        const candidates = [
            initialUrl,
            'photos/' + filename,
            'public/photos/' + filename,
            './photos/' + filename,
            './public/photos/' + filename
        ];
        let attemptIndex = 0;

        imgElement.src = candidates[0] || 'photos/photo1.jpg';
        imgElement.onerror = () => {
            attemptIndex++;
            if (attemptIndex < candidates.length) {
                imgElement.src = candidates[attemptIndex];
            }
        };
    }

    // -------------------------------------------------------------
    // 2. SYNTHESIZED SOUND EFFECTS (WEB AUDIO API)
    // -------------------------------------------------------------
    function playClickSound() {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 0.06);

            gain.gain.setValueAtTime(0.12, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.start();
            osc.stop(audioContext.currentTime + 0.06);
        } catch (e) {
            // Audio context fallback silent
        }
    }

    // Global Event Delegation for Click Sounds
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('button, .menu-card, .polaroid-card, .ctrl-btn, .nav-back-btn, .btn-game-ctrl')) {
            playClickSound();
        }
    });

    // -------------------------------------------------------------
    // 3. SPA NAVIGATION ROUTER
    // -------------------------------------------------------------
    let currentView = 'opening';

    function switchView(viewName) {
        if (!views[viewName]) return;

        // Hide all views
        Object.keys(views).forEach(key => {
            views[key].classList.remove('active');
        });

        // Activate target view with animation
        setTimeout(() => {
            views[viewName].classList.add('active');
            currentView = viewName;

            // Header Back Button visibility
            if (viewName === 'photos' || viewName === 'song' || viewName === 'message' || viewName === 'game') {
                globalBackBtn.style.display = 'inline-flex';
            } else {
                globalBackBtn.style.display = 'none';
            }

            // View-specific actions
            if (viewName === 'message') {
                startTypewriterLetter();
            } else if (viewName === 'photos') {
                renderGallery();
            }

            // Trigger Typography Animations for Active Page
            triggerViewTypography(viewName);
        }, 50);
    }

    // Event Listeners for Navigation
    document.getElementById('btn-continue').addEventListener('click', () => {
        triggerLoadingScreen(() => switchView('menu'));
    });

    document.getElementById('card-photo').addEventListener('click', () => switchView('photos'));
    document.getElementById('card-song').addEventListener('click', () => switchView('song'));
    document.getElementById('card-message').addEventListener('click', () => switchView('message'));
    const cardGame = document.getElementById('card-game');
    if (cardGame) cardGame.addEventListener('click', () => switchView('game'));

    globalBackBtn.addEventListener('click', () => {
        switchView('menu');
    });
    document.querySelectorAll('.nav-back-to-menu-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView('menu'));
    });

    // -------------------------------------------------------------
    // 4. MEMORIES / PHOTO GALLERY GENERATION
    // -------------------------------------------------------------
    const galleryGrid = document.getElementById('gallery-grid');
    const photoModal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const modalDetail = document.getElementById('modal-detail');
    const modalClose = document.getElementById('modal-close');

    function renderGallery() {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        
        const photosToRender = (config.photos && config.photos.length > 0) ? config.photos : defaultPhotos;

        photosToRender.forEach((photo, index) => {
            const card = document.createElement('div');
            card.className = 'polaroid-card';
            card.innerHTML = `
                <div class="polaroid-img-box">
                    <img id="gallery-img-${index}" alt="Momen ${index + 1}" loading="lazy">
                </div>
                <div class="polaroid-footer">
                    <span class="polaroid-caption">${photo.caption || 'Momen Indah Kita ♡'}</span>
                    <button class="heart-btn" title="Sukai">♡</button>
                </div>
            `;

            galleryGrid.appendChild(card);

            const imgElement = card.querySelector('img');
            setupImgFallback(imgElement, photo.url);

            // Open Modal on Card Click
            card.addEventListener('click', (e) => {
                // Ignore if clicked directly on heart button
                if (e.target.classList.contains('heart-btn')) {
                    e.stopPropagation();
                    e.target.innerText = e.target.innerText === '♡' ? '♥' : '♡';
                    return;
                }
                openPhotoModal(photo);
            });
        });
    }

    function openPhotoModal(photo) {
        setupImgFallback(modalImg, photo.url);
        modalCaption.textContent = photo.caption || 'Momen Indah Kita';
        modalDetail.textContent = photo.detail || photo.date || 'Setiap momen bersamamu tak pernah tergantikan.';
        photoModal.classList.add('active');
    }

    modalClose.addEventListener('click', () => photoModal.classList.remove('active'));
    photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal) photoModal.classList.remove('active');
    });

    // -------------------------------------------------------------
    // 5. RETRO MUSIC PLAYER LOGIC
    // -------------------------------------------------------------
    const albumCoverImg = document.getElementById('player-cover-img');
    const albumArtBox = document.getElementById('album-art-box');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const btnPlay = document.getElementById('btn-play');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const timeCurrent = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    const equalizerBar = document.getElementById('equalizer-bar');
    const btnFavorite = document.getElementById('btn-favorite');

    function initPlayer() {
        const songData = config.song || {};
        playerTitle.textContent = songData.title || "Lagu Spesial Untukmu ♡";
        playerArtist.textContent = songData.artist || "Melodi Indah Kita";
        
        const coverUrl = songData.cover || (config.photos[0] ? config.photos[0].url : 'photos/photo1.jpg');
        setupImgFallback(albumCoverImg, coverUrl);

        // Audio path candidates handling
        const audioSrc = songData.src || "music.mp3";
        bgAudio.src = audioSrc;

        bgAudio.onerror = () => {
            if (bgAudio.src.includes('public/')) {
                bgAudio.src = 'music.mp3';
            } else {
                bgAudio.src = 'public/music.mp3';
            }
        };
    }

    function togglePlay() {
        if (bgAudio.paused) {
            bgAudio.play().then(() => {
                isPlaying = true;
                btnPlay.textContent = '❚❚';
                albumArtBox.classList.add('playing');
                equalizerBar.classList.add('playing');
            }).catch(err => {
                console.log('Audio playback prevented or missing file:', err);
                isPlaying = !isPlaying;
                btnPlay.textContent = isPlaying ? '❚❚' : '▶';
                albumArtBox.classList.toggle('playing', isPlaying);
                equalizerBar.classList.toggle('playing', isPlaying);
            });
        } else {
            bgAudio.pause();
            isPlaying = false;
            btnPlay.textContent = '▶';
            albumArtBox.classList.remove('playing');
            equalizerBar.classList.remove('playing');
        }
    }

    btnPlay.addEventListener('click', togglePlay);

    // Audio progress update
    bgAudio.addEventListener('timeupdate', () => {
        if (bgAudio.duration) {
            const pct = (bgAudio.currentTime / bgAudio.duration) * 100;
            progressFill.style.width = `${pct}%`;
            timeCurrent.textContent = formatTime(bgAudio.currentTime);
            timeTotal.textContent = formatTime(bgAudio.duration);
        }
    });

    bgAudio.addEventListener('ended', () => {
        isPlaying = false;
        btnPlay.textContent = '▶';
        albumArtBox.classList.remove('playing');
        equalizerBar.classList.remove('playing');
        progressFill.style.width = '0%';
    });

    // Seek functionality
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (bgAudio.duration) {
            bgAudio.currentTime = (clickX / width) * bgAudio.duration;
        }
    });

    btnFavorite.addEventListener('click', () => {
        btnFavorite.textContent = btnFavorite.textContent === '♡' ? '♥' : '♡';
        btnFavorite.style.color = btnFavorite.textContent === '♥' ? '#ff6b81' : '#181818';
    });

    function formatTime(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // -------------------------------------------------------------
    // ROCK-SOLID TYPOGRAPHY ANIMATION SYSTEM
    // -------------------------------------------------------------
    function animateTypography(element) {
        if (!element) return;
        element.classList.remove('animate-typo-enter');
        void element.offsetWidth; // Force CSS reflow to re-trigger animation cleanly
        element.classList.add('animate-typo-enter');
    }

    function triggerViewTypography(viewName) {
        if (viewName === 'opening') {
            animateTypography(document.getElementById('opening-title'));
            animateTypography(document.getElementById('opening-subtitle'));
            startCountdownTimer();
        } else if (viewName === 'menu') {
            animateTypography(document.getElementById('menu-title'));
            animateTypography(document.getElementById('menu-subtitle'));
            animateTypography(document.getElementById('surprise-prompt'));
        } else if (viewName === 'photos') {
            animateTypography(document.getElementById('photos-title'));
        } else if (viewName === 'song') {
            animateTypography(document.getElementById('player-title'));
            animateTypography(document.getElementById('player-artist'));
        } else if (viewName === 'message') {
            animateTypography(document.getElementById('letter-salutation'));
            animateTypography(document.getElementById('signature-name-text'));
        } else if (viewName === 'game') {
            animateTypography(document.getElementById('game-title'));
            initWheelGame();
        }
    }

    // -------------------------------------------------------------
    // 6. TYPEWRITER EFFECT FOR BIRTHDAY LETTER
    // -------------------------------------------------------------
    const letterSalutation = document.getElementById('letter-salutation');
    const letterBodyText = document.getElementById('letter-body-text');
    const signatureNameText = document.getElementById('signature-name-text');

    function startTypewriterLetter() {
        letterSalutation.textContent = `Untukmu yang Terkasih, ${config.name}`;
        signatureNameText.textContent = `${config.sender} ♡`;
        letterBodyText.innerHTML = '<span class="typing-cursor"></span>';

        if (typewriterTimer) clearInterval(typewriterTimer);

        const text = config.birthdayMessage || "Selamat Ulang Tahun!";
        let index = 0;
        let currentTyped = '';

        typewriterTimer = setInterval(() => {
            if (index < text.length) {
                currentTyped += text.charAt(index);
                letterBodyText.innerHTML = currentTyped + '<span class="typing-cursor"></span>';
                index++;
            } else {
                clearInterval(typewriterTimer);
                letterBodyText.innerHTML = currentTyped;
            }
        }, 28);
    }

    // -------------------------------------------------------------
    // 7. GRAND FINALE SURPRISE (CONFETTI & HEARTS EXPLOSION)
    // -------------------------------------------------------------
    const btnOpenSurprise = document.getElementById('btn-open-surprise');
    const flashOverlay = document.getElementById('flash-overlay');
    const finaleModal = document.getElementById('finale-modal');
    const finalePhoto = document.getElementById('finale-photo');
    const finaleHeading = document.getElementById('finale-heading');
    const finaleMessage = document.getElementById('finale-message');
    const finaleClose = document.getElementById('finale-close');
    const finaleDoneBtn = document.getElementById('finale-done-btn');

    btnOpenSurprise.addEventListener('click', triggerGrandFinale);

    function triggerGrandFinale() {
        // Screen Flash Effect
        flashOverlay.classList.add('active');
        setTimeout(() => flashOverlay.classList.remove('active'), 400);

        // Confetti Explosion
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
            });

            setTimeout(() => {
                confetti({
                    particleCount: 60,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
                confetti({
                    particleCount: 60,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });
            }, 300);
        }

        // Spawn Heart Burst
        spawnHeartBurst(30);

        // Setup Finale Modal Content
        const surpriseImg = config.surprisePhoto || (config.photos[0] ? config.photos[0].url : 'photos/photo1.jpg');
        setupImgFallback(finalePhoto, surpriseImg);
        finaleHeading.textContent = `SELAMAT ULANG TAHUN, ${config.name.toUpperCase()}! 🎉`;
        finaleMessage.textContent = config.finalSurpriseText || "Semoga di hari yang indah ini, hatimu selalu dipenuhi kebahagiaan dan senyuman manis yang tak pernah pudar. Selamat ulang tahun ya, sayangku! ♡";

        animateTypography(finaleHeading, 'char');
        animateTypography(finaleMessage, 'word');

        setTimeout(() => {
            finaleModal.classList.add('active');
        }, 500);
    }

    function spawnHeartBurst(count) {
        const container = document.getElementById('floating-hearts-container');
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'floating-heart';
                heart.textContent = ['♡', '♥', '✨', '🌸'][Math.floor(Math.random() * 4)];
                heart.style.left = `${Math.random() * 100}%`;
                heart.style.animationDuration = `${3 + Math.random() * 4}s`;
                heart.style.fontSize = `${16 + Math.random() * 16}px`;
                container.appendChild(heart);

                setTimeout(() => heart.remove(), 7000);
            }, i * 100);
        }
    }

    finaleClose.addEventListener('click', () => finaleModal.classList.remove('active'));
    finaleDoneBtn.addEventListener('click', () => finaleModal.classList.remove('active'));

    // Periodic subtle background floating hearts
    setInterval(() => spawnHeartBurst(2), 2500);

    // -------------------------------------------------------------
    // 8. BACKGROUND PARTICLES CANVAS
    // -------------------------------------------------------------
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedY = - (Math.random() * 0.4 + 0.1);
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.y += this.speedY;
            if (this.y < 0) this.reset();
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 45; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // -------------------------------------------------------------
    // 9. SPIN WHEEL CINTA ENGINE ("Roda Keberuntungan Cinta")
    // -------------------------------------------------------------
    const wheelCanvas = document.getElementById('wheel-canvas');
    const btnSpinWheel = document.getElementById('btn-spin-wheel');
    const wheelSpinCenterBtn = document.getElementById('wheel-spin-center-btn');
    const wheelStatusText = document.getElementById('wheel-status-text');
    const wheelResultBox = document.getElementById('wheel-result-box');
    const wheelResultIcon = document.getElementById('wheel-result-icon');
    const wheelResultTitle = document.getElementById('wheel-result-title');
    const wheelResultQuote = document.getElementById('wheel-result-quote');
    const wheelClaimPrizeBtn = document.getElementById('wheel-claim-prize-btn');

    const rewardModal = document.getElementById('reward-modal');
    const rewardClose = document.getElementById('reward-close');
    const rewardHeading = document.getElementById('reward-heading');
    const rewardWonText = document.getElementById('reward-won-text');
    const rewardClaimBtn = document.getElementById('reward-claim-btn');
    const rewardReplayBtn = document.getElementById('reward-replay-btn');

    const wheelSlices = [
        {
            label: 'Pelukan 24/7',
            icon: '🤗',
            color: '#ff758c',
            quote: `Garansi pelukan hangat gratis 24 jam sehari untuk ${config.name}, berlaku selamanya! 🤗💕`
        },
        {
            label: 'Jajan Es Krim',
            icon: '🍦',
            color: '#ffd166',
            quote: `Bebas pilih es krim & makanan enak kesukaan ${config.name} hari ini, ${config.sender} yang bayar! 🍨😋`
        },
        {
            label: 'Gombalan Manis',
            icon: '💌',
            color: '#06d6a0',
            quote: `Dunia ini emang luas banget, tapi tempat terindahku tetep cuma di samping ${config.name}! 🌌🥰`
        },
        {
            label: 'Ratu Sehari',
            icon: '👑',
            color: '#38bdf8',
            quote: `Permintaan manis ${config.name} hari ini adalah perintah yang wajib dituruti! 👑✨`
        },
        {
            label: 'Cinta Unlimited',
            icon: '💖',
            color: '#a855f7',
            quote: `Cintaku ke ${config.name} itu meluap dari bumi sampai ke bintang-bintang! 🤭💗`
        },
        {
            label: 'Kencan Bebas',
            icon: '🎬',
            color: '#ff9f43',
            quote: `Kamu bebas tentukan tempat kencan & film yang mau ditonton berikutnya, no debat! 🍿🎉`
        },
        {
            label: 'Bebas Minta',
            icon: '🎁',
            color: '#e84393',
            quote: `Bebas minta 1 keinginan khusus hari ini dan bakal langsung dikabulkan! 🎁✨`
        },
        {
            label: 'Pusat Manja',
            icon: '🧸',
            color: '#00bec4',
            quote: `Hak istimewa dimanja-manja sepuasnya tanpa batas hari ini & selamanya! 🧸💖`
        }
    ];

    let currentRotation = 0; // in radians
    let isSpinning = false;
    let lastWonQuote = '';
    let lastWonIcon = '🎁';
    let lastWonLabel = 'SPESIAL ULANG TAHUN';

    function drawWheel() {
        if (!wheelCanvas) return;
        const ctx = wheelCanvas.getContext('2d');
        const width = wheelCanvas.width;
        const height = wheelCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 8;
        const sliceCount = wheelSlices.length;
        const sliceAngle = (2 * Math.PI) / sliceCount;

        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentRotation);

        // Draw Slices
        for (let i = 0; i < sliceCount; i++) {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const slice = wheelSlices[i];

            // Slice background
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = slice.color;
            ctx.fill();

            ctx.lineWidth = 3;
            ctx.strokeStyle = '#181818';
            ctx.stroke();

            // Draw Icon + Label
            ctx.save();
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            // Emoji Icon
            ctx.font = '22px Arial, sans-serif';
            ctx.fillText(slice.icon, radius - 16, 0);

            // Label Text
            ctx.fillStyle = '#181818';
            ctx.font = 'bold 13px "Mali", cursive, sans-serif';
            ctx.fillText(slice.label, radius - 46, 0);

            ctx.restore();
        }

        // Draw Outer Rim Accent
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#181818';
        ctx.stroke();

        ctx.restore();
    }

    function spinWheel() {
        if (isSpinning) return;
        isSpinning = true;

        if (wheelResultBox) wheelResultBox.classList.add('hidden');
        if (wheelStatusText) wheelStatusText.textContent = "Sedang memutar... Semoga dapet yang paling manis! 🤞💖";

        playClickSound();

        const sliceCount = wheelSlices.length;
        const sliceAngle = (2 * Math.PI) / sliceCount;
        
        // Pick random winning index
        const winningIndex = Math.floor(Math.random() * sliceCount);
        const prize = wheelSlices[winningIndex];

        // Target angle logic: top pointer is at -Math.PI / 2 (270 deg)
        const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
        const baseTargetRotation = -Math.PI / 2 - targetSliceCenter;

        // Add 5 to 7 full 360 deg spins for dramatic effect
        const fullSpins = (5 + Math.floor(Math.random() * 2)) * 2 * Math.PI;
        
        // Normalize currentRotation to [0, 2PI)
        const normalizedCurrent = currentRotation % (2 * Math.PI);
        let rotationDistance = (baseTargetRotation - normalizedCurrent) % (2 * Math.PI);
        if (rotationDistance <= 0) rotationDistance += 2 * Math.PI;

        const totalRotationToGo = fullSpins + rotationDistance;
        const startRotation = currentRotation;
        const endRotation = currentRotation + totalRotationToGo;

        const duration = 3800; // ms
        const startTime = performance.now();

        function animateSpin(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Cubic ease out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            currentRotation = startRotation + totalRotationToGo * easeProgress;

            drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animateSpin);
            } else {
                isSpinning = false;
                currentRotation = endRotation;
                drawWheel();
                onWheelSpinFinished(prize);
            }
        }

        requestAnimationFrame(animateSpin);
    }

    function onWheelSpinFinished(prize) {
        lastWonQuote = prize.quote;
        lastWonIcon = prize.icon || '🎁';
        lastWonLabel = prize.label || 'SPESIAL ULANG TAHUN';

        if (wheelStatusText) wheelStatusText.textContent = "Horee! Rodanya berhenti! 🎉";

        spawnHeartBurst(30);
        if (typeof confetti === 'function') {
            confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        }

        // Directly pop up the modal after 450ms
        setTimeout(() => {
            openRewardModalWithPrize();
        }, 450);
    }

    function openRewardModalWithPrize() {
        const rewardGiftIcon = document.getElementById('reward-gift-icon');
        const rewardGiftTag = document.getElementById('reward-gift-tag');

        if (rewardGiftIcon) rewardGiftIcon.textContent = lastWonIcon || '🎁';
        if (rewardGiftTag) rewardGiftTag.textContent = lastWonLabel ? `HADIAH: ${lastWonLabel.toUpperCase()}` : 'SPESIAL ULANG TAHUN';

        if (rewardWonText) {
            rewardWonText.textContent = lastWonQuote ? `"${lastWonQuote}"` : `"Garansi pelukan hangat gratis 24 jam sehari! 🤗💕"`;
        }
        if (rewardModal) {
            rewardModal.classList.add('active');
            if (rewardHeading) animateTypography(rewardHeading, 'char');
        }
    }

    if (btnSpinWheel) btnSpinWheel.addEventListener('click', spinWheel);
    if (wheelSpinCenterBtn) wheelSpinCenterBtn.addEventListener('click', spinWheel);
    if (wheelClaimPrizeBtn) wheelClaimPrizeBtn.addEventListener('click', openRewardModalWithPrize);

    if (rewardClose) {
        rewardClose.addEventListener('click', () => {
            if (rewardModal) rewardModal.classList.remove('active');
        });
    }

    if (rewardReplayBtn) {
        rewardReplayBtn.addEventListener('click', () => {
            if (rewardModal) rewardModal.classList.remove('active');
            spinWheel();
        });
    }

    if (rewardClaimBtn) {
        rewardClaimBtn.addEventListener('click', () => {
            spawnHeartBurst(40);
            if (typeof confetti === 'function') {
                confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
            }
            rewardClaimBtn.textContent = "BERHASIL DIKLAIM! 💕";
            rewardClaimBtn.style.background = "#06d6a0";
            rewardClaimBtn.style.color = "#ffffff";
            setTimeout(() => {
                if (rewardModal) rewardModal.classList.remove('active');
            }, 1400);
        });
    }

    function initWheelGame() {
        drawWheel();
    }

    // -------------------------------------------------------------
    // COUNTDOWN TIMER TO 24 OCTOBER 2026 LOGIC
    // -------------------------------------------------------------
    const cntDays = document.getElementById('cnt-days');
    const cntHours = document.getElementById('cnt-hours');
    const cntMinutes = document.getElementById('cnt-minutes');
    const cntSeconds = document.getElementById('cnt-seconds');
    const countdownTitle = document.getElementById('countdown-title');
    let countdownIntervalId = null;

    function startCountdownTimer() {
        const targetStr = config.targetDate || "2026-10-24T00:00:00";
        const targetTime = new Date(targetStr).getTime();

        function updateTicker() {
            const now = new Date().getTime();
            const diff = targetTime - now;

            if (diff <= 0) {
                if (cntDays) cntDays.textContent = '00';
                if (cntHours) cntHours.textContent = '00';
                if (cntMinutes) cntMinutes.textContent = '00';
                if (cntSeconds) cntSeconds.textContent = '00';
                if (countdownTitle) countdownTitle.textContent = "🎉 HARI INI HARI ULANG TAHUNMU! 🎉";
                if (countdownIntervalId) clearInterval(countdownIntervalId);
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            if (cntDays) cntDays.textContent = String(d).padStart(2, '0');
            if (cntHours) cntHours.textContent = String(h).padStart(2, '0');
            if (cntMinutes) cntMinutes.textContent = String(m).padStart(2, '0');
            if (cntSeconds) cntSeconds.textContent = String(s).padStart(2, '0');
        }

        updateTicker();
        if (countdownIntervalId) clearInterval(countdownIntervalId);
        countdownIntervalId = setInterval(updateTicker, 1000);
    }

    // -------------------------------------------------------------
    // CUTE SCRAPBOOK LOADING SCREEN OVERLAY LOGIC
    // -------------------------------------------------------------
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingBarFill = document.getElementById('loading-bar-fill');
    const loadingStatusText = document.getElementById('loading-status-text');

    function triggerLoadingScreen(onComplete) {
        if (!loadingOverlay) {
            if (onComplete) onComplete();
            return;
        }

        loadingOverlay.classList.add('active');
        if (loadingBarFill) loadingBarFill.style.width = '0%';
        if (loadingStatusText) loadingStatusText.textContent = "Memuat foto kenangan & lagu romantis ♡";

        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            if (loadingBarFill) loadingBarFill.style.width = `${progress}%`;

            if (progress === 30 && loadingStatusText) {
                loadingStatusText.textContent = "Menyiapkan lagu & keindahan... ✨";
            } else if (progress === 70 && loadingStatusText) {
                loadingStatusText.textContent = "Membuka pintu kejutan spesial... 💖";
            }

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loadingOverlay.classList.remove('active');
                    if (onComplete) onComplete();
                }, 200);
            }
        }, 80);
    }

    // -------------------------------------------------------------
    // GLOBAL SCROLL FORWARDING (Scrolling outside frame forwards scroll)
    // -------------------------------------------------------------
    window.addEventListener('wheel', (e) => {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            if (!e.target.closest('.modal-content')) {
                activeModal.scrollTop += e.deltaY;
            }
            return;
        }

        const activeView = document.querySelector('.view-section.active');
        if (activeView && !e.target.closest('.view-section')) {
            activeView.scrollTop += e.deltaY;
        }
    }, { passive: true });

    // -------------------------------------------------------------
    // INITIALIZATION RUN
    // -------------------------------------------------------------
    renderGallery();
    initPlayer();
    initWheelGame();
    startCountdownTimer();
    triggerViewTypography('opening');
});
