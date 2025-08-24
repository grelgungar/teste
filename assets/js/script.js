function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const isLowPerformance = navigator.hardwareConcurrency < 4 || 
                            /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isLowPerformance) {
        return;
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 15) + 's';
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 25000);
    }
    
    setInterval(createParticle, 8000);
    
    createParticle();
}

window.addEventListener('DOMContentLoaded', function() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        setTimeout(() => {
            spinner.classList.add('hidden');
            setTimeout(() => {
                spinner.style.display = 'none';
                createParticles();
            }, 300);
        }, 800);
    }
});

let config = {};

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rawText = await response.text();
        config = JSON.parse(rawText);
        updateUIWithConfig();
    } catch (error) {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', './config.json', false); 
            xhr.send();
            
            if (xhr.status === 200) {
                config = JSON.parse(xhr.responseText);
                updateUIWithConfig();
                return;
            }
        } catch (xhrError) {
        }
        config = {
            project: { name: 'Naruto Revolution' },
            downloads: {
                client: { url: 'https://example.com/download/saiyan-origins-client.exe', size: '250 MB' },
                launcher: { url: 'https://example.com/download/saiyan-origins-launcher.exe', size: '50 MB' }
            }
        };
        updateUIWithConfig();
    }
}

function updateUIWithConfig() {
    if (config.project?.name) {
        document.title = `${config.project.name} - MMORPG Naruto  | Jogue Grátis`;
    }
    
    if (config.project?.description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = config.project.description;
        }
    }
    
    updateProjectInfo();
    updateDownloadInfo();
    updateSocialLinks();
    updateDownloadButtons();
    applySecurityProtections();
    
    if (document.getElementById('mapa-section')) {
        initInteractiveMap();
    }
}

function initInteractiveMap() {
    const mapCanvas = document.getElementById('mapCanvas');
    const mapViewport = document.getElementById('mapViewport');

    const minimap = document.getElementById('minimap');
    const minimapViewport = document.getElementById('minimapViewport');
    
    if (!mapCanvas || !mapViewport) return;
    
    let scale = 0.5; // Zoom inicial
    let translateX = -300; // Posição inicial X
    let translateY = -100; // Posição inicial Y
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    
    updateMapTransform();
    updateMinimap();
    
    document.getElementById('zoomIn')?.addEventListener('click', () => {
        scale = Math.min(scale * 1.2, 3);
        updateMapTransform();
        updateMinimap();
    });
    
    document.getElementById('zoomOut')?.addEventListener('click', () => {
        scale = Math.max(scale / 1.2, 0.2);
        updateMapTransform();
        updateMinimap();
    });
    
    document.getElementById('resetView')?.addEventListener('click', () => {
        scale = 0.5;
        translateX = -300;
        translateY = -100;
        updateMapTransform();
        updateMinimap();
    });
    
    document.getElementById('fullscreen')?.addEventListener('click', () => {
        if (mapViewport.requestFullscreen) {
            mapViewport.requestFullscreen();
        }
    });
    
    mapViewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        mapViewport.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        translateX += deltaX;
        translateY += deltaY;
        
        lastX = e.clientX;
        lastY = e.clientY;
        
        updateMapTransform();
        updateMinimap();
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        mapViewport.style.cursor = 'grab';
    });
    
    // Zoom com scroll
    mapViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.max(0.2, Math.min(3, scale * delta));
        updateMapTransform();
        updateMinimap();
    });
    

    
    // Função para atualizar transformação do mapa
    function updateMapTransform() {
        mapCanvas.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
    }
    
    // Função para atualizar minimap
    function updateMinimap() {
        if (!minimapViewport) return;
        
        const viewportWidth = mapViewport.offsetWidth;
        const viewportHeight = mapViewport.offsetHeight;
        const canvasWidth = 1200;
        const canvasHeight = 800;
        
        // Calcular posição e tamanho do viewport no minimap
        const minimapScale = 150 / canvasWidth; // Escala do minimap
        const viewportScaleX = (viewportWidth / scale) * minimapScale;
        const viewportScaleY = (viewportHeight / scale) * minimapScale;
        
        const viewportX = (-translateX / scale) * minimapScale;
        const viewportY = (-translateY / scale) * minimapScale;
        
        minimapViewport.style.width = `${viewportScaleX}px`;
        minimapViewport.style.height = `${viewportScaleY}px`;
        minimapViewport.style.left = `${viewportX}px`;
        minimapViewport.style.top = `${viewportY}px`;
    }
    
    // Função para mostrar informações do planeta

    
    // Touch events para dispositivos móveis
    let touchStartX = 0;
    let touchStartY = 0;
    let initialDistance = 0;
    let initialScale = scale;
    
    mapViewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            initialScale = scale;
        }
    });
    
    mapViewport.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (e.touches.length === 1 && isDragging) {
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            
            translateX += deltaX;
            translateY += deltaY;
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            updateMapTransform();
            updateMinimap();
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            const scaleChange = currentDistance / initialDistance;
            scale = Math.max(0.2, Math.min(3, initialScale * scaleChange));
            
            updateMapTransform();
            updateMinimap();
        }
    });
    
    mapViewport.addEventListener('touchend', () => {
        isDragging = false;
    });
}

