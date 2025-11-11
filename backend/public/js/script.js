const API_BASE = '/api';

let _clientCache = [];
let _vehicleCache = [];


function showTab(name) {
  ['clientes','veiculos','checklist'].forEach(t => {
    document.getElementById('tab-' + t).style.display = (t === name) ? 'block' : 'none';
  });
}
showTab('clientes');

/* ---------------- (PF/PJ) ---------------- */
function atualizarCamposPessoa() {
  const tipo = document.getElementById('tipoPessoa').value;
  const camposPF = document.getElementById('camposPessoaFisica');
  const camposPJ = document.getElementById('camposPessoaJuridica');
  camposPF.style.display = (tipo === 'PF') ? 'block' : 'none';
  camposPJ.style.display = (tipo === 'PJ') ? 'block' : 'none';
  if (tipo !== 'PF') {
    document.getElementById('cpf').value = '';
    document.getElementById('rg').value = '';
    document.getElementById('dataNascimento').value = '';
  }
  if (tipo !== 'PJ') {
    document.getElementById('cnpj').value = '';
    document.getElementById('inscEstadual').value = '';
    document.getElementById('inscMunicipal').value = '';
  }
}

function limparFormCliente() {
  document.getElementById('formCliente').reset();
  document.getElementById('clientId').value = '';
  atualizarCamposPessoa(); 
}

/* ---------------- Client CRUD ---------------- */

async function salvarCliente(e) {
  if (e && e.preventDefault) e.preventDefault();
  const id = document.getElementById('clientId').value || null;
  
  const payload = {
  nome: document.getElementById('nome').value || null, 
  cpf: document.getElementById('cpf').value || null,
  rg: document.getElementById('rg').value || null,
  cnpj: document.getElementById('cnpj').value || null,
  data_nascimento: document.getElementById('dataNascimento').value || null,
  tipo_pessoa: document.getElementById('tipoPessoa').value || null, 
  insc_estadual: document.getElementById('inscEstadual').value || null,
  insc_municipal: document.getElementById('inscMunicipal').value || null,
  data_cadastro: null,
  telefone: document.getElementById('telNumero').value || null,
  telefone_obs: document.getElementById('telObs').value || null,
  celular: document.getElementById('celNumero').value || null,
  celular_obs: document.getElementById('celObs').value || null,
  email: document.getElementById('email').value || null,
  email_obs: document.getElementById('emailObs').value || null,
  rua: document.getElementById('rua').value || null,
  bairro: document.getElementById('bairro').value || null,
  cidade: document.getElementById('cidade').value || null,
  uf: document.getElementById('uf').value || null,
  cep: document.getElementById('cep').value || null
};

  if (!payload.data_nascimento) delete payload.data_nascimento;
  if (!payload.data_cadastro) delete payload.data_cadastro;

  try {
    let url = `${API_BASE}/clientes`;
    let method = 'POST';

    if (id) {
      url = `${API_BASE}/clientes/${id}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Falha ao salvar cliente');
    }
    
    alert(id ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');

  } catch (err) {
    console.error('salvarCliente:', err);
    alert(`Erro: ${err.message}`);
  }

  limparFormCliente();
  await fetchClients();
}

function alterarCliente() {
  const id = document.getElementById('clientId').value;
  if (!id) return alert('Selecione um cliente para alterar (clique no nome na lista).');
  salvarCliente();
}

async function deletarCliente() {
  const id = document.getElementById('clientId').value;
  if (!id) return alert('Selecione um cliente para excluir.');
  if (!confirm('Confirma exclusão do cliente?')) return;

  try {
    const response = await fetch(`${API_BASE}/clientes/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Falha ao excluir cliente');
    }

    alert('Cliente excluído com sucesso!');

  } catch (err) {
    console.error('deletarCliente:', err);
    alert(`Erro: ${err.message}`);
  }

  limparFormCliente();
  await fetchClients();
}


async function fetchClients() {
  let clients = [];
  try {
    const response = await fetch(`${API_BASE}/clientes`);
    if (!response.ok) throw new Error('Falha ao buscar clientes da API');
    clients = await response.json();
    _clientCache = clients;
  } catch (err) {
    console.error('fetchClients:', err);
    alert(err.message);
  }

  const lista = document.getElementById('listaClientes');
  const listaDono = document.getElementById('listaClientesDono');
  const listaDonoChecklist = document.getElementById('listaClientesDonoChecklist');

  if (lista) {
    lista.innerHTML = '';
    clients.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c.nome + (c.cpf ? ' — ' + c.cpf : '')+(c.cnpj ? ' — ' + c.cnpj : '');
      li.style.padding = '6px';
      li.style.cursor = 'pointer';
      li.onclick = () => selecionarClientePorId(c.id_cliente);
      lista.appendChild(li);
    });
  }
  
  if (listaDono) {
    listaDono.innerHTML = '';
    clients.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c.nome;
      li.style.padding = '6px';
      li.style.cursor = 'pointer';
      li.onclick = () => selecionarDonoPorId(c.id_cliente, c.nome);
      listaDono.appendChild(li);
    });
  }

  if (listaDonoChecklist) {
    listaDonoChecklist.innerHTML = '';
    clients.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c.nome + (c.cpf ? ' — ' + c.cpf : '')+(c.cnpj ? ' — ' + c.cnpj : '');
      li.style.padding = '6px';
      li.style.cursor = 'pointer';
      li.onclick = () => selecionarDonoChecklist(c.id_cliente, c.nome); 
      listaDonoChecklist.appendChild(li);
    });
  }
}

function selecionarClientePorId(id) {

  const c = _clientCache.find(x => String(x.id_cliente) === String(id)); 
  if (!c) return alert('Cliente não encontrado no cache');

  limparFormCliente(); 
  document.getElementById('nome').value = c.nome || '';
  document.getElementById('tipoPessoa').value = c.tipo_pessoa || '';
  atualizarCamposPessoa(); 

  document.getElementById('cpf').value = c.cpf || '';
  document.getElementById('rg').value = c.rg || '';
  document.getElementById('cnpj').value = c.cnpj || '';
  document.getElementById('dataNascimento').value = c.data_nascimento ? c.data_nascimento.split('T')[0] : '';
  document.getElementById('inscEstadual').value = c.insc_estadual || '';
  document.getElementById('inscMunicipal').value = c.insc_municipal || '';
  
  document.getElementById('telNumero').value = c.telefone || '';
  document.getElementById('telObs').value = c.telefone_obs || '';
  document.getElementById('celNumero').value = c.celular || '';
  document.getElementById('celObs').value = c.celular_obs || '';
  document.getElementById('email').value = c.email || '';
  document.getElementById('emailObs').value = c.email_obs || '';
  document.getElementById('rua').value = c.rua || '';
  document.getElementById('bairro').value = c.bairro || '';
  document.getElementById('cidade').value = c.cidade || '';
  document.getElementById('uf').value = c.uf || '';
  document.getElementById('cep').value = c.cep || '';
  document.getElementById('clientId').value = c.id_cliente;
}

function selecionarDonoPorId(id, nome) {
  document.getElementById('donoNome').value = nome;
  document.getElementById('donoNome').dataset.clienteId = id;
  fecharModalDono();
}

function abrirModalDono() {
  const modal = document.getElementById('modalBuscaDono');
  if (modal) modal.style.display = 'flex';
}

function fecharModalDono() {
  const modal = document.getElementById('modalBuscaDono');
  if (modal) modal.style.display = 'none';
}

function abrirModalDonoChecklist() {
  document.getElementById('modalBuscaDonoChecklist').style.display = 'flex';
}

function fecharModalDonoChecklist() {
  document.getElementById('modalBuscaDonoChecklist').style.display = 'none';
}

function selecionarDonoChecklist(id, nome) {
  document.getElementById('checkDono').value = nome;
  document.getElementById('checkDonoId').value = id;
  document.getElementById('checkPlaca').value = ''; 
  fecharModalDonoChecklist();
  abrirModalVeiculoChecklist(); 
}

function abrirModalVeiculoChecklist() {
  const donoId = document.getElementById('checkDonoId').value;
  if (!donoId) {
    return alert('Por favor, selecione um Dono primeiro.');
  }
  
  const donoNome = document.getElementById('checkDono').value;
  const listaVeiculosChecklist = document.getElementById('listaVeiculosChecklist');
  listaVeiculosChecklist.innerHTML = ''; 

  const allVehicles = _vehicleCache; 
  
  const vehicles = allVehicles.filter(v => String(v.cliente_id) === String(donoId));

  if (!vehicles.length) {
    listaVeiculosChecklist.innerHTML = '<li>Nenhum veículo encontrado para este dono.</li>';
  }

  vehicles.forEach(v => {
    const li = document.createElement('li');
    li.textContent = `${v.placa || '-'} — ${v.modelo || '-'} (${v.cor || '-'})`;
    li.style.padding = '6px';
    li.style.cursor = 'pointer';
    li.onclick = () => selecionarVeiculoParaChecklist(v.id_veiculo, v.placa, donoNome);
    listaVeiculosChecklist.appendChild(li);
  });

  document.getElementById('modalBuscaVeiculoChecklist').style.display = 'flex';
}

function fecharModalVeiculoChecklist() {
  document.getElementById('modalBuscaVeiculoChecklist').style.display = 'none';
}

function selecionarVeiculoParaChecklist(id, placa, donoNome) {
  document.getElementById('checkPlaca').value = placa;
  document.getElementById('checkDono').value = donoNome; 
  fecharModalVeiculoChecklist();
}


/* ---------------- Vehicles CRUD ---------------- */
async function salvarVeiculo(e) {
  if (e && e.preventDefault) e.preventDefault();
  const id = document.getElementById('vehicleId').value || null;
  const donoDataset = document.getElementById('donoNome')?.dataset?.clienteId;
  
const payload = {
  placa: document.getElementById('placa').value || null,
  renavam: document.getElementById('renavam').value || null,
  marca: document.getElementById('marca').value || null,
  modelo: document.getElementById('modelo').value || null,
  ano: document.getElementById('ano').value || null,
  cor: document.getElementById('cor').value || null,
  chassi: document.getElementById('chassi').value || null,
  combustivel: document.getElementById('combustivel').value || null,
  categoria: document.getElementById('categoria').value || null,
  observacoes: document.getElementById('veiculoObs').value || null,
  fk_id_cliente: donoDataset ? Number(donoDataset) : null
};

  try {
    let url = `${API_BASE}/veiculos`;
    let method = 'POST';

    if (id) {
      url = `${API_BASE}/veiculos/${id}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Falha ao salvar veículo');
    }
    
    alert(id ? 'Veículo atualizado!' : 'Veículo criado!');

  } catch (err) {
    console.error('salvarVeiculo:', err);
    alert(`Erro: ${err.message}`);
  }
  
  document.getElementById('formVeiculo')?.reset();
  document.getElementById('vehicleId').value = '';
  document.getElementById('donoNome').dataset.clienteId = ''; 
  await fetchVehicles();
}

function alterarVeiculo() {
  const id = document.getElementById('vehicleId').value;
  if (!id) return alert('Selecione um veículo para alterar.');
  salvarVeiculo();
}

async function deletarVeiculo() {
  const id = document.getElementById('vehicleId').value;
  if (!id) return alert('Selecione um veículo para excluir.');
  if (!confirm('Confirma exclusão do veículo?')) return;

  try {
    const response = await fetch(`${API_BASE}/veiculos/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Falha ao excluir veículo');
    }

    alert('Veículo excluído com sucesso!');

  } catch (err) {
    console.error('deletarVeiculo:', err);
    alert(`Erro: ${err.message}`);
  }

  document.getElementById('formVeiculo')?.reset();
  document.getElementById('vehicleId').value = '';
  document.getElementById('donoNome').dataset.clienteId = '';
  await fetchVehicles();
}

async function fetchVehicles() {
  let vehicles = [];
  try {
    const response = await fetch(`${API_BASE}/veiculos`);
    if (!response.ok) throw new Error('Falha ao buscar veículos');
    vehicles = await response.json();
    _vehicleCache = vehicles; 
  } catch (err) {
    console.error('fetchVehicles:', err);
    alert(err.message);
  }

  const clients = _clientCache; 
  const lista = document.getElementById('listaVeiculos');
  
  if (lista) {
    lista.innerHTML = '';
    vehicles.forEach(v => {
      const cliente = clients.find(c => String(c.id_cliente) === String(v.cliente_id));
      const display = `${v.placa || '-'} — ${v.modelo || '-'} (${cliente ? cliente.nome : '-'})`;
      const li = document.createElement('li');
      li.textContent = display;
      li.style.padding = '6px';
      li.style.cursor = 'pointer';
      li.onclick = () => selecionarVeiculoPorId(v.id_veiculo);
      lista.appendChild(li);
    });
  }
}

function selecionarVeiculoPorId(id) {
  const v = _vehicleCache.find(x => String(x.id_veiculo) === String(id)); 
  if (!v) return alert('Veículo não encontrado no cache');
  
  document.getElementById('placa').value = v.placa || '';
  document.getElementById('renavam').value = v.renavam || '';
  document.getElementById('marca').value = v.marca || '';
  document.getElementById('modelo').value = v.modelo || '';
  document.getElementById('ano').value = v.ano || '';
  document.getElementById('cor').value = v.cor || '';
  document.getElementById('chassi').value = v.chassi || '';
  document.getElementById('combustivel').value = v.combustivel || '';
  document.getElementById('categoria').value = v.categoria || '';
  document.getElementById('veiculoObs').value = v.observacoes || '';
  
  if (v.cliente_id) {
    const c = _clientCache.find(cc => String(cc.id_cliente) === String(v.cliente_id)); 
    if (c) {
      document.getElementById('donoNome').value = c.nome || '';
      document.getElementById('donoNome').dataset.clienteId = c.id_cliente;
    }
  }
  document.getElementById('vehicleId').value = v.id_veiculo;
}

/* ---------------- Checklists ---------------- */

