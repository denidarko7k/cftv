import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcryptjs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PASSWORD = 'jb@jbti123';
const DEFAULT_OPERATOR_NAMES = ['Denisson', 'Cássio', 'Jhonata', 'Jhony', 'Lucas'];

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '15mb' }));

const dataDir = `${__dirname}/../data`;
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbFile = `${dataDir}/ocorrencias.json`;
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { ocorrencias: [], operadores: [] });

// SSE clients
const sseClients = new Set();

function broadcastOcorrencias() {
  const payload = JSON.stringify((db.data?.ocorrencias || []).slice().reverse());
  for (const res of sseClients) {
    try {
      res.write(`event: ocorrencias\n`);
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // ignore write errors
    }
  }
}

function broadcastAnalises() {
  const payload = JSON.stringify((db.data?.analisesInternas || []).slice().reverse());
  for (const res of sseClients) {
    try {
      res.write(`event: analises-internas\n`);
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // ignore write errors
    }
  }
}

async function initDB() {
  await db.read();
  db.data ||= { ocorrencias: [], analisesInternas: [], operadores: [] };
  db.data.ocorrencias ||= [];
  db.data.analisesInternas ||= [];
  db.data.operadores ||= [];

  const existingNames = new Set(db.data.operadores.map((operator) => String(operator.nome).toLowerCase()));
  let nextId = db.data.operadores.reduce((max, operator) => Math.max(max, Number(operator.id) || 0), 0) + 1;
  for (const nome of DEFAULT_OPERATOR_NAMES) {
    if (!existingNames.has(nome.toLowerCase())) {
      db.data.operadores.push({
        id: String(nextId++),
        nome,
        senha: bcrypt.hashSync(DEFAULT_PASSWORD, 10),
        mustChangePassword: true,
      });
    }
  }
  await db.write();
}

initDB().catch((e) => console.error('lowdb init error', e));

app.get('/api/ocorrencias', async (req, res) => {
  await db.read();
  const rows = (db.data?.ocorrencias || []).slice().reverse();
  res.json(rows);
});

app.get('/api/analises-internas', async (req, res) => {
  await db.read();
  res.json((db.data?.analisesInternas || []).slice().reverse());
});

app.post('/api/analises-internas', async (req, res) => {
  await db.read();
  const item = req.body || {};
  const nextId = ((db.data?.analisesInternas || []).reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) || 0) + 1;
  const newRow = {
    ...item,
    id: nextId,
    valor: Number(item.valor) || 0,
    evidencia: Array.isArray(item.evidencia) ? item.evidencia : [],
    imagens: Array.isArray(item.imagens) ? item.imagens : [],
    onedriveLink: String(item.onedriveLink || ''),
  };
  db.data.analisesInternas.push(newRow);
  await db.write();
  broadcastAnalises();
  res.status(201).json(newRow);
});

app.delete('/api/analises-internas/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const before = db.data.analisesInternas.length;
  db.data.analisesInternas = db.data.analisesInternas.filter((row) => Number(row.id) !== id);
  if (before === db.data.analisesInternas.length) return res.status(404).json({ error: 'Análise não encontrada' });
  await db.write();
  broadcastAnalises();
  res.json({ success: true });
});

// Operators endpoints
app.get('/api/operadores', async (req, res) => {
  await db.read();
  res.json(db.data?.operadores || []);
});

app.put('/api/operadores', async (req, res) => {
  await db.read();
  const ops = Array.isArray(req.body) ? req.body : [];
  // Ensure passwords are hashed
  db.data.operadores = (ops || []).map((o) => {
    const copy = { ...o };
    if (copy.senha && typeof copy.senha === 'string') {
      // if not already bcrypt hash (starts with $2), hash it
      if (!copy.senha.startsWith('$2')) {
        copy.senha = bcrypt.hashSync(copy.senha, 10);
      }
    }
    return copy;
  });
  await db.write();
  res.json(db.data.operadores);
});

app.patch('/api/operadores/:id/password', async (req, res) => {
  await db.read();
  const id = String(req.params.id);
  const { senha, senhaAtual } = req.body || {};
  if (!senha) return res.status(400).json({ error: 'Senha obrigatória' });
  const idx = (db.data.operadores || []).findIndex((o) => String(o.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Operador não encontrado' });
  const current = db.data.operadores[idx].senha || '';
  const currentMatches = typeof current === 'string' && current.startsWith('$2')
    ? bcrypt.compareSync(String(senhaAtual || ''), current)
    : String(senhaAtual || '') === String(current);
  if (!currentMatches) return res.status(401).json({ error: 'Senha atual incorreta' });
  // Hash the new password before saving
  db.data.operadores[idx].senha = bcrypt.hashSync(String(senha), 10);
  db.data.operadores[idx].mustChangePassword = false;
  await db.write();
  res.json(db.data.operadores[idx]);
});

// Login endpoint: accepts { nome, senha } and returns operador on success
app.post('/api/login', async (req, res) => {
  await db.read();
  const { nome, senha } = req.body || {};
  if (!nome || !senha) return res.status(400).json({ error: 'Nome e senha são obrigatórios' });
  const op = (db.data.operadores || []).find((o) => String(o.nome).toLowerCase() === String(nome).toLowerCase());
  if (!op) return res.status(401).json({ error: 'Usuário ou senha incorretos' });
  // Allow first-access using the institutional default password when
  // the operator record requires a password change (`mustChangePassword`).
  if (op.mustChangePassword === true && String(senha) === DEFAULT_PASSWORD) {
    const safe = { ...op, senha: undefined };
    return res.json(safe);
  }

  const stored = op.senha || '';
  let match = false;
  try {
    if (typeof stored === 'string' && stored.startsWith('$2')) {
      match = bcrypt.compareSync(String(senha), stored);
    } else {
      // legacy plain-text support
      match = String(senha) === String(stored);
    }
  } catch (e) {
    match = false;
  }
  if (!match) return res.status(401).json({ error: 'Usuário ou senha incorretos' });
  // mask senha before returning
  const safe = { ...op, senha: undefined };
  res.json(safe);
});

// Server-Sent Events endpoint for real-time updates
app.get('/api/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // send current data immediately
  await db.read();
  const initData = JSON.stringify((db.data?.ocorrencias || []).slice().reverse());
  res.write(`event: ocorrencias\n`);
  res.write(`data: ${initData}\n\n`);
  const initAnalises = JSON.stringify((db.data?.analisesInternas || []).slice().reverse());
  res.write(`event: analises-internas\n`);
  res.write(`data: ${initAnalises}\n\n`);

  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

app.get('/api/ocorrencias/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const row = (db.data?.ocorrencias || []).find((r) => Number(r.id) === id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.post('/api/ocorrencias', async (req, res) => {
  await db.read();
  const o = req.body || {};
  const nextId = ((db.data?.ocorrencias || []).reduce((m, it) => Math.max(m, Number(it.id || 0)), 0) || 0) + 1;
  const newRow = {
    id: nextId,
    tipo: o.tipo || '',
    loja: o.loja || '',
    descricao: o.descricao || '',
    solicitante_tipo: o.solicitante_tipo || '',
    solicitante_nome: o.solicitante_nome || '',
    situacao: o.situacao || '',
    produto: o.produto || null,
    valor: o.valor != null ? Number(o.valor) : null,
    finalizador: o.finalizador || '',
    midia: o.midia || null,
    dataHora: o.dataHora || new Date().toISOString(),
  };
  db.data.ocorrencias.push(newRow);
  await db.write();
  broadcastOcorrencias();
  res.status(201).json(newRow);
});

app.delete('/api/ocorrencias/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const before = db.data.ocorrencias.length;
  db.data.ocorrencias = db.data.ocorrencias.filter((r) => Number(r.id) !== id);
  const after = db.data.ocorrencias.length;
  await db.write();
  broadcastOcorrencias();
  if (before === after) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server listening on http://0.0.0.0:${PORT}`);
});

export default app;
