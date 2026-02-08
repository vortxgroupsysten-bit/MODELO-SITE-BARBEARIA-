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
    // Referências - Declarar antes de usar
    const scheduleModal = document.getElementById('schedule-modal');
    const dateScroll = document.getElementById('date-scroll');
    const timeGrid = document.getElementById('time-grid');
    const inputData = document.getElementById('data');
    const inputHora = document.getElementById('hora');
    const formAgendamento = document.getElementById('form-agendamento');

    function closeModal() {
        scheduleModal.classList.remove('active');
        setTimeout(() => {
            scheduleModal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    // Configuração do formulário para o Firebase
    if(formAgendamento) {
        formAgendamento.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const agendamento = {
                nomeCliente: document.getElementById('nome').value,
                telefone: document.getElementById('telefone').value,
                servico: document.getElementById('servico').value,
                nomeBarbeiro: document.getElementById('barbeiro').value,
                data: `${inputData.value}T${inputHora.value}`,
                status: "pendente"
            };

            try {
                await addDoc(collection(db, "agendamentos"), agendamento);
                alert("Agendamento realizado com sucesso!");
                location.reload();
            } catch (error) {
                console.error("Erro ao salvar:", error);
            }
        });
    }

    // (Mantenha aqui suas funções renderDatePicker e renderTimeSlots)
});
