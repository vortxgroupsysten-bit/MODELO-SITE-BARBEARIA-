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
    // 1. Declarar referências primeiro (Evita erro de initialization)
    const scheduleModal = document.getElementById('schedule-modal');
    const scheduleBtns = document.querySelectorAll('.js-open-schedule');
    const closeScheduleBtn = document.getElementById('close-schedule');
    const formAgendamento = document.getElementById('form-agendamento');
    const dateScroll = document.getElementById('date-scroll');
    const timeGrid = document.getElementById('time-grid');
    const loadingSpinner = document.getElementById('loading');
    
    const inputServico = document.getElementById('servico');
    const inputBarbeiro = document.getElementById('barbeiro');
    const inputData = document.getElementById('data');
    const inputHora = document.getElementById('hora');

    // 2. Definir funções antes de usá-las
    function closeModal() {
        if(scheduleModal) {
            scheduleModal.classList.remove('active');
            setTimeout(() => {
                scheduleModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    function openModal() {
        if(scheduleModal) {
            scheduleModal.style.display = 'flex';
            setTimeout(() => { scheduleModal.classList.add('active'); }, 10);
            document.body.style.overflow = 'hidden';
            renderDatePicker();
        }
    }

    // 3. Funções do Calendário
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

    // 4. Eventos de clique
    scheduleBtns.forEach(btn => btn.onclick = (e) => { e.preventDefault(); openModal(); });
    if(closeScheduleBtn) closeScheduleBtn.onclick = closeModal;

    // 5. Envio para o Firebase (Ação de Confirmar)
    if(formAgendamento) {
        formAgendamento.onsubmit = async (e) => {
            e.preventDefault();
            if(!inputServico.value || !inputData.value || !inputHora.value || !inputBarbeiro.value) {
                alert("Por favor, preencha todos os campos da seleção.");
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
                alert("Agendamento Confirmado com sucesso!");
                location.reload();
            } catch (err) {
                console.error(err);
                alert("Erro ao salvar agendamento.");
                if(loadingSpinner) loadingSpinner.style.display = 'none';
            }
        };
    }
    
    // Configuração dos seletores customizados (Serviço e Barbeiro)
    const btnSelectServico = document.getElementById('btn-select-servico');
    const modalServicos = document.getElementById('modal-servicos');
    const btnSelectBarbeiro = document.getElementById('btn-select-barbeiro');
    const modalBarbeiros = document.getElementById('modal-barbeiros');

    if(btnSelectServico) btnSelectServico.onclick = () => { modalServicos.style.display = 'flex'; modalServicos.classList.add('active'); };
    if(btnSelectBarbeiro) btnSelectBarbeiro.onclick = () => { modalBarbeiros.style.display = 'flex'; modalBarbeiros.classList.add('active'); };

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
                btnSelectServico.querySelector('span').innerText = val;
                document.querySelector('.close-selection[data-target="modal-servicos"]').click();
            } else {
                inputBarbeiro.value = val;
                btnSelectBarbeiro.querySelector('span').innerText = val;
                document.querySelector('.close-selection[data-target="modal-barbeiros"]').click();
            }
        };
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.querySelector(".js-open-schedule");
  const modal = document.getElementById("schedule-modal");
  const closeBtn = document.getElementById("close-schedule");

  if (!openBtn || !modal) {
    console.error("Botão ou modal não encontrado");
    return;
  }

  // Abrir modal
  openBtn.addEventListener("click", () => {
    modal.classList.add("active");
    modal.style.display = "flex";
  });

  // Fechar modal (X)
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    modal.style.display = "none";
  });

  // Fechar clicando fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  });
});
