import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dataDir = `${__dirname}/../data`;
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbFile = `${dataDir}/ocorrencias.json`;
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { ocorrencias: [] });

async function seed() {
  await db.read();
  db.data ||= { ocorrencias: [] };

  const sample = [
    {
      id: 1,
      tipo: 'Furto',
      loja: 'Loja A',
      descricao: 'Furto de produto na entrada',
      solicitante_tipo: 'Cliente',
      solicitante_nome: 'João Silva',
      situacao: 'Aberto',
      produto: 'Celular',
      valor: 1200,
      finalizador: '',
      midia: null,
      dataHora: new Date().toISOString(),
    },
    {
      id: 2,
      tipo: 'Quebra',
      loja: 'Loja B',
      descricao: 'Quebra de vitrine',
      solicitante_tipo: 'Funcionário',
      solicitante_nome: 'Maria Souza',
      situacao: 'Em andamento',
      produto: null,
      valor: null,
      finalizador: '',
      midia: null,
      dataHora: new Date().toISOString(),
    },
  ];

  // avoid duplicating if already seeded
  if ((db.data.ocorrencias || []).length === 0) {
    db.data.ocorrencias.push(...sample);
    await db.write();
    console.log('Seeded ocorrencias.json with sample data.');
  } else {
    console.log('Database already has data; skipping seed.');
  }
}

seed().catch((e) => console.error(e));
