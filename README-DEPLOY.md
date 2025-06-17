# 📦 Guia de Deploy - Orçamento SEATEC

## 🚀 Como fazer o build da aplicação

### 1. Preparar o ambiente
```bash
# Instalar dependências
npm install

# Verificar se tudo está funcionando
npm run dev
```

### 2. Gerar o build de produção
```bash
# Criar build otimizado
npm run build
```

Isso criará uma pasta `dist/` com todos os arquivos otimizados para produção.

## 🌐 Deploy no cPanel da Hostgator

### Passo 1: Acessar o cPanel
1. Faça login no seu cPanel da Hostgator
2. Localize a seção "Arquivos" e clique em "Gerenciador de Arquivos"

### Passo 2: Preparar o diretório
1. Navegue até a pasta `public_html` (ou a pasta do seu domínio)
2. Se houver arquivos antigos, faça backup ou remova-os
3. Certifique-se de que a pasta esteja limpa

### Passo 3: Upload dos arquivos
1. Na pasta `dist/` do seu projeto local, selecione TODOS os arquivos
2. Comprima em um arquivo ZIP
3. No cPanel, clique em "Upload" e envie o arquivo ZIP
4. Após o upload, clique com o botão direito no arquivo ZIP e selecione "Extrair"
5. Mova todos os arquivos extraídos para a raiz da pasta `public_html`

### Passo 4: Configurar o .htaccess
1. Certifique-se de que o arquivo `.htaccess` foi enviado junto com os outros arquivos
2. Se não aparecer, crie um novo arquivo chamado `.htaccess` com o conteúdo fornecido
3. Este arquivo é essencial para o funcionamento correto da aplicação React

### Passo 5: Verificar as imagens
1. Certifique-se de que todas as imagens estão na pasta `assets/`
2. Verifique se o arquivo `logo.png` está na raiz junto com o `index.html`

## 🔧 Estrutura de arquivos no servidor

Após o deploy, sua estrutura deve ficar assim:
```
public_html/
├── index.html
├── logo.png
├── .htaccess
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   ├── gs300.png
│   ├── d2.jpg
│   ├── totem.png
│   ├── rede.png
│   └── raspberryServer.jpeg
└── vite.svg
```

## ✅ Verificações pós-deploy

1. **Teste a aplicação**: Acesse seu domínio e verifique se carrega corretamente
2. **Teste a navegação**: Verifique se todas as páginas funcionam
3. **Teste o PDF**: Gere um PDF para verificar se as imagens aparecem
4. **Teste o WhatsApp**: Verifique se o botão de WhatsApp funciona
5. **Teste responsivo**: Acesse pelo celular para verificar a responsividade

## 🐛 Solução de problemas comuns

### Página em branco
- Verifique se o arquivo `.htaccess` está presente
- Confirme se todos os arquivos foram extraídos corretamente
- Verifique o console do navegador para erros

### Imagens não carregam
- Confirme se as imagens estão na pasta `assets/`
- Verifique se os nomes dos arquivos estão corretos
- Certifique-se de que não há caracteres especiais nos nomes

### Erro 404 ao navegar
- Verifique se o arquivo `.htaccess` está configurado corretamente
- Confirme se o mod_rewrite está habilitado no servidor

### PDF sem imagens
- Verifique se o `logo.png` está na raiz do site
- Confirme se as imagens dos equipamentos estão na pasta `assets/`
- Teste se as imagens carregam diretamente no navegador

## 📞 Suporte

Se encontrar problemas durante o deploy, verifique:
1. Console do navegador para erros JavaScript
2. Logs de erro do servidor no cPanel
3. Se todas as dependências foram incluídas no build

## 🎯 Otimizações incluídas

- ✅ Minificação de CSS e JavaScript
- ✅ Compressão GZIP habilitada
- ✅ Cache de assets configurado
- ✅ Imagens otimizadas
- ✅ Lazy loading implementado
- ✅ Bundle splitting para melhor performance