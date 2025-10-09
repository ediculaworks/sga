# Configuração do Mapbox - Rastreamento de Ambulâncias

## 📍 Como obter uma API Key do Mapbox

1. **Criar conta gratuita no Mapbox**
   - Acesse: https://account.mapbox.com/auth/signup/
   - Complete o registro

2. **Criar um Access Token**
   - Acesse: https://account.mapbox.com/access-tokens/
   - Clique em "Create a token"
   - Nome sugerido: "SGA - Rastreamento"
   - Escopos necessários:
     - ✅ `styles:read`
     - ✅ `fonts:read`
     - ✅ `datasets:read`
   - Clique em "Create token"

3. **Copiar o token**
   - Copie o token gerado (começa com `pk.`)

## ⚙️ Configurar no Projeto (Desenvolvimento Local)

1. **Abra o arquivo `.env.local`** na raiz do projeto

2. **Adicione a variável de ambiente:**
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=seu_token_aqui
   ```

3. **Exemplo:**
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWV1dXN1YXJpbyIsImEiOiJjbGV4YW1wbGUxMjM0NTYifQ.exemplo_token_aqui
   ```

4. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🚀 Configurar no Vercel (Produção)

**IMPORTANTE:** O arquivo `.env.local` NÃO é enviado para o Vercel por segurança.

1. **Acesse o Dashboard do Vercel:**
   - Vá para: https://vercel.com/dashboard
   - Selecione seu projeto SGA

2. **Configure a Variável de Ambiente:**
   - Clique em **Settings** (aba superior)
   - No menu lateral, clique em **Environment Variables**
   - Clique em **Add New**

3. **Preencha os campos:**
   - **Name:** `NEXT_PUBLIC_MAPBOX_TOKEN`
   - **Value:** `pk.eyJ...` (seu token completo)
   - **Environment:** Selecione todas (Production, Preview, Development)

4. **Salvar e Redeploy:**
   - Clique em **Save**
   - Vá na aba **Deployments**
   - Clique nos 3 pontinhos do último deploy
   - Selecione **Redeploy**
   - Aguarde o build completar (~2-3 minutos)

5. **Verificar:**
   - Acesse sua aplicação no Vercel
   - Vá para `/chefe-medicos/rastreamento`
   - O mapa deve carregar normalmente

### ✅ Checklist de Deploy no Vercel

- [ ] Token do Mapbox criado (começa com `pk.`)
- [ ] Variável `NEXT_PUBLIC_MAPBOX_TOKEN` adicionada no Vercel
- [ ] Variável disponível para Production, Preview e Development
- [ ] Redeploy realizado após adicionar a variável
- [ ] Página de rastreamento testada após deploy

## 🆓 Limites do Plano Gratuito

O Mapbox oferece:
- ✅ **50.000 carregamentos de mapa/mês** (GRÁTIS)
- ✅ Sem limite de markers
- ✅ Sem limite de mapas simultâneos
- ✅ Atualização em tempo real

Para o SGA, isso é mais do que suficiente!

## 🧪 Testar o Rastreamento

1. Acesse: `http://localhost:3000/chefe-medicos/rastreamento`
2. O mapa deve carregar automaticamente
3. Ambulâncias em operação aparecerão como markers

## ❓ Troubleshooting

**Erro: "Invalid access token" (Desenvolvimento)**
- Verifique se copiou o token completo (incluindo `pk.`)
- Verifique se a variável está em `.env.local`
- Reinicie o servidor (`npm run dev`)

**Mapa não carrega no Localhost:**
- Verifique a conexão com internet
- Abra o Console (F12) e veja se há erros
- Verifique se o token está ativo no dashboard do Mapbox
- Confirme que a variável começa com `NEXT_PUBLIC_`

**Mapa não carrega no Vercel (Produção):**
- ✅ **Causa mais comum:** Variável de ambiente não configurada no Vercel
- Acesse Settings → Environment Variables no dashboard do Vercel
- Confirme que `NEXT_PUBLIC_MAPBOX_TOKEN` está presente
- Verifique se selecionou todos os ambientes (Production, Preview, Development)
- Após adicionar/modificar, faça **Redeploy** obrigatório
- Aguarde o build completar antes de testar

**Tela em branco ou apenas loading:**
- Abra o Console do navegador (F12)
- Procure por erros relacionados ao Mapbox
- Verifique se a mensagem "Token do Mapbox não configurado" aparece
- Se aparecer a mensagem de erro customizada, siga as instruções na tela

**Variável configurada mas mapa não carrega:**
- Verifique se fez redeploy APÓS configurar a variável
- Limpe o cache do navegador (Ctrl + Shift + R)
- Teste em uma aba anônima
- Verifique se o token não expirou no dashboard do Mapbox

## 📚 Documentação

- Mapbox GL JS: https://docs.mapbox.com/mapbox-gl-js/
- React Map GL: https://visgl.github.io/react-map-gl/
