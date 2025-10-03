// script.js

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let resetDay = parseInt(localStorage.getItem("resetDay")) || 6; // padrão: sábado

function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function salvarConfig() {
  localStorage.setItem("resetDay", resetDay);
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
  tarefas.forEach((tarefa, idx) => {
    if (tarefa.dias.includes(hoje)) {
      const li = document.createElement("li");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = tarefa.concluida[hoje] || false;
      check.onchange = () => {
        tarefa.concluida[hoje] = check.checked;
        salvarTarefas();
        renderHoje();
        renderResumo();
      };
      li.appendChild(check);
      li.appendChild(document.createTextNode(tarefa.nome));
      if (check.checked) {
        concluidas.appendChild(li);
      } else {
        pendentes.appendChild(li);
      }
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
        check.checked = tarefa.concluida[d] || false;
        check.onchange = () => {
          tarefa.concluida[d] = check.checked;
          salvarTarefas();
          renderHoje();
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
    deleteBtn.onclick = () => {
      tarefas.splice(idx, 1);
      salvarTarefas();
      renderConfig();
      renderHoje();
      renderResumo();
    };
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    listaConfig.appendChild(li);
  });

  document.getElementById("reset-day").value = resetDay;
}

function editarTarefa(idx) {
  const tarefa = tarefas[idx];
  const novoNome = prompt("Novo nome da tarefa:", tarefa.nome);
  if (!novoNome) return;
  const novosDias = prompt("Novos dias (separados por vírgula, 0=Dom, 6=Sáb):", tarefa.dias.join(","));
  if (novosDias === null) return;
  tarefa.nome = novoNome;
  tarefa.dias = novosDias.split(",").map(d => parseInt(d.trim())).filter(d => !isNaN(d));
  salvarTarefas();
  renderConfig();
  renderHoje();
  renderResumo();
}

function resetarTarefasSeNecessario() {
  const agora = new Date();
  if (agora.getDay() === resetDay && agora.getHours() === 23 && agora.getMinutes() === 59) {
    tarefas.forEach(tarefa => tarefa.concluida = {});
    salvarTarefas();
    renderHoje();
    renderResumo();
  }
}

function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "hoje") renderHoje();
  if (id === "resumo") renderResumo();
  if (id === "config") renderConfig();
}

function toggleEditarTarefas() {
  const lista = document.getElementById("lista-config");
  lista.style.display = lista.style.display === "none" ? "block" : "none";
}

document.getElementById("form-tarefa").addEventListener("submit", e => {
  e.preventDefault();
  const nome = document.getElementById("tarefa-nome").value;
  const dias = [...document.querySelectorAll("#form-tarefa input[type=checkbox]:checked")].map(cb => parseInt(cb.value));
  if (nome && dias.length) {
    tarefas.push({ nome, dias, concluida: {} });
    salvarTarefas();
    document.getElementById("form-tarefa").reset();
    renderHoje();
    renderResumo();
    renderConfig();
  }
});

document.getElementById("reset-day").addEventListener("change", e => {
  resetDay = parseInt(e.target.value);
  salvarConfig();
});

// Intervalo para verificar reset
setInterval(resetarTarefasSeNecessario, 60000);

// Inicializar
renderHoje();
renderResumo();
renderConfig();
