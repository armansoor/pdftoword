// js/features.js

// Confetti Effect
function triggerConfetti() {
    const colors = ['#ffb7b2', '#c7ceea', '#b5ead7', '#ffdac1', '#ff9aa2', '#e2f0cb'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.opacity = Math.random();

        document.body.appendChild(confetti);

        // Random Animation
        confetti.animate([
            { transform: 'translate3d(0,0,0)', opacity: 1 },
            { transform: `translate3d(${Math.random()*100 - 50}px, 100vh, 0)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1500,
            easing: 'cubic-bezier(0, .9, .57, 1)',
            delay: Math.random() * 200
        });

        setTimeout(() => confetti.remove(), 4000);
    }
}

// Modal Logic
const modal = {
    overlay: document.getElementById('preview-modal'),
    content: document.getElementById('modal-content'),
    confirmBtn: document.getElementById('modal-confirm'),
    cancelBtn: document.getElementById('modal-cancel'),

    show(images, onConfirm) {
        this.content.innerHTML = '';
        images.forEach(img => {
            const el = document.createElement('img');
            el.src = URL.createObjectURL(img);
            el.className = 'preview-img';
            this.content.appendChild(el);
        });

        this.overlay.classList.add('active');
        document.querySelector('.modal').classList.add('active'); // Ensure modal scales in

        // Remove old listeners to prevent stacking
        const newConfirm = this.confirmBtn.cloneNode(true);
        this.confirmBtn.parentNode.replaceChild(newConfirm, this.confirmBtn);
        this.confirmBtn = newConfirm;

        this.confirmBtn.addEventListener('click', () => {
            this.hide();
            onConfirm();
        });

        this.cancelBtn.onclick = () => this.hide();
    },

    hide() {
        this.overlay.classList.remove('active');
         document.querySelector('.modal').classList.remove('active');
    }
};

window.Features = {
    triggerConfetti,
    modal
};
