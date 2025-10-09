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

## ⚙️ Configurar no Projeto

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

**Erro: "Invalid access token"**
- Verifique se copiou o token completo (incluindo `pk.`)
- Verifique se a variável está em `.env.local`
- Reinicie o servidor

**Mapa não carrega:**
- Verifique a conexão com internet
- Abra o Console (F12) e veja se há erros
- Verifique se o token está ativo no dashboard do Mapbox

## 📚 Documentação

- Mapbox GL JS: https://docs.mapbox.com/mapbox-gl-js/
- React Map GL: https://visgl.github.io/react-map-gl/
