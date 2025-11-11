const express = require('express');
const path = require('path');
const db = require('./conexao.js');
const session = require('express-session');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'P@$$0rd', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const checkAuth = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ error: 'Acesso não autorizado' });
        }
        return res.redirect('/');
    }
    next();
};

app.post('/api/login', async (req, res) => {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }
    try {
        const sql = 'SELECT * FROM usuarios WHERE usuario = ? AND senha = ?';
        const [rows] = await db.execute(sql, [usuario, senha]);
        const user = rows[0]

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        req.session.isLoggedIn = true;
        req.session.username = user.usuario;
        req.session.userId = user.id;
        
        res.json({ message: 'Login bem-sucedido!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Rota GET para a página de login
app.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/app');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota GET para a página principal do app
app.get('/app', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// GET /api/clientes
app.get('/api/clientes', checkAuth, async (req, res) => {
  try {
    const sql = `
      SELECT 
        id_cliente, nome, tipo_pessoa, cpf, rg, data_nascimento,
        cnpj, insc_estadual, insc_municipal, telefone,
        telefone_obs, 
        celular,
        celular_obs, 
        email,
        email_obs, 
        rua, bairro, cidade, uf, cep, data_cadastro
      FROM cad_cliente 
      ORDER BY nome
    `;
    const [rows] = await db.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /clientes (Inserir)
app.post('/api/clientes', checkAuth, async (req, res) => {
  try {
    const data = req.body;
    const campos = Object.keys(data);
    const placeholders = campos.map(() => '?').join(',');
    const sql = `INSERT INTO cad_cliente (${campos.join(',')}) VALUES (${placeholders})`;
    const [result] = await db.execute(sql, Object.values(data));
    res.status(201).json({ id_cliente: result.insertId, ...data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /clientes (Atualizar)
app.put('/api/clientes/:id', checkAuth, async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    const campos = Object.keys(data).map(k => `${k} = ?`).join(',');
    const sql = `UPDATE cad_cliente SET ${campos} WHERE id_cliente = ?`;
    await db.execute(sql, [...Object.values(data), id]);
    res.json({ message: 'Cliente atualizado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /clientes
app.delete('/api/clientes/:id', checkAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const [veiculos] = await db.execute('SELECT 1 FROM cad_veiculo WHERE fk_id_cliente = ?', [id]);
    if (veiculos.length > 0) {
      return res.status(400).json({ error: 'Não é possível excluir cliente. Ele possui veículos cadastrados.' });
    }
    await db.execute('DELETE FROM cad_cliente WHERE id_cliente = ?', [id]);
    res.json({ message: 'Cliente excluído com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});


// GET /veiculos
app.get('/api/veiculos', checkAuth, async (req, res) => {
  try {
    const sql = `
      SELECT 
        id_veiculo, placa, renavam, marca, modelo, ano, cor, 
        fk_id_cliente AS cliente_id, 
        chassi, combustivel, categoria, observacoes
      FROM cad_veiculo
    `;
    const [rows] = await db.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /veiculos
app.post('/api/veiculos', checkAuth, async (req, res) => {
  try {
    const data = req.body;

    const campos = Object.keys(data);
    const placeholders = campos.map(() => '?').join(',');
    const sql = `INSERT INTO cad_veiculo (${campos.join(',')}) VALUES (${placeholders})`;

    const [result] = await db.execute(sql, Object.values(data));
    res.status(201).json({ id_veiculo: result.insertId, ...data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /veiculos
app.put('/api/veiculos/:id', checkAuth, async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    const campos = Object.keys(data).map(k => `${k} = ?`).join(',');
    const sql = `UPDATE cad_veiculo SET ${campos} WHERE id_veiculo = ?`;
    await db.execute(sql, [...Object.values(data), id]);
    res.json({ message: 'Veículo atualizado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /veiculos
app.delete('/api/veiculos/:id', checkAuth, async (req, res) => {
  try {
    const id = req.params.id;
    await db.execute('DELETE FROM cad_veiculo WHERE id_veiculo = ?', [id]);
    res.json({ message: 'Veículo excluído com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// GET /checklists
app.get('/api/checklists', checkAuth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM checklist ORDER BY criado_em DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /checklists
app.post('/api/checklists', checkAuth, async (req, res) => {
  try {
    const data = req.body;
    const campos = Object.keys(data);
    const placeholders = campos.map(() => '?').join(',');
    const sql = `INSERT INTO checklist (${campos.join(',')}) VALUES (${placeholders})`;

    const [result] = await db.execute(sql, Object.values(data));
    res.status(201).json({ id_checklist: result.insertId, ...data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

app.get('_', checkAuth, (req, res) => {
  res.redirect('/app'); // Se estiver logado e tentar acessar uma rota inválida, volta pro app
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});