document.addEventListener("DOMContentLoaded", () => {

    // REVEAL
    const reveals = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); } });
    }, { threshold: 0.1 });
    reveals.forEach(el => io.observe(el));

    // NAV
    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("navMenu");
    menuBtn.addEventListener("click", () => menu.classList.toggle("active"));
    document.querySelectorAll("nav a").forEach(a => a.addEventListener("click", () => menu.classList.remove("active")));

    // CRYSTALS
    const field = document.getElementById("crystalField");
    for (let i = 0; i < 50; i++) {
        const c = document.createElement("div");
        c.className = "crystal " + (Math.random() > 0.5 ? "blue" : "purple");
        const size = 6 + Math.random() * 10;
        c.style.cssText = `left:${Math.random()*100}vw;top:${Math.random()*100}vh;width:${size}px;height:${size}px;animation-delay:${Math.random()*5}s;animation-duration:${3+Math.random()*4}s`;
        field.appendChild(c);
    }

    document.addEventListener("mousemove", (e) => {
        document.querySelectorAll(".crystal").forEach(c => {
            const rect = c.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width/2);
            const dy = e.clientY - (rect.top + rect.height/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 130) {
                c.style.transform = `translate(${dx*0.06}px,${dy*0.06}px) scale(2.2) rotate(45deg)`;
            }
        });
    });

    // ALARM ZONE
    const baseZone = document.querySelector(".base-zone");
    const alarm = document.getElementById("alarmOverlay");
    window.addEventListener("scroll", () => {
        if (!baseZone) return;
        const rect = baseZone.getBoundingClientRect();
        const inZone = rect.top < window.innerHeight/2 && rect.bottom > window.innerHeight/2;
        alarm.style.animation = inZone ? "alarmPulse 1.5s infinite" : "none";
        alarm.style.opacity = inZone ? "" : "0";
    });

    // STAR RATING
    let selectedStars = 0;
    const typeSelect = document.getElementById("inputType");
    const ratingGroup = document.getElementById("ratingGroup");
    const starBtns = document.querySelectorAll(".star-btn");

    typeSelect.addEventListener("change", () => {
        ratingGroup.style.display = typeSelect.value === "review" ? "block" : "none";
    });

    starBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedStars = parseInt(btn.dataset.val);
            starBtns.forEach(b => {
                b.classList.toggle("active", parseInt(b.dataset.val) <= selectedStars);
            });
        });
        btn.addEventListener("mouseenter", () => {
            const val = parseInt(btn.dataset.val);
            starBtns.forEach(b => b.classList.toggle("active", parseInt(b.dataset.val) <= val));
        });
    });
    document.getElementById("starRating").addEventListener("mouseleave", () => {
        starBtns.forEach(b => b.classList.toggle("active", parseInt(b.dataset.val) <= selectedStars));
    });

    // FORM SUBMIT
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx67M6RpQe96JRf83nqlDXgcLl75q0kcWZXjPMpDQJebglz-mxKIWCpNYrhCL8XMYePig/exec";

    document.getElementById("formSubmit").addEventListener("click", async () => {
        const name = document.getElementById("inputName").value.trim();
        const type = document.getElementById("inputType").value;
        const msg  = document.getElementById("inputMsg").value.trim();

        document.getElementById("inputName").style.borderColor = name ? "" : "rgba(255,100,100,0.5)";
        document.getElementById("inputType").style.borderColor = type ? "" : "rgba(255,100,100,0.5)";
        document.getElementById("inputMsg").style.borderColor  = msg  ? "" : "rgba(255,100,100,0.5)";
        if (!name || !type || !msg) return;

        const btn = document.getElementById("formSubmit");
        btn.textContent = "Отправляю…";
        btn.disabled = true;
        btn.style.opacity = "0.7";

        try {
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, type, stars: selectedStars || "—", message: msg })
            });
        } catch (err) {
            console.error("Ошибка отправки:", err);
        }

        document.getElementById("formContent").style.display = "none";
        document.getElementById("formSuccess").style.display = "block";
    });

    // AUDIO PLAYER
    document.querySelectorAll(".audio-track").forEach(track => {
        const audio      = track.querySelector("audio");
        const btn        = track.querySelector(".play-btn");
        const fill       = track.querySelector(".track-fill");
        const tCur       = track.querySelector(".t-cur");
        const tDur       = track.querySelector(".t-dur");
        const bar        = track.querySelector(".track-bar");
        const volSlider  = track.querySelector(".vol-slider");
        const iconPlay   = btn.querySelector(".icon-play");
        const iconPause  = btn.querySelector(".icon-pause");

        function fmt(s) {
            if (!isFinite(s)) return "—:——";
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return m + ":" + String(sec).padStart(2, "0");
        }

        audio.addEventListener("loadedmetadata", () => { tDur.textContent = fmt(audio.duration); });

        audio.addEventListener("timeupdate", () => {
            const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            fill.style.width = pct + "%";
            tCur.textContent = fmt(audio.currentTime);
        });

        audio.addEventListener("ended", () => {
            iconPlay.style.display = "";
            iconPause.style.display = "none";
            track.classList.remove("playing");
            fill.style.width = "0%";
            tCur.textContent = "0:00";
        });

        btn.addEventListener("click", () => {
            const isPlaying = !audio.paused;
            document.querySelectorAll(".audio-track").forEach(t => {
                if (t !== track) {
                    const a = t.querySelector("audio");
                    a.pause();
                    t.querySelector(".icon-play").style.display = "";
                    t.querySelector(".icon-pause").style.display = "none";
                    t.classList.remove("playing");
                }
            });
            if (isPlaying) {
                audio.pause();
                iconPlay.style.display = "";
                iconPause.style.display = "none";
                track.classList.remove("playing");
            } else {
                audio.play().catch(() => {});
                iconPlay.style.display = "none";
                iconPause.style.display = "";
                track.classList.add("playing");
            }
        });

        bar.addEventListener("click", (e) => {
            const rect = bar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (audio.duration) audio.currentTime = pct * audio.duration;
        });

        volSlider.addEventListener("input", () => { audio.volume = volSlider.value; });
    });

});