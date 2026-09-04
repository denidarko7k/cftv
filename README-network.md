Acessando o app na rede local

- Backend (API): porta 4000
- Frontend (dev): porta 3000

Passos para rodar localmente (máquina host):

1. Instalar dependências:

```
npm install
```

2. Iniciar ambos (frontend + backend):

```
npm run start:dev
```

3. Descobrir o IP local da máquina host (ex: `192.168.0.42`). No Windows, rode:

```
ipconfig
```

4. Em outro computador na mesma rede, abra no navegador:

- Frontend (Vite dev): `http://<HOST_IP>:3000`
- API: `http://<HOST_IP>:4000/api/ocorrencias`

Observações:

- O servidor Express já está configurado para escutar em `0.0.0.0` e o Vite é iniciado com `--host=0.0.0.0`, portanto ambos aceitam conexões de outras máquinas.
- Se o acesso externo falhar, verifique o firewall do Windows e permita conexões nas portas 3000 e 4000.
- Para produção, considere usar `npm run build` e servir os arquivos estáticos com um servidor (Nginx/PM2) e proteger/expôr apenas o necessário.

Inserir dados via API

Você pode criar ocorrências reais usando `POST /api/ocorrencias` com JSON. Exemplo usando `curl` (de outro PC ou do host):

```bash
curl -X POST "http://<HOST_IP>:4000/api/ocorrencias" \
	-H "Content-Type: application/json" \
	-d '{"tipo":"Furto","loja":"Loja C","descricao":"Descrição...","solicitante_tipo":"Cliente","solicitante_nome":"Ana"}'
```

Abrir portas no Windows Firewall (se necessário)

Execute PowerShell como Administrador no host e rode:

```powershell
New-NetFirewallRule -DisplayName "App Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "App Backend" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
```

Serviço e disponibilidade contínua

- Para manter o backend sempre rodando em produção, considere usar `pm2` ou um serviço do Windows. Exemplo com `pm2`:

```bash
npm i -g pm2
pm2 start server/index.js --name ocorrencias-api --watch
pm2 save
```

Isso deixa a API disponível para os outros dois PCs enquanto o host estiver na mesma rede.
