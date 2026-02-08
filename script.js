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
    // 1. Referências aos elementos
    const scheduleModal = document.getElementById('schedule-modal');
    const scheduleBtns = document.querySelectorAll('.js-open-schedule');
    const closeScheduleBtn = document.getElementById('close-schedule');
    const formAgendamento = document.getElementById('form-agendamento');
    const dateScroll = document.getElementById('date-scroll');
    const timeGrid = document.getElementById('time-grid');
    const loadingSpinner = document.getElementById('loading');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const carrossel = document.getElementById('carrossel');
    const slides = document.querySelectorAll('.carrossel-slide');
    
    const inputServico = document.getElementById('servico');
    const inputBarbeiro = document.getElementById('barbeiro');
    const inputData = document.getElementById('data');
    const inputHora = document.getElementById('hora');

    // 2. Funções de Controle do Modal
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

    // 3. Funções do Calendário e Horários
    function renderDatePicker() {
        if (!dateScroll) return;
        dateScroll.innerHTML = '';
        const today = new Date();
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const isoDate = date.toISOString().split('T')[0];
            
            const card = document.createElement('div');
            card.className = 'date-card';
            if (i === 0) card.classList.add('active');
            card.innerHTML = `<span class="dow">${daysOfWeek[date.getDay()]}</span><span class="day">${date.getDate()}</span>`;
            
            card.onclick = () => {
                document.querySelectorAll('.date-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                inputData.value = isoDate;
                renderTimeSlots();
            };
            dateScroll.appendChild(card);
        }
        renderTimeSlots();
    }

    function renderTimeSlots() {
        if (!timeGrid) return;
        timeGrid.innerHTML = '';
        const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
        times.forEach(time => {
            const btn = document.createElement('div');
            btn.className = 'time-slot';
            btn.textContent = time;
            btn.onclick = () => {
                document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
                btn.classList.add('selected');
                inputHora.value = time;
            };
            timeGrid.appendChild(btn);
        });
    }

    // 4. Eventos Principais
    scheduleBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            openModal();
            // Fecha menu mobile se estiver aberto
            if(navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        };
    });

    if(closeScheduleBtn) closeScheduleBtn.onclick = closeModal;
    
    window.onclick = (e) => {
        if (e.target === scheduleModal) closeModal();
    };

    // 5. Envio para o Firebase
    if(formAgendamento) {
        formAgendamento.onsubmit = async (e) => {
            e.preventDefault();
            if(!inputServico.value || !inputData.value || !inputHora.value || !inputBarbeiro.value) {
                alert("Por favor, selecione todos os campos (Serviço, Barbeiro, Data e Hora).");
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
                
                // Feedback de sucesso direto no modal
                const formContainer = document.querySelector('.form-container');
                formContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <i class="fas fa-check-circle" style="font-size: 50px; color: #d4af37; margin-bottom: 20px;"></i>
                        <h3>Confirmado!</h3>
                        <p>Seu horário foi reservado com sucesso.</p>
                        <button class="btn-form" onclick="location.reload()" style="margin-top:20px">Voltar</button>
                    </div>`;
            } catch (err) {
                console.error(err);
                alert("Erro ao salvar agendamento.");
                if(loadingSpinner) loadingSpinner.style.display = 'none';
            }
        };
    }
    
    // 6. Seletores Customizados (Serviço e Barbeiro)
    const btnSelectServico = document.getElementById('btn-select-servico');
    const btnSelectBarbeiro = document.getElementById('btn-select-barbeiro');
    const modalServicos = document.getElementById('modal-servicos');
    const modalBarbeiros = document.getElementById('modal-barbeiros');

    if(btnSelectServico) btnSelectServico.onclick = () => { 
        modalServicos.style.display = 'flex'; 
        setTimeout(() => modalServicos.classList.add('active'), 10);
    };

    if(btnSelectBarbeiro) btnSelectBarbeiro.onclick = () => { 
        modalBarbeiros.style.display = 'flex'; 
        setTimeout(() => modalBarbeiros.classList.add('active'), 10);
    };

    document.querySelectorAll('.close-selection').forEach(btn => {
        btn.onclick = () => {
            const modal = document.getElementById(btn.getAttribute('data-target'));
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        };
    });

    document.querySelectorAll('.option-card').forEach(card => {
        card.onclick = () => {
            const val = card.getAttribute('data-value');
            if(card.closest('#modal-servicos')) {
                inputServico.value = val;
                btnSelectServico.querySelector('span').innerHTML = `<b>${val}</b>`;
                btnSelectServico.classList.add('active');
                document.querySelector('.close-selection[data-target="modal-servicos"]').click();
            } else {
                inputBarbeiro.value = val;
                btnSelectBarbeiro.querySelector('span').innerHTML = `<b>${val}</b>`;
                btnSelectBarbeiro.classList.add('active');
                document.querySelector('.close-selection[data-target="modal-barbeiros"]').click();
            }
        };
    });

    // 7. Menu Mobile
    if (hamburger && navLinks) {
        hamburger.onclick = () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        };
    }

    // 8. Carrossel Automático
    if (carrossel && slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            carrossel.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 4000);
    }
});
