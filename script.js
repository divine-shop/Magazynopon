document.addEventListener("DOMContentLoaded", () => {
  const tireForm = document.getElementById("tire-form");
  const tireTable = document.getElementById("tire-table").querySelector("tbody");
  const rackSelect = tireForm.querySelector("[name='regal']");
  const rackList = document.getElementById("rack-list");
  const historyLog = document.getElementById("history-log");
  const searchInput = document.getElementById("search");
  const toggleDark = document.getElementById("toggle-dark-mode");

  let tires = JSON.parse(localStorage.getItem("tires") || "[]");
  let racks = JSON.parse(localStorage.getItem("racks") || "[]");
  let history = JSON.parse(localStorage.getItem("history") || "[]");

  function saveData() {
    localStorage.setItem("tires", JSON.stringify(tires));
    localStorage.setItem("racks", JSON.stringify(racks));
    localStorage.setItem("history", JSON.stringify(history));
  }

  function renderRacks() {
    rackSelect.innerHTML = "";
    rackList.innerHTML = "";
    racks.forEach((rack, i) => {
      let opt = document.createElement("option");
      opt.value = rack.nazwa;
      opt.textContent = rack.nazwa;
      rackSelect.appendChild(opt);

      let li = document.createElement("li");
      li.className = "rack-item";
      li.style.background = rack.kolor;
      li.innerHTML = `<strong>${rack.nazwa}</strong><br>${rack.opis}<br>
        <button onclick="editRack(${i})">Edytuj</button>
        <button onclick="deleteRack(${i})">Usuń</button>
        <button onclick="viewRackTires('${rack.nazwa}')">Pokaż opony</button>`;
      rackList.appendChild(li);
    });
  }

  function renderTires() {
    tireTable.innerHTML = "";
    let query = searchInput.value.toLowerCase();
    tires.filter(t => Object.values(t).some(v => String(v).toLowerCase().includes(query))).forEach((tire, i) => {
      let row = tireTable.insertRow();
      row.innerHTML = `
        <td>${tire.nr_rej}</td>
        <td>${tire.marka}</td>
        <td>${tire.model}</td>
        <td>${tire.rozmiar}</td>
        <td>${tire.wlasciciel}</td>
        <td>
          <button onclick="editTire(${i})">Edytuj</button>
          <button onclick="deleteTire(${i})">Usuń</button>
        </td>`;
    });
  }

  tireForm.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(tireForm).entries());
    if (tireForm.dataset.index !== undefined) {
      tires[tireForm.dataset.index] = data;
      history.push("Zaktualizowano oponę: " + data.nr_rej);
      delete tireForm.dataset.index;
    } else {
      tires.push(data);
      history.push("Dodano oponę: " + data.nr_rej);
    }
    tireForm.reset();
    renderTires();
    saveData();
    renderHistory();
  };

  window.deleteTire = i => {
    history.push("Usunięto oponę: " + tires[i].nr_rej);
    tires.splice(i, 1);
    renderTires();
    saveData();
    renderHistory();
  };

  window.editTire = i => {
    Object.entries(tires[i]).forEach(([k, v]) => tireForm[k].value = v);
    tireForm.dataset.index = i;
  };

  document.getElementById("rack-form").onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (e.target.dataset.index !== undefined) {
      racks[e.target.dataset.index] = data;
      history.push("Zmieniono regał: " + data.nazwa);
      delete e.target.dataset.index;
    } else {
      racks.push(data);
      history.push("Dodano regał: " + data.nazwa);
    }
    e.target.reset();
    renderRacks();
    saveData();
    renderHistory();
  };

  window.deleteRack = i => {
    history.push("Usunięto regał: " + racks[i].nazwa);
    racks.splice(i, 1);
    renderRacks();
    saveData();
    renderHistory();
  };

  window.editRack = i => {
    let r = racks[i];
    let f = document.getElementById("rack-form");
    f.nazwa.value = r.nazwa;
    f.opis.value = r.opis;
    f.kolor.value = r.kolor;
    f.dataset.index = i;
  };

  window.viewRackTires = name => {
    searchInput.value = name;
    showSection("table-section");
    renderTires();
  };

  function renderHistory() {
    historyLog.innerHTML = history.map(h => "<li>" + h + "</li>").reverse().join("");
  }

  toggleDark.onchange = () => {
    document.body.classList.toggle("dark", toggleDark.checked);
  };

  searchInput.oninput = renderTires;

  window.showSection = id => {
    document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
  };

  window.openLabelView = () => {
    let selected = tires.slice(0, 8);
    let win = window.open("", "", "width=800,height=600");
    win.document.write("<style>body{font-family:sans-serif;} .label{border:1px solid #ccc; margin:5px; padding:5px; width:45%; float:left;} .big{font-size:20px;font-weight:bold;text-align:center;}</style>");
    selected.forEach(t => {
      win.document.write(`<div class="label">
        <div class="big">${t.nr_rej}</div>
        ${t.marka} ${t.model} ${t.rozmiar}<br>${t.wlasciciel}<br>${t.opis}
      </div>`);
    });
    win.print();
  };

  renderRacks();
  renderTires();
  renderHistory();
});