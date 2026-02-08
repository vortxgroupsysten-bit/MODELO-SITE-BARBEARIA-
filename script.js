import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyClGuPVykO9JYXCCTipC-sHsXVZ0aDmFpE",
    authDomain: "painel-barbeiro.firebaseapp.com",
    projectId: "painel-barbeiro",
    storageBucket: "painel-barbeiro.firebasestorage.app",
    messagingSenderId: "705166711606",
    appId: "1:705166711606:web:cdc75095c78b5440807197"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function() {
    // 1. PRIMEIRO DECLARAMOS TODAS AS VARIÁVEIS DOS ELEMENTOS
    const scheduleModal = document.getElementById('schedule-modal');
    const scheduleBtns = document.querySelectorAll('.js-open-schedule');
    const closeScheduleBtn = document.getElementById('close-schedule');
    const formAgendamento = document.getElementById('form-agendamento');
    const loadingSpinner = document.getElementById('loading');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    const inputServico = document.getElementById('servico');
    const inputBarbeiro = document.getElementById('barbeiro');
    const inputData = document.getElementById('data');
    const inputHora = document.getElementById('hora');

    const dateScroll = document.getElementById('date-scroll');
    const timeGrid = document.getElementById('time-grid');
    const timeSelectionTitle = document.getElementById('time-selection-title');

    // 2. DEPOIS DEFINIMOS AS FUNÇÕES
    function openModal() {
        if(scheduleModal) {
            scheduleModal.style.display = 'flex';
            setTimeout(() => { scheduleModal.classList.add('active'); }, 10);
            document.body.style.overflow = 'hidden';
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

    function renderDatePicker() {
        if (!dateScroll) return;
        dateScroll.innerHTML = '';
        const today = new Date();
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayName = daysOfWeek[date.getDay()];
            const dayNumber = String(date.getDate()).padStart(2, '0');
            const isoDate = date.toISOString().split('T')[0];
            
            const card = document.createElement('div');
            card.className = 'date-card';
            if (i === 0) card.classList.add('active');
            card.setAttribute('data-date', isoDate);
            card.setAttribute('data-day', dayNumber);
            card.setAttribute('data-month', months[date.getMonth()]);
            card.innerHTML = `<span class="dow">${dayName}</span><span class="day">${dayNumber}</span>`;
            
            card.onclick = function() {
                document.querySelectorAll('.date-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                inputData.value = this.getAttribute('data-date');
                updateTimeTitle(this.getAttribute('data-day'), this.getAttribute('data-month'));
                renderTimeSlots();
            };
            dateScroll.appendChild(card);
        }
        
        const firstCard = dateScroll.querySelector('.date-card');
        if (firstCard) {
            inputData.value = firstCard.getAttribute('data-date');
            updateTimeTitle(firstCard.getAttribute('data-day'), firstCard.getAttribute('data-month'));
            renderTimeSlots();
        }
    }

    function updateTimeTitle(day, month) {
        if (timeSelectionTitle) timeSelectionTitle.textContent = `Horários disponíveis no dia ${day} de ${month}`;
    }

    function renderTimeSlots() {
        if (!timeGrid) return;
        timeGrid.innerHTML = '';
        inputHora.value = '';
        const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '18:00', '18:30', '19:00'];
        
        times.forEach(time => {
            const btn = document.createElement('div');
            btn.className = 'time-slot';
            btn.textContent = time;
            btn.onclick = function() {
                document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
                this.classList.add('selected');
                inputHora.value = time;
            };
            timeGrid.appendChild(btn);
        });
    }

    // 3. ATRIBUÍMOS OS EVENTOS
    scheduleBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            openModal();
            if(navLinks && navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        };
    });

    if(closeScheduleBtn) closeScheduleBtn.onclick = closeModal;
    if(scheduleModal) {
        scheduleModal.onclick = (e) => { 
            if (e.target === scheduleModal) closeModal(); 
        };
    }

    // Configuração dos seletores de Serviço e Barbeiro
    const btnSelectServico = document.getElementById('btn-select-servico');
    const btnSelectBarbeiro = document.getElementById('btn-select-barbeiro');
    const modalServicos = document.getElementById('modal-servicos');
    const modalBarbeiros = document.getElementById('modal-barbeiros');

    if(btnSelectServico) {
        btnSelectServico.onclick = () => {
            modalServicos.style.display = 'flex';
            setTimeout(() => { modalServicos.classList.add('active'); }, 10);
        };
    }

    if(btnSelectBarbeiro) {
        btnSelectBarbeiro.onclick = () => {
            modalBarbeiros.style.display = 'flex';
            setTimeout(() => { modalBarbeiros.classList.add('active'); }, 10);
        };
    }

    document.querySelectorAll('.close-selection').forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.getAttribute('data-target');
            const modal = document.getElementById(targetId);
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        };
    });

    document.querySelectorAll('.option-card').forEach(card => {
        card.onclick = function() {
            const value = this.getAttribute('data-value');
            const isService = this.closest('#modal-servicos') !== null;
            this.parentElement.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            if(isService) {
                inputServico.value = value;
                btnSelectServico.querySelector('span').innerHTML = `<b>${value}</b> - ${this.getAttribute('data-price')}`;
                btnSelectServico.classList.add('active');
                document.querySelectorAll('.close-selection[data-target="modal-servicos"]')[0].click();
            } else {
                inputBarbeiro.value = value;
                btnSelectBarbeiro.querySelector('span').innerHTML = `<b>${value}</b>`;
                btnSelectBarbeiro.classList.add('active');
                document.querySelectorAll('.close-selection[data-target="modal-barbeiros"]')[0].click();
            }
        };
    });

    // Envio para o Firebase
    if(formAgendamento) {
        formAgendamento.onsubmit = async function(e) {
            e.preventDefault();
            if(!inputServico.value || !inputData.value || !inputHora.value || !inputBarbeiro.value) {
                alert("Por favor, preencha todos os campos!");
                return;
            }

            if(loadingSpinner) loadingSpinner.style.display = 'flex';

            const agendamento = {
                nomeCliente: document.getElementById('nome').value,
                telefone: document.getElementById('telefone').value,
                servico: inputServico.value,
                nomeBarbeiro: inputBarbeiro.value,
                data: `${inputData.value}T${inputHora.value}`,
                status: "pendente",
                criadoEm: new Date().toISOString()
            };

            try {
                await addDoc(collection(db, "agendamentos"), agendamento);
                if(loadingSpinner) loadingSpinner.style.display = 'none';
                
                document.querySelector('.form-container').innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <i class="fas fa-check-circle" style="font-size: 50px; color: #d4af37; margin-bottom: 20px;"></i>
                        <h3>Agendamento Confirmado!</h3>
                        <p>Te esperamos no horário marcado.</p>
                        <button class="btn-form" style="margin-top: 20px;" onclick="location.reload()">Novo Agendamento</button>
                    </div>`;
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro ao salvar agendamento.");
                if(loadingSpinner) loadingSpinner.style.display = 'none';
            }
        };
    }

    // Menu Mobile
    if (hamburger && navLinks) {
        hamburger.onclick = () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        };
    }

    // Carrossel
    const carrossel = document.getElementById('carrossel');
    const slides = document.querySelectorAll('.carrossel-slide');
    if (carrossel && slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            carrossel.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 4000);
    }
});