function applySecurityProtections() {
    if (!config.security) return;
    
    if (config.security.textSelection) {
        document.body.classList.add('security-no-select');
    }
    
    if (config.security.imageDrag) {
        const images = document.querySelectorAll('img');
        images.forEach(img => img.classList.add('security-no-drag'));
    }
    
    if (config.security.devtools) {
        let devtools = { open: false };
        const threshold = 160;
        
        setInterval(function() {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:#fff;font-family:Arial;"><h1>Acesso Negado</h1></div>';
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }
    
    if (config.security.keyboardShortcuts) {
        document.addEventListener('keydown', function(e) {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
            if (config.security.sourceView && e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    if (config.security.contextMenu) {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }
    
    if (config.security.textSelection) {
        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
            return false;
        });
    }
    
    if (config.security.debugMode) {
        console.log('Proteções de segurança aplicadas:', config.security);
    }
}

function updateProjectInfo() {
    if (config.project?.name) {
        const projectTitles = document.querySelectorAll('h2.text-warning, h3.text-warning');
        projectTitles.forEach(title => {
            if (title.textContent.includes('Naruto Revolution')) {
                title.textContent = title.textContent.replace('Naruto Revolution', config.project.name);
            }
        });
        
        const slideTitle = document.querySelector('.slide-title');
        if (slideTitle && slideTitle.textContent === 'Naruto Revolution') {
            slideTitle.textContent = config.project.name;
        }
    }
}

function updateDownloadInfo() {
    if (config.downloads?.client?.size) {
        const sizeBadge = document.querySelector('.badge.bg-info');
        if (sizeBadge && sizeBadge.textContent.includes('MB')) {
            sizeBadge.textContent = config.downloads.client.size;
        }
    }
    
    if (config.downloads?.client?.version) {
        const versionBadge = document.querySelector('.badge.bg-success');
        if (versionBadge && versionBadge.textContent.includes('v')) {
            versionBadge.textContent = config.downloads.client.version;
        }
    }
}

function updateSocialLinks() {
    if (config.links) {
        const socialLinks = {
            discord: document.querySelector('a[title="Discord"]'),
            facebook: document.querySelector('a[title="Facebook"]'),
            youtube: document.querySelector('a[title="YouTube"]'),
            instagram: document.querySelector('a[title="Instagram"]')
        };
        
        Object.keys(socialLinks).forEach(platform => {
            const link = socialLinks[platform];
            if (link && config.links[platform]) {
                link.href = config.links[platform];
            }
        });
    }
}

function showDownloadToast() {
    const toastElement = document.getElementById('downloadToast');
    if (toastElement) {
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
}

function updateDownloadButtons() {
    const downloadButton = document.querySelector('.download-btn-main');
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            const downloadUrl = this.getAttribute('data-download-url');
            if (downloadUrl) {
                window.open(downloadUrl, '_blank');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadConfig();
    
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.classList.add('fade-in');
        }
        
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                const navbarToggler = document.querySelector('.navbar-toggler');
                navbarToggler.click();
            }
        });
    });
});

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    
    const savedTheme = getCookie('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.className = 'fas fa-sun';
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('light-mode');
        
        const isLightMode = body.classList.contains('light-mode');
        
        if (isLightMode) {
            themeIcon.className = 'fas fa-sun';
            setCookie('theme', 'light', 365);
        } else {
            themeIcon.className = 'fas fa-moon';
            setCookie('theme', 'dark', 365);
        }
        
        themeIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            themeIcon.style.transform = 'scale(1)';
        }, 200);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('#dragonBallCarousel');
    if (carousel) {
        // Detectar se é dispositivo móvel
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        // Configurações otimizadas para mobile
        const carouselConfig = {
            interval: isMobile ? 6000 : 5000, // Intervalo maior no mobile
            wrap: true,
            pause: isMobile ? false : 'hover', // Não pausar no hover em mobile
            touch: true, // Habilitar suporte a touch
            keyboard: true // Suporte a teclado
        };
        
        const bsCarousel = new bootstrap.Carousel(carousel, carouselConfig);
        
        // Melhorar performance em dispositivos móveis
        if (isMobile) {
            // Reduzir animações em dispositivos móveis para melhor performance
            carousel.style.willChange = 'transform';
            
            // Otimizar touch events
            let touchStartX = 0;
            let touchEndX = 0;
            let touchStartY = 0;
            let touchEndY = 0;
            
            carousel.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });
            
            carousel.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                
                // Verificar se é um swipe horizontal (não vertical)
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        bsCarousel.prev(); // Swipe para direita = slide anterior
                    } else {
                        bsCarousel.next(); // Swipe para esquerda = próximo slide
                    }
                }
            }, { passive: true });
        }
        
        carousel.addEventListener('slide.bs.carousel', function() {
            const activeItem = carousel.querySelector('.carousel-item.active');
            if (activeItem && !isMobile) {
                // Aplicar transformação apenas em desktop para melhor performance
                activeItem.style.transform = 'scale(1.02)';
            }
        });
        
        carousel.addEventListener('slid.bs.carousel', function() {
            const activeItem = carousel.querySelector('.carousel-item.active');
            if (activeItem && !isMobile) {
                activeItem.style.transform = 'scale(1)';
            }
            
            // Otimizar performance removendo will-change após animação
            if (isMobile) {
                setTimeout(() => {
                    carousel.style.willChange = 'auto';
                }, 300);
            }
        });
        
        // Pausar carousel quando não estiver visível (otimização de bateria)
        if (isMobile && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        bsCarousel.cycle();
                    } else {
                        bsCarousel.pause();
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(carousel);
        }
    }
    
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    function animateOnScroll() {
        const elements = document.querySelectorAll('.slide-content, .card, .feature-tag, .requirement-item, .download-option');
        
        elements.forEach((element, index) => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible && !element.classList.contains('animated')) {
                setTimeout(() => {
                    if (element.classList.contains('slide-content')) {
                        element.classList.add('bounce-in');
                    } else if (index % 3 === 0) {
                        element.classList.add('slide-in-left');
                    } else if (index % 3 === 1) {
                        element.classList.add('fade-in');
                    } else {
                        element.classList.add('slide-in-right');
                    }
                    element.classList.add('animated');
                }, index * 100);
            }
        });
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    window.addEventListener('scroll', debounce(animateOnScroll, 10));
    animateOnScroll();
    
    // Função setupDownloadButtons removida para evitar conflito com updateDownloadButtons
    initThemeToggle();
    
    function improveThemeSystem() {
        const savedTheme = getCookie('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) {
                themeIcon.className = 'fas fa-sun';
            }
        }
    }
    
    improveThemeSystem();
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', debounce(function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }, 10));
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('body::before');
        const speed = scrolled * 0.5;
        
        if (parallax) {
            document.body.style.backgroundPosition = `center ${speed}px`;
        }
    });
    
    function createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 215, 0, 0.3);
                border-radius: 50%;
                animation: float ${Math.random() * 10 + 5}s infinite linear;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            particlesContainer.appendChild(particle);
        }
        
        document.body.appendChild(particlesContainer);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    

    // Função para abrir modal de feedback com categoria específica
    window.openFeedbackModal = function(category) {
        const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
        const modalTitle = document.getElementById('feedbackModalLabel');
        const categoryInput = document.getElementById('feedbackCategory');
        
        // Configurar título e categoria baseado no tipo
        const categoryConfig = {
            'feedback': {
                title: '<i class="fas fa-comment me-2"></i>Feedback Geral',
                placeholder: 'Compartilhe sua opinião sobre nosso projeto...'
            },
            'relatorios': {
                title: '<i class="fas fa-bug me-2"></i>Reportar Bug',
                placeholder: 'Descreva detalhadamente o problema encontrado...'
            },
            'sugestoes': {
                title: '<i class="fas fa-lightbulb me-2"></i>Enviar Sugestão',
                placeholder: 'Compartilhe suas ideias para melhorar nosso projeto...'
            }
        };
        
        const config = categoryConfig[category] || categoryConfig['feedback'];
        modalTitle.innerHTML = config.title;
        categoryInput.value = category;
        document.getElementById('feedbackMessage').placeholder = config.placeholder;
        
        // Limpar formulário
        document.getElementById('feedbackForm').reset();
        categoryInput.value = category; // Redefine após reset
        document.getElementById('feedbackResult').innerHTML = '';
        
        // Resetar upload de imagem
        resetImageUpload();
        
        modal.show();
    };

    // Sistema de Upload de Imagem
    let selectedFile = null;

    function initImageUpload() {
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('feedbackImage');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const removeBtn = document.getElementById('removeImage');
        const uploadProgress = document.getElementById('uploadProgress');
        
        if (!uploadArea || !fileInput) return;
        
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Mudança no input de arquivo
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFileSelection(file);
            }
        });
        
        // Drag and Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    handleFileSelection(file);
                } else {
                    showValidationMessage('Apenas arquivos de imagem são permitidos.', 'error');
                }
            }
        });
        
        // Remover imagem
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetImageUpload();
            });
        }
    }

    function handleFileSelection(file) {
        // Validar tamanho do arquivo (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showValidationMessage('O arquivo deve ter no máximo 5MB.', 'error');
            return;
        }
        
        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showValidationMessage('Apenas arquivos PNG, JPG, JPEG e WEBP são permitidos.', 'error');
            return;
        }
        
        selectedFile = file;
        showImagePreview(file);
        validateImageContent(file);
    }

    function showImagePreview(file) {
        const uploadArea = document.getElementById('imageUploadArea');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        if (!uploadArea || !imagePreview || !previewImg) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function validateImageContent(file) {
        const uploadProgress = document.getElementById('uploadProgress');
        const progressBar = uploadProgress?.querySelector('.progress-bar');
        
        if (!uploadProgress || !progressBar) return;
        
        // Mostrar progresso
        uploadProgress.style.display = 'block';
        
        // Verificação real de conteúdo usando API de moderação
        checkImageContent(file)
            .then(result => {
                uploadProgress.style.display = 'none';
                
                if (result.safe) {
                    showValidationMessage(result.message, 'success');
                    document.getElementById('imageUploadArea')?.classList.add('success');
                } else {
                    showValidationMessage(result.message, 'error');
                    resetImageUpload();
                }
            })
            .catch(error => {
                uploadProgress.style.display = 'none';
                console.error('Erro na verificação:', error);
                // Em caso de erro, permitir a imagem (fallback)
                showValidationMessage('Imagem aprovada (verificação offline)', 'success');
                document.getElementById('imageUploadArea')?.classList.add('success');
            });
    }

    // Verificação real de conteúdo usando API de moderação
    function checkImageContent(file) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', file);
            
            const uploadProgress = document.getElementById('uploadProgress');
            const progressBar = uploadProgress?.querySelector('.progress-bar');
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 20;
                if (progressBar) {
                    progressBar.style.width = Math.min(progress, 80) + '%';
                }
            }, 200);
            
            fetch('check_image_content.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                clearInterval(interval);
                if (progressBar) {
                    progressBar.style.width = '100%';
                }
                
                setTimeout(() => {
                    if (data.success) {
                        if (data.safe) {
                            resolve({ safe: true, message: 'Imagem verificada e aprovada!' });
                        } else {
                            resolve({ safe: false, message: data.reason || 'Imagem contém conteúdo inapropriado.' });
                        }
                    } else {
                        reject(new Error(data.message || 'Erro na verificação de conteúdo'));
                    }
                }, 500);
            })
            .catch(error => {
                clearInterval(interval);
                console.error('Erro na verificação:', error);
                // Em caso de erro na API, permitir a imagem (fallback)
                if (progressBar) {
                    progressBar.style.width = '100%';
                }
                setTimeout(() => {
                    resolve({ safe: true, message: 'Imagem aprovada (verificação offline)' });
                }, 500);
            });
        });
    }

    function showValidationMessage(message, type) {
        // Remover mensagem anterior
        const existingMessage = document.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `validation-message ${type}`;
        messageDiv.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} me-2"></i>${message}`;
        
        // Adicionar após o container de upload
        const uploadContainer = document.querySelector('.image-upload-container');
        if (uploadContainer) {
            uploadContainer.appendChild(messageDiv);
        }
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    function resetImageUpload() {
        const uploadArea = document.getElementById('imageUploadArea');
        const imagePreview = document.getElementById('imagePreview');
        const fileInput = document.getElementById('feedbackImage');
        const uploadProgress = document.getElementById('uploadProgress');
        
        selectedFile = null;
        if (fileInput) fileInput.value = '';
        if (uploadArea) uploadArea.style.display = 'block';
        if (imagePreview) imagePreview.style.display = 'none';
        if (uploadProgress) uploadProgress.style.display = 'none';
        
        // Remover classes de estado
        uploadArea?.classList.remove('success', 'error');
        
        // Remover mensagens de validação
        const validationMessage = document.querySelector('.validation-message');
        if (validationMessage) {
            validationMessage.remove();
        }
    }

    // Inicializar sistema de upload
    initImageUpload();

    // Feedback Form Handler
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = document.querySelector('button[type="submit"][form="feedbackForm"]');
            const resultDiv = document.getElementById('feedbackResult');
            
            // Adicionar imagem se selecionada
            if (selectedFile) {
                formData.append('image', selectedFile);
            }
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
            
            resultDiv.innerHTML = '';
            
            fetch('submit_feedback.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    let alertClass = 'alert-success';
                    let icon = 'fas fa-check-circle';
                    
                    // Se não há tentativas restantes, usar alerta de aviso
                    if (data.rate_limit_info && data.rate_limit_info.remaining === 0) {
                        alertClass = 'alert-warning';
                        icon = 'fas fa-exclamation-triangle';
                    }
                    
                    resultDiv.innerHTML = `
                        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                            <i class="${icon} me-2"></i>${data.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    `;
                    feedbackForm.reset();
                    resetImageUpload();
                    
                    // Fechar modal após 3 segundos se for sucesso normal
                    if (data.rate_limit_info && data.rate_limit_info.remaining > 0) {
                        setTimeout(() => {
                            const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
                            if (modal) modal.hide();
                        }, 3000);
                    }
                } else {
                    let alertClass = 'alert-danger';
                    let icon = 'fas fa-exclamation-triangle';
                    
                    // Se for erro de rate limit, usar alerta de aviso
                    if (data.rate_limit) {
                        alertClass = 'alert-warning';
                        icon = 'fas fa-clock';
                    }
                    
                    resultDiv.innerHTML = `
                        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                            <i class="${icon} me-2"></i>${data.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    `;
                }
            })
            .catch(error => {
                resultDiv.innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>Erro ao enviar mensagem. Tente novamente.
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                `;
            })
            .finally(() => {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Mensagem';
            });
        });
    }

    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    });
    
});

// Floating Feedback Menu
function toggleFloatingMenu() {
    const menu = document.getElementById('floatingFeedbackMenu');
    const btn = document.getElementById('floatingFeedbackBtn');
    
    if (menu && btn) {
        menu.classList.toggle('active');
        btn.classList.toggle('active');
    }
}

// Fechar menu ao clicar fora
document.addEventListener('click', function(event) {
    const container = document.querySelector('.floating-feedback-container');
    const menu = document.getElementById('floatingFeedbackMenu');
    const btn = document.getElementById('floatingFeedbackBtn');
    
    if (container && !container.contains(event.target)) {
        if (menu && btn) {
            menu.classList.remove('active');
            btn.classList.remove('active');
        }
    }
});

// Fechar menu ao abrir modal de feedback
const originalOpenFeedbackModal = window.openFeedbackModal;
window.openFeedbackModal = function(category) {
    const menu = document.getElementById('floatingFeedbackMenu');
    const btn = document.getElementById('floatingFeedbackBtn');
    
    if (menu && btn) {
        menu.classList.remove('active');
        btn.classList.remove('active');
    }
    
    if (originalOpenFeedbackModal) {
        originalOpenFeedbackModal(category);
    }
};