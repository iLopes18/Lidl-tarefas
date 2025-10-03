// script.js - versão completa com Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMsIzfGCBt6-Lg0xTOkpZW6IcvBM8qLrI",
  authDomain: "lidl-tarefas.firebaseapp.com",
  projectId: "lidl-tarefas",
  storageBucket: "lidl-tarefas.appspot.com",
  messagingSenderId: "207588440749",
  appId: "1:207588440749:web:8f40773f96cb11d5706424",
  measurementId: "G-GHG6MEZB2F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let tarefas = [];
let resetDay = 6; // padrão: sábado

// CRUD Firebase
async function salvarTarefaFirebase(tarefa) {
  await addDoc(collection(db, "tarefas"), tarefa);
}

async function listarTarefasFirebase() {
  const snapshot = await getDocs(collection(db, "tarefas"));
  const lista = [];
  snapshot.forEach(docSnap => lista.push({ id: docSnap.id, ...docSnap.data() }));
  return lista;
}

async function atualizarTarefaFirebase(id, dados) {
  await setDoc(doc(db, "tarefas", id), dados);
}

async function eliminarTarefaFirebase(id) {
  await deleteDoc(doc(db, "tarefas", id));
}

// Carregar tarefas do Firebase
async function carregarTarefas() {
  tarefas = await listarTarefasFirebase();
  renderHoje();
  renderResumo();
  renderConfig();
}

function diaAtual() {
  return new Date().getDay();
}

function renderHoje() {
  const pendentes = document.getElementById("lista-hoje-pendentes");
  const concluidas = document.getElementById("lista-hoje-concluidas");
  pendentes.innerHTML = "";
  concluidas.innerHTML = "";
  const hoje = diaAtual();
  tarefas.forEach(tarefa => {
    if (tarefa.dias.includes(hoje)) {
      const li = document.createElement("li");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = tarefa.concluida ? tarefa.concluida[hoje] || false : false;
      check.onchange = async () => {
        tarefa.concluida = tarefa.concluida || {};
        tarefa.concluida[hoje] = check.checked;
        await atualizarTarefaFirebase(tarefa.id, tarefa);
        carregarTarefas();
      };
      li.appendChild(check);
      li.appendChild(document.createTextNode(tarefa.nome));
      if (check.checked) concluidas.appendChild(li);
      else pendentes.appendChild(li);
    }
  });
}

function renderResumo() {
  const resumo = document.getElementById("resumo-semana");
  resumo.innerHTML = "";
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  dias.forEach((dia, d) => {
    const divDia = document.createElement("div");
    divDia.innerHTML = `<h3>${dia}</h3>`;
    const ul = document.createElement("ul");
    tarefas.forEach(tarefa => {
      if (tarefa.dias.includes(d)) {
        const li = document.createElement("li");
        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = tarefa.concluida ? tarefa.concluida[d] || false : false;
        check.onchange = async () => {
          tarefa.concluida = tarefa.concluida || {};
          tarefa.concluida[d] = check.checked;
          await atualizarTarefaFirebase(tarefa.id, tarefa);
          carregarTarefas();
        };
        li.appendChild(check);
        li.appendChild(document.createTextNode(tarefa.nome));
        ul.appendChild(li);
      }
    });
    divDia.appendChild(ul);
    resumo.appendChild(divDia);
  });
}

function renderConfig() {
  const listaConfig = document.getElementById("lista-config");
  listaConfig.innerHTML = "";
  tarefas.forEach((tarefa, idx) => {
    const li = document.createElement("li");
    li.textContent = tarefa.nome;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.className = "edit";
    editBtn.onclick = () => editarTarefa(idx);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.className = "delete";
    deleteBtn.onclick = async () => {
      await eliminarTarefaFirebase(tarefa.id);
      carregarTarefas();
    };

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    listaConfig.appendChild(li);
  });

  document.getElementById("reset-day").value = resetDay;
}

async function editarTarefa(idx) {
  const tarefa = tarefas[idx];
  const novoNome = prompt("Novo nome da tarefa:", tarefa.nome);
  if (!novoNome) return;
  const novosDias = prompt("Novos dias (separados por vírgula, 0=Dom, 6=Sáb):", tarefa.dias.join(","));
  if (novosDias === null) return;
  tarefa.nome = novoNome;
  tarefa.dias = novosDias.split(",").map(d => parseInt(d.trim())).filter(d => !isNaN(d));
  await atualizarTarefaFirebase(tarefa.id, tarefa);
  carregarTarefas();
}

function toggleEditarTarefas() {
  const lista = document.getElementById("lista-config");
  lista.style.display = lista.style.display === "none" ? "block" : "none";
}

async function resetarTarefasSeNecessario() {
  const agora = new Date();
  if (agora.getDay() === resetDay && agora.getHours() === 23 && agora.getMinutes() === 59) {
    for (let tarefa of tarefas) {
      tarefa.concluida = {};
      await atualizarTarefaFirebase(tarefa.id, tarefa);
    }
    carregarTarefas();
  }
}

function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "hoje") renderHoje();
  if (id === "resumo") renderResumo();
  if (id === "config") renderConfig();
}

// Eventos
document.getElementById("form-tarefa").addEventListener("submit", async e => {
  e.preventDefault();
  const nome = document.getElementById("tarefa-nome").value;
  const dias = [...document.querySelectorAll("#form-tarefa input[type=checkbox]:checked")].map(cb => parseInt(cb.value));
  if (nome && dias.length) {
    await salvarTarefaFirebase({ nome, dias, concluida: {} });
    document.getElementById("form-tarefa").reset();
    carregarTarefas();
  }
});

document.getElementById("reset-day").addEventListener("change", e => {
  resetDay = parseInt(e.target.value);
});

// Intervalo para reset
setInterval(resetarTarefasSeNecessario, 60000);

// Inicializar
carregarTarefas();
