Instruções para adicionar a logo "Grupo JB" ao app

1) Onde salvar a imagem (recomendado):

 - Salve a imagem exata fornecida pelo time neste projeto no caminho recomendado:

  `public/assets/aistudio/logo-grupo-jb.jpg`

  (O Vite serve arquivos colocados em `public/` direto na raiz: `/assets/aistudio/logo-grupo-jb.jpg`).

 - Alternativa (menos recomendado): se preferir salvar direto na raiz `public/`, use:

  `public/logo-grupo-jb.jpg`

  Nesse caso altere o `src` no `src/components/Navbar.tsx` para `/logo-grupo-jb.jpg`.

2) O que eu já ajustei no código:

- O componente `src/components/Navbar.tsx` já referencia `/logo-grupo-jb.jpg`.
  - Se você salvar no caminho recomendado (`public/logo-grupo-jb.jpg`) não é necessário mudar nada.

3) Como salvar a imagem (Windows):

- Salve o arquivo anexo (a logo que você enviou) como `logo-grupo-jb.jpg` em `public/`.
- Exemplo de passos rápidos:

  - Abra a imagem no visualizador que você usou para baixar
  - Clique em "Salvar como" e selecione `C:\Users\<seu-user>\Desktop\Lucas\sistema-de-ocorrências-cftv\public\logo-grupo-jb.jpg`

4) Reiniciar servidor de desenvolvimento (se já está rodando):

- Se o Vite já estiver rodando, salve o arquivo e o navegador deve atualizar automaticamente. Caso não atualize, pare e rode novamente:

```powershell
npm run dev
```

ou

```powershell
npx vite
```

5) Ajustes opcionais de estilo:

- Se quiser que o logo ocupe mais espaço no header, edite `src/components/Navbar.tsx` e aumente as classes `h-11 w-11` para `h-14 w-14` ou ajuste `object-contain` para `object-cover` conforme o resultado visual desejado.

6) Privacidade / nota legal:

- Esse aplicativo é usado internamente; coloque a imagem oficial fornecida pela empresa.

Se quiser, eu posso:
- Alterar o `src` para apontar para `public/assets/aistudio/logo-grupo-jb.png` e criar um recorde no README com instruções; ou
- Tentar inserir uma versão em SVG (se você enviar o SVG) para melhor qualidade em diferentes resoluções.

Quer que eu altere o `src` para `public/assets/aistudio/logo-grupo-jb.jpg` (prefere organizar em `assets/aistudio`) ou deixo como `/logo-grupo-jb.jpg`?