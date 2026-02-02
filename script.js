document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos
    const scheduleBtns = document.querySelectorAll('.js-open-schedule');
    const scheduleModal = document.getElementById('schedule-modal');
    const closeScheduleBtn = document.getElementById('close-schedule');
    const formAgendamento = document.getElementById('form-agendamento');
    const loadingSpinner = document.getElementById('loading');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const yearSpan = document.getElementById('current-year');
    const carrossel = document.getElementById('carrossel');
    const slides = document.querySelectorAll('.carrossel-slide');
    
    // Definir ano atual
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    // Máscara de Telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            if (value.length > 10) value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            else if (value.length > 6) value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
            else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            e.target.value = value;
        });
    }

    // Funções do Modal Principal
    function openModal() {
        if(scheduleModal) {
            scheduleModal.style.display = 'flex';
            setTimeout(() => { scheduleModal.classList.add('active'); }, 10);
            document.body.style.overflow = 'hidden';
            // Render datepicker when modal opens
            renderDatePicker();
        }
    }

    function closeModal() {
        if(scheduleModal) {
            scheduleModal.classList.remove('active');
            setTimeout(() => {
                scheduleModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    // Listeners para abrir modal
    scheduleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
            if(navLinks && navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    });

    // Listeners para fechar modal principal
    if(closeScheduleBtn) closeScheduleBtn.addEventListener('click', closeModal);
    if(scheduleModal) {
        scheduleModal.addEventListener('click', (e) => { 
            if (e.target === scheduleModal) closeModal(); 
        });
    }

    /* ===== LÓGICA DO DATE PICKER E TIME GRID ===== */
    const dateScroll = document.getElementById('date-scroll');
    const timeGrid = document.getElementById('time-grid');
    const inputData = document.getElementById('data');
    const inputHora = document.getElementById('hora');
    const timeSelectionTitle = document.getElementById('time-selection-title');
    
    // Dias da semana em PT-BR
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    function renderDatePicker() {
        if (!dateScroll) return;
        dateScroll.innerHTML = '';
        const today = new Date();
        
        // Gerar próximos 14 dias
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayName = daysOfWeek[date.getDay()];
            const dayNumber = String(date.getDate()).padStart(2, '0');
            const isoDate = date.toISOString().split('T')[0];
            
            const card = document.createElement('div');
            card.className = 'date-card';
            if (i === 0) card.classList.add('active'); // Seleciona hoje por padrão
            card.setAttribute('data-date', isoDate);
            card.setAttribute('data-day', dayNumber);
            card.setAttribute('data-month', months[date.getMonth()]);
            
            card.innerHTML = `
                <span class="dow">${dayName}</span>
                <span class="day">${dayNumber}</span>
            `;
            
            card.addEventListener('click', function() {
                // Remove active class from all
                document.querySelectorAll('.date-card').forEach(c => c.classList.remove('active'));
                // Add active to clicked
                this.classList.add('active');
                // Update hidden input
                inputData.value = this.getAttribute('data-date');
                // Update title
                updateTimeTitle(this.getAttribute('data-day'), this.getAttribute('data-month'));
                // Re-render times (simulate availability)
                renderTimeSlots();
            });
            
            dateScroll.appendChild(card);
        }
        
        // Set initial values
        const firstCard = dateScroll.querySelector('.date-card');
        if (firstCard) {
            inputData.value = firstCard.getAttribute('data-date');
            updateTimeTitle(firstCard.getAttribute('data-day'), firstCard.getAttribute('data-month'));
            renderTimeSlots();
        }
    }
    
    function updateTimeTitle(day, month) {
        if (timeSelectionTitle) {
            timeSelectionTitle.textContent = `Horários disponíveis no dia ${day} de ${month}`;
        }
    }

    function renderTimeSlots() {
        if (!timeGrid) return;
        timeGrid.innerHTML = '';
        inputHora.value = ''; // Reset selected time
        
        // Horários fictícios
        const times = [
            '09:00', '09:30', '10:00', 
            '10:30', '11:00', '11:30',
            '13:00', '13:30', '14:00',
            '14:30', '15:00', '15:30',
            '16:00', '16:30', '18:00',
            '18:30', '19:00'
        ];
        
        times.forEach(time => {
            const btn = document.createElement('div');
            btn.className = 'time-slot';
            btn.textContent = time;
            
            btn.addEventListener('click', function() {
                // Remove selected from all
                document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
                // Select clicked
                this.classList.add('selected');
                // Update hidden input
                inputHora.value = time;
            });
            
            timeGrid.appendChild(btn);
        });
    }


    /* ===== LÓGICA DOS NOVOS SELETORES (Serviço e Barbeiro) ===== */
    const btnSelectServico = document.getElementById('btn-select-servico');
    const btnSelectBarbeiro = document.getElementById('btn-select-barbeiro');
    const modalServicos = document.getElementById('modal-servicos');
    const modalBarbeiros = document.getElementById('modal-barbeiros');
    const inputServico = document.getElementById('servico');
    const inputBarbeiro = document.getElementById('barbeiro');

    // Abrir Modais de Seleção
    if(btnSelectServico) {
        btnSelectServico.addEventListener('click', () => {
            modalServicos.style.display = 'flex';
            setTimeout(() => { modalServicos.classList.add('active'); }, 10);
        });
    }

    if(btnSelectBarbeiro) {
        btnSelectBarbeiro.addEventListener('click', () => {
            modalBarbeiros.style.display = 'flex';
            setTimeout(() => { modalBarbeiros.classList.add('active'); }, 10);
        });
    }

    // Fechar Modais de Seleção
    function closeSelectionModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    document.querySelectorAll('.close-selection').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            closeSelectionModal(document.getElementById(targetId));
        });
    });

    // Fechar ao clicar fora
    [modalServicos, modalBarbeiros].forEach(modal => {
        if(modal) {
            modal.addEventListener('click', (e) => {
                if(e.target === modal) closeSelectionModal(modal);
            });
        }
    });

    // Seleção de Opções
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const isService = this.closest('#modal-servicos') !== null;
            
            // Remove seleção anterior no mesmo grupo
            const parentGrid = this.parentElement;
            parentGrid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            
            // Adiciona seleção atual
            this.classList.add('selected');
            
            // Atualiza input e texto do botão
            if(isService) {
                inputServico.value = value;
                const price = this.getAttribute('data-price');
                btnSelectServico.querySelector('span').innerHTML = `<b>${value}</b> - ${price}`;
                btnSelectServico.classList.add('active');
                closeSelectionModal(modalServicos);
            } else {
                inputBarbeiro.value = value;
                btnSelectBarbeiro.querySelector('span').innerHTML = `<b>${value}</b>`;
                btnSelectBarbeiro.classList.add('active');
                closeSelectionModal(modalBarbeiros);
            }
        });
    });

    // Envio do Formulário Atualizado
    if(formAgendamento) {
        formAgendamento.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validação manual dos inputs hidden
            if(!inputServico.value) {
                alert("Por favor, selecione um serviço.");
                btnSelectServico.click(); 
                return;
            }
            if(!inputData.value) {
                alert("Por favor, selecione uma data.");
                return;
            }
            if(!inputHora.value) {
                alert("Por favor, selecione um horário.");
                return;
            }
            if(!inputBarbeiro.value) {
                alert("Por favor, selecione um barbeiro.");
                btnSelectBarbeiro.click();
                return;
            }

            const agendamento = {
                nome: document.getElementById('nome').value,
                servico: inputServico.value,
                data: inputData.value,
                hora: inputHora.value,
                barbeiro: inputBarbeiro.value,
                id: Date.now()
            };
            
            let agendamentos = JSON.parse(localStorage.getItem('meusAgendamentos') || '[]');
            agendamentos.push(agendamento);
            localStorage.setItem('meusAgendamentos', JSON.stringify(agendamentos));
            
            if(loadingSpinner) loadingSpinner.style.display = 'flex';
            
            setTimeout(() => { 
                if(loadingSpinner) loadingSpinner.style.display = 'none';
                
                // Show success message
                const formContainer = document.querySelector('.form-container');
                if(formContainer) {
                    formContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px;">
                            <div style="width: 80px; height: 80px; background: #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; font-size: 40px;">
                                <i class="fas fa-check"></i>
                            </div>
                            <h3 style="color: #1a1a1a; margin-bottom: 10px;">Agendamento Confirmado!</h3>
                            <p style="color: #6c757d;">Te esperamos no dia e horário marcados.</p>
                            <button class="btn-form" style="margin-top: 20px;" onclick="location.reload()">Novo Agendamento</button>
                        </div>
                    `;
                }
            }, 1500);
        });
    }

    // Menu Mobile
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Carrossel Automático
    if (carrossel && slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            carrossel.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 4000);
    }
});