async function enviarChecklist(e) {
  if (e && e.preventDefault) e.preventDefault();
  
  const placa = document.getElementById('checkPlaca').value || '';
  const dono = document.getElementById('checkDono').value || '';
  const observacoes = document.getElementById('obsChecklist').value || '';
  const fotosInput = document.getElementById('fotosChecklist');
  const now = new Date();
  const nowISO = now.toISOString().slice(0, 19).replace('T', ' '); 

  const itens = [];
  const checkboxes = [
    { id: 'checkMacaco', value: 'macaco', label: 'Macaco' },
    { id: 'checkEstepe', value: 'estepe', label: 'Estepe' },
    { id: 'checkManual', value: 'manual', label: 'Manual' },
    { id: 'checkChaveReserva', value: 'chave_reserva', label: 'Chave Reserva' },
    { id: 'checkArranhao', value: 'arranhao', label: 'Arranhão' },
    { id: 'checkTrincado', value: 'trincado_vidro', label: 'Trincado (Vidro)' },
    { id: 'checkAmassado', value: 'amassado', label: 'Amassado' },
    { id: 'checkOutros', value: 'outros', label: 'Outros (ver obs.)' }
  ];
  const itensParaImpressao = [];
  checkboxes.forEach(cb => {
    const el = document.getElementById(cb.id);
    if (el && el.checked) {
      itens.push(cb.value);
      itensParaImpressao.push(cb.label);
    }
  });

  const files = [];
  if (fotosInput && fotosInput.files && fotosInput.files.length) {
    for (let i = 0; i < fotosInput.files.length; i++) {
      const f = fotosInput.files[i];
      files.push({ name: f.name, size: f.size, type: f.type });
    }
  }
  
  const payload = {
    placa,
    dono,
    observacoes,
    itens: JSON.stringify(itens),
    fotos: JSON.stringify(files),
    criado_em: nowISO
  };

  try {
    const response = await fetch(`${API_BASE}/checklists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Falha ao salvar checklist');
    }

    alert('Checklist salvo no servidor! Preparando impressão...');
    
  } catch (err) {
    console.error('enviarChecklist:', err);
    alert(`Erro ao salvar: ${err.message}`);
  }

  const printArea = document.getElementById('print-container');
  if (printArea) {
    let htmlItens = itensParaImpressao.length > 0
      ? itensParaImpressao.map(item => `<li>${item}</li>`).join('')
      : '<li>Nenhum item/avaria marcado.</li>';
      
    let htmlFotos = '';
    const previewImgs = document.querySelectorAll('#previewChecklistImagens img.preview-thumb');
    if (previewImgs.length > 0) {
      previewImgs.forEach(img => {
        htmlFotos += `<img src="${img.src}" alt="Foto Checklist">`;
      });
    } else {
      htmlFotos = '<p>Nenhuma foto registrada.</p>';
    }

    printArea.innerHTML = `
      <div style="padding: 10px;">
        <h2>Checklist de Entrada - RevisAuto</h2>
        <p><strong>Data:</strong> ${now.toLocaleString('pt-BR')}</p>
        <hr>
        <p><strong>Cliente (Dono):</strong> ${dono}</p>
        <p><strong>Veículo (Placa):</strong> ${placa}</p>
        <hr>
        <h3>Itens/Avarias Presentes:</h3>
        <ul>${htmlItens}</ul>
        <hr>
        <h3>Observações:</h3>
        <p style="min-height: 40px; border: 1px solid #eee; padding: 5px;">
          ${observacoes || 'Nenhuma observação.'}
        </p>
        <hr>
        <h3>Fotos Registradas:</h3>
        <div class="fotos-container">${htmlFotos}</div>
      </div>
    `;

    window.print();
    printArea.innerHTML = '';
  }
  document.getElementById('formChecklist').reset();
  const previewImgs = document.querySelectorAll('#previewChecklistImagens img.preview-thumb');
  if (previewImgs.length > 0) {
    previewImgs.forEach(img => {
      URL.revokeObjectURL(img.src);
    });
  }
  document.getElementById('previewChecklistImagens').innerHTML = '';
  
  fetchChecklists();
}

async function fetchChecklists() {
  let arr = [];
  try {
    const response = await fetch(`${API_BASE}/checklists`);
    if (!response.ok) throw new Error('Falha ao buscar checklists');
    arr = await response.json();
  } catch (err) {
    console.error('fetchChecklists:', err);
    alert(err.message);
  }

  const ul = document.getElementById('listaChecklists');
  if (!ul) return;
  ul.innerHTML = '';
  arr.forEach(c => {
    const li = document.createElement('li');
    li.style.padding = '6px';
    
    let itensArray = [];
    try {
      if (c.itens) itensArray = JSON.parse(c.itens);
    } catch (e) { }

    const itensDisplay = (itensArray && itensArray.length > 0) 
      ? ` [Itens: ${itensArray.join(', ')}]` 
      : '';
      
    const dataFormatada = c.criado_em ? new Date(c.criado_em).toLocaleString('pt-BR') : 'data-inválida';
    li.textContent = `${dataFormatada} — ${c.placa || '-'} — ${c.dono || '-'}${itensDisplay}`;
    
    ul.appendChild(li);
  });
}

window.addEventListener('load', async () => {
  atualizarCamposPessoa();
  
  await fetchClients();
  await fetchVehicles();
  fetchChecklists();
});