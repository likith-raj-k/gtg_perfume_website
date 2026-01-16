// Hamburger Menu
const hamburger = document.querySelector('.hamburger-menu');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const iconSpan = hamburger.querySelector('.material-symbols-outlined');
        if (iconSpan) {
            iconSpan.textContent = navLinks.classList.contains('active') ? 'close' : 'menu';
        }
    });
}

// Accordion Functionality
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');

        // Close all others
        document.querySelectorAll('.accordion-item').forEach(i => {
            i.classList.remove('active');
            const icon = i.querySelector('.accordion-icon');
            if (icon) icon.textContent = 'add';
        });

        // Toggle current
        if (!isActive) {
            item.classList.add('active');
            const icon = header.querySelector('.accordion-icon');
            if (icon) icon.textContent = 'remove';
        }
    });
});

// Subscription Box Toggle
const subRadios = document.querySelectorAll('input[name="subscription"]');
subRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        // Remove active class from all boxes
        document.querySelectorAll('.subscription-box').forEach(box => {
            box.classList.remove('active');
        });

        // Add active class to parent box
        const parentBox = e.target.closest('.subscription-box');
        if (parentBox) {
            parentBox.classList.add('active');
        }
        updateCartLink();
    });
});

// Fragrance Selection Logic and Cart Update
const fragranceContainers = document.querySelectorAll('.fragrance-options');

fragranceContainers.forEach(container => {
    const options = container.querySelectorAll('.fragrance-option');

    options.forEach(option => {
        option.addEventListener('click', () => {
            // Update selected state within this container only
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Handle Main Image Update for Single Subscription only (Visual feedback)
            // (Assuming simplified interaction where single sub controls main view)
            if (!container.hasAttribute('data-group')) {
                const nameElement = option.querySelector('.f-name');
                if (nameElement) {
                    const flavor = nameElement.textContent.trim();
                    if (mainProductImg) {
                        if (flavor === 'Original') mainProductImg.src = './assets/product_purple.png';
                        if (flavor === 'Lily') mainProductImg.src = './assets/product_pink.png';
                        if (flavor === 'Rose') mainProductImg.src = './assets/product_orange.png';
                    }
                }
            }
            updateCartLink();
        });
    });
});

// Cart Logic
const addToCartBtn = document.getElementById('add-to-cart-btn');

function updateCartLink() {
    if (!addToCartBtn) return;

    // 1. Identify Subscription Type
    const activeSub = document.querySelector('.subscription-box.active');
    if (!activeSub) return;

    let subType = 'unknown';
    const radio = activeSub.querySelector('input[name="subscription"]');
    if (radio) {
        if (radio.id === 'onetime-sub') subType = 'onetime';
        if (radio.id === 'single-sub') subType = 'single';
        if (radio.id === 'double-sub') subType = 'double';
    }

    // 2. Identify Selected Fragrance (in the active box)
    // For Double Sub, we might have 2 groups. Simplification: Take Group 1 or just "Original" if complex.
    // User requested "9 variations", implying 3 types * 3 fragrances. 
    // So we just take the first selected option in the active box.
    const selectedOption = activeSub.querySelector('.fragrance-option.selected .f-name');
    let fragrance = 'original'; // Default
    if (selectedOption) {
        fragrance = selectedOption.textContent.trim().toLowerCase();
    }

    // 3. Construct Link
    // Variations: onetime-original, onetime-lily, onetime-rose, single-original... etc. (9 total)
    const actionMap = {
        'onetime-original': '#cart-add-onetime-original',
        'onetime-lily': '#cart-add-onetime-lily',
        'onetime-rose': '#cart-add-onetime-rose',
        'single-original': '#cart-add-single-original',
        'single-lily': '#cart-add-single-lily',
        'single-rose': '#cart-add-single-rose',
        'double-original': '#cart-add-double-original', // Simplified for Double
        'double-lily': '#cart-add-double-lily',
        'double-rose': '#cart-add-double-rose'
    };

    const key = `${subType}-${fragrance}`;
    const targetLink = actionMap[key] || '#cart-error';

    // Update Console to show logic working (as requested for "functional" proof)
    console.log(`Cart Update: Type=${subType}, Fragrance=${fragrance} => Link=${targetLink}`);

    // Update Button (using custom attribute or clicking triggers nav)
    addToCartBtn.setAttribute('data-target', targetLink);
    addToCartBtn.onclick = () => {
        window.location.href = targetLink; // Dummy navigation
        console.log('Navigating to:', targetLink);
    };
}

// Initial Cart Update
updateCartLink();


// Stats Animation
const statsSection = document.querySelector('.stats-bar');
const statsNumbers = document.querySelectorAll('.stat-big');
let statsAnimated = false;

if (statsSection && statsNumbers.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                statsNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    animateValue(stat, 0, target, 2000);
                });
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start) + "%";
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}


// Gallery Interaction
const mainProductImg = document.getElementById('main-product-img');
const prevBtn = document.querySelector('.gallery-nav.prev');
const nextBtn = document.querySelector('.gallery-nav.next');
const dots = document.querySelectorAll('.pagination-dots .dot');
const allThumbnails = document.querySelectorAll('.thumb');

// Initialize gallery images from thumbnails
let galleryImages = [];
const uniqueThumbs = document.querySelectorAll('.thumbnail-row img');
uniqueThumbs.forEach(img => {
    galleryImages.push(img.src);
});

let currentIndex = 0;

function updateGallery(index) {
    if (index < 0) index = galleryImages.length - 1;
    if (index >= galleryImages.length) index = 0;

    currentIndex = index;

    // Update Main Image
    if (mainProductImg) {
        mainProductImg.style.opacity = '0';
        setTimeout(() => {
            mainProductImg.src = galleryImages[currentIndex];
            mainProductImg.style.opacity = '1';
        }, 200);
    }

    // Update Dots
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
    });

    // Update Thumbnails Styles
    allThumbnails.forEach((thumb, idx) => {
        thumb.style.borderColor = 'transparent';
        // Sync thumbnail highlight modulo length
        if (idx % galleryImages.length === currentIndex) {
            thumb.style.borderColor = 'var(--primary-color)';
        }
    });
}

// Event Listeners
if (prevBtn) prevBtn.addEventListener('click', () => updateGallery(currentIndex - 1));
if (nextBtn) nextBtn.addEventListener('click', () => updateGallery(currentIndex + 1));

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => updateGallery(index));
});

allThumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
        updateGallery(index % galleryImages.length);
    });
});

// Initialize
updateGallery(0);

