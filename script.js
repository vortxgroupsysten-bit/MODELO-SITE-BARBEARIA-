// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Barbearia Vintage - Site carregado');
    
    // ===== VARIÁVEIS GLOBAIS =====
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');
    const formAgendamento = document.getElementById('form-agendamento');
    const modal = document.getElementById('modal-confirmacao');
    const closeModal = document.querySelector('.close-modal');
    const btnModal = document.querySelector('.btn-modal');
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    const loadingSpinner = document.getElementById('loading');
    const currentYear = document.getElementById('current-year');
    const btnAgendarHeader = document.getElementById('btn-agendar-header');
    const btnServicos = document.querySelectorAll('.btn-servico');
    const formNewsletter = document.getElementById('form-newsletter');
    
    // ===== FUNÇÕES DE INICIALIZAÇÃO =====
    function init() {
        // Definir ano atual no footer
        if (currentYear) {
            currentYear.textContent = new Date().getFullYear();
        }
        
        // Configurar data mínima para agendamento (amanhã)
        setupDateInput();
        
        // Configurar máscara de telefone
        setupPhoneMask();
        
        // Ativar menu ativo baseado na rolagem
        setupScrollSpy();
        
        // Adicionar listeners
        addEventListeners();
        
        // Inicializar animações
        initAnimations();
    }
    
    // ===== CONFIGURAÇÃO DE INPUTS =====
    function setupDateInput() {
        const dataInput = document.getElementById('data');
        if (dataInput) {
            const hoje = new Date();
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            
            // Formatar para YYYY-MM-DD
            const hojeFormatado = hoje.toISOString().split('T')[0];
            const amanhaFormatado = amanha.toISOString().split('T')[0];
            
            dataInput.min = hojeFormatado;
            dataInput.value = amanhaFormatado;
        }
    }
    
    function setupPhoneMask() {
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                
                // Formatar como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
                if (value.length > 10) {
                    value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                } else if (value.length > 6) {
                    value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                } else if (value.length > 2) {
                    value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                } else if (value.length > 0) {
                    value = value.replace(/^(\d*)/, '($1');
                }
                
                e.target.value = value;
            });
        }
    }
    
    // ===== MENU MOBILE =====
    function toggleMobileMenu() {
        if (hamburger && navLinks) {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Bloquear scroll quando menu está aberto
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }
    
    function closeMobileMenu() {
        if (hamburger && navLinks) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ===== SCROLL SPY PARA MENU ATIVO =====
    function setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        
        function onScroll() {
            const scrollY = window.pageYOffset;
            
            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    if (navLink) {
                        navLink.classList.add('active');
                    }
                } else {
                    if (navLink) {
                        navLink.classList.remove('active');
                    }
                }
            });
        }
        
        window.addEventListener('scroll', onScroll);
        
        // Executar uma vez para definir estado inicial
        onScroll();
    }
    
    // ===== ANIMAÇÕES =====
    function initAnimations() {
        // Animar elementos ao rolar
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        // Observar elementos para animação
        const elementsToAnimate = document.querySelectorAll('.servico-card, .sobre-imagem, .info-card, .galeria-item');
        elementsToAnimate.forEach(el => observer.observe(el));
    }
    
    // ===== FUNÇÃO AUXILIAR PARA VALIDAR E-MAIL =====
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // ===== FORMULÁRIO DE AGENDAMENTO =====
    function handleAgendamentoSubmit(e) {
        e.preventDefault();
        
        // Coletar dados do formulário
        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const email = document.getElementById('email').value; // Agora opcional
        const servico = document.getElementById('servico').value;
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const barbeiro = document.getElementById('barbeiro').value;
        const preferencia = document.getElementById('preferencia').value;
        const mensagem = document.getElementById('mensagem').value;
        
        // Validação básica (apenas campos obrigatórios)
        if (!nome || !telefone || !servico || !data || !hora || !barbeiro) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Validação de e-mail se fornecido
        if (email && !isValidEmail(email)) {
            alert('Por favor, insira um e-mail válido ou deixe o campo em branco.');
            return;
        }
        
        // Mostrar loading
        if (loadingSpinner) {
            loadingSpinner.style.display = 'flex';
        }
        
        // Simular processamento (em um caso real, seria uma requisição AJAX)
        setTimeout(() => {
            // Esconder loading
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
            
            // Mostrar modal
            if (modal) {
                modal.style.display = 'flex';
            }
            
            // Limpar formulário
            formAgendamento.reset();
            
            // Resetar data para amanhã
            setupDateInput();
            
            // Resetar campos opcionais para valores padrão
            document.getElementById('preferencia').selectedIndex = 0;
            
            // Fechar menu mobile se estiver aberto
            closeMobileMenu();
        }, 1500);
    }
    
    // ===== BOTÕES DE SERVIÇOS =====
    function setupServicoButtons() {
        btnServicos.forEach(btn => {
            btn.addEventListener('click', function() {
                const servico = this.getAttribute('data-servico');
                
                // Rolar até o formulário
                document.getElementById('contato').scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Preencher o campo de serviço
                setTimeout(() => {
                    const servicoSelect = document.getElementById('servico');
                    if (servicoSelect) {
                        // Encontrar a opção correspondente
                        for (let i = 0; i < servicoSelect.options.length; i++) {
                            if (servicoSelect.options[i].text.includes(servico)) {
                                servicoSelect.selectedIndex = i;
                                break;
                            }
                        }
                        
                        // Dar foco ao formulário
                        document.getElementById('nome').focus();
                    }
                }, 800);
            });
        });
    }
    
    // ===== MODAL =====
    function showModal() {
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    function hideModal() {
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // ===== FORMULÁRIO NEWSLETTER =====
    function handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const emailInput = e.target.querySelector('input[type="email"]');
        
        if (emailInput && emailInput.value) {
            // Validar e-mail
            if (!isValidEmail(emailInput.value)) {
                alert('Por favor, insira um e-mail válido.');
                return;
            }
            
            // Simular envio
            if (loadingSpinner) {
                loadingSpinner.style.display = 'flex';
            }
            
            setTimeout(() => {
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
                
                alert('Obrigado por se inscrever em nossa newsletter! Em breve você receberá nossas ofertas especiais.');
                emailInput.value = '';
            }, 1000);
        }
    }
    
    // ===== ROLAGEM SUAVE =====
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') return;
                
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Calcular posição com offset do header
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Fechar menu mobile se estiver aberto
                    closeMobileMenu();
                }
            });
        });
    }
    
    // ===== BOTÃO AGENDAR HEADER =====
    function handleAgendarHeaderClick() {
        document.getElementById('contato').scrollIntoView({
            behavior: 'smooth'
        });
        
        // Fechar menu mobile se estiver aberto
        closeMobileMenu();
    }
    
    // ===== EVENT LISTENERS =====
    function addEventListeners() {
        // Menu mobile
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileMenu);
        }
        
        // Fechar menu ao clicar em um link
        navLinksItems.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Formulário de agendamento
        if (formAgendamento) {
            formAgendamento.addEventListener('submit', handleAgendamentoSubmit);
        }
        
        // Modal
        if (btnModal) {
            btnModal.addEventListener('click', hideModal);
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
        
        // Botão agendar no header
        if (btnAgendarHeader) {
            btnAgendarHeader.addEventListener('click', handleAgendarHeaderClick);
        }
        
        // Botões de serviços
        setupServicoButtons();
        
        // Formulário newsletter
        if (formNewsletter) {
            formNewsletter.addEventListener('submit', handleNewsletterSubmit);
        }
        
        // Rolagem suave
        setupSmoothScroll();
        
        // Fechar menu ao redimensionar a janela (se for maior que mobile)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992) {
                closeMobileMenu();
            }
        });
        
        // Melhorar performance do scroll
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            scrollTimeout = setTimeout(function() {
                // Atualizar menu ativo
                setupScrollSpy();
            }, 100);
        });
    }
    
    // ===== INICIALIZAR TUDO =====
    init();
});