# Diretrizes de Otimização e Revisão de Código - SGA

Este documento contém diretrizes genéricas para otimização do sistema SGA, focando em:
- Melhor experiência do usuário (performance, velocidade de carregamento)
- Redução de gasto de tokens desnecessários
- Redução do bundle size
- Eliminação de redundâncias
- Boas práticas de performance

---

## 📋 Checklist de Revisão

Quando executar estas diretrizes, você deve:

1. ✅ Identificar todas as alterações ainda não revisadas por esta rotina
2. ✅ Aplicar as otimizações conforme as categorias abaixo
3. ✅ Documentar as mudanças realizadas
4. ✅ Testar se as otimizações não quebraram funcionalidades

---

## 🎯 Problemas Identificados e Soluções

### 1. **React Query - Refetch Excessivo**

#### ❌ Problema
- Hook `useOcorrenciasDisponiveis` configurado com `refetchInterval: 30000` (30 segundos)
- Causa re-renders frequentes e consultas desnecessárias ao banco
- Aumenta uso de banda e processamento do servidor

#### ✅ Solução
```typescript
// ANTES
refetchInterval: 30000, // Refetch a cada 30 segundos

// DEPOIS
// Remover refetchInterval ou aumentar para 5 minutos
refetchInterval: false, // Desabilitar polling automático
// OU
refetchInterval: 1000 * 60 * 5, // 5 minutos apenas se necessário
```

**Alternativa melhor:**
- Usar invalidação manual após ações (confirmar participação, criar ocorrência)
- Implementar WebSocket/Realtime do Supabase apenas para notificações críticas

---

### 2. **Date-fns - Imports Pesados**

#### ❌ Problema
- Múltiplos arquivos importando `date-fns` completo (7 arquivos)
- Aumenta bundle size desnecessariamente
- A biblioteca tem tree-shaking limitado

#### ✅ Solução
```typescript
// ANTES
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// DEPOIS - Usar imports específicos
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
```

**Alternativa ainda melhor:**
- Criar funções utilitárias centralizadas em `src/lib/utils/date.ts`
- Evitar duplicação de formatações

---

### 3. **React Query - Queries Duplicadas e Não Otimizadas**

#### ❌ Problema
- Múltiplas queries com `staleTime` de 5 minutos, mas sem `gcTime` apropriado
- Queries complexas com múltiplos JOINs que podem ser otimizadas
- `useMedicoStats` faz 3 queries separadas que poderiam ser combinadas

#### ✅ Solução

**A) Otimizar configuração global do QueryClient:**
```typescript
// src/components/providers/QueryProvider.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Adicionar explicitamente
      refetchOnReconnect: true, // Refetch ao reconectar
    },
  },
})
```

**B) Combinar queries relacionadas:**
```typescript
// useMedicoStats - Considerar criar uma view no Supabase
// ou usar RPC (function) para retornar todos os stats de uma vez
// Reduz de 3 round-trips para 1
```

**C) Usar select para transformar dados:**
```typescript
const { data } = useQuery({
  queryKey: ['pacientes'],
  queryFn: fetchPacientes,
  select: (data) => {
    // Transformar dados aqui, fora do componente
    return data.map(processPaciente);
  }
});
```

---

### 4. **Componentes - Funções Inline e Re-renders**

#### ❌ Problema
- Funções utilitárias sendo criadas dentro de componentes (ex: `formatCurrency`, `getBadgeColor`, `formatLabel`)
- Causam recriação em cada render
- Aumentam uso de memória

#### ✅ Solução
```typescript
// ANTES - Dentro do componente
function MedicoDashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
}

// DEPOIS - Fora do componente ou em utils
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// OU em src/lib/utils/formatters.ts
```

**Mover para arquivos utilitários:**
- `formatCurrency` → `src/lib/utils/formatters.ts`
- `getBadgeColor` → `src/lib/utils/styles.ts` ou componente Badge customizado
- `formatLabel` → `src/lib/utils/formatters.ts`

---

### 5. **Lucide Icons - Imports Específicos**

#### ❌ Problema
- Múltiplos ícones sendo importados individualmente em cada arquivo
- Aumenta o número de imports e pode aumentar bundle

#### ✅ Solução
```typescript
// MANTER ASSIM - Lucide já tem tree-shaking otimizado
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

// NÃO fazer isso:
import * as Icons from 'lucide-react'; // ❌
```

**Observação:** Lucide-react já é otimizado. Manter imports nomeados.

---

### 6. **Supabase Queries - Otimização de SELECT**

#### ❌ Problema
- Queries buscando todos os campos mesmo quando não necessários
- Queries com múltiplos níveis de JOINs que podem ser simplificados
- `PacientesTable` busca todos os pacientes de uma vez (pode ser lento com muitos registros)

#### ✅ Solução

**A) Selecionar apenas campos necessários:**
```typescript
// ANTES
.select('*')

// DEPOIS
.select('id, nome_completo, cpf, idade, sexo')
```

**B) Implementar paginação no servidor:**
```typescript
// PacientesTable - Adicionar paginação server-side
const { data, error } = await supabase
  .from('pacientes')
  .select('...', { count: 'exact' })
  .range(startIndex, endIndex)
  .order('nome_completo');
```

**C) Criar views ou RPC functions no Supabase:**
```sql
-- View para últimos atendimentos
CREATE VIEW pacientes_com_ultimo_atendimento AS
SELECT
  p.*,
  (SELECT row_to_json(x) FROM (
    SELECT a.data_atendimento, o.local_ocorrencia, u.nome_completo as medico_nome
    FROM atendimentos a
    JOIN ocorrencias o ON a.ocorrencia_id = o.id
    JOIN usuarios u ON a.medico_id = u.id
    WHERE a.paciente_id = p.id
    ORDER BY a.data_atendimento DESC
    LIMIT 1
  ) x) as ultimo_atendimento
FROM pacientes p;
```

---

### 7. **CSS - React Big Calendar**

#### ⚠️ Observação
- Estilos customizados no `globals.css` estão OK
- Considerar extrair para arquivo separado se crescer muito: `calendar.css`
- Usar CSS Modules ou Tailwind para componentes específicos

#### ✅ Solução (Opcional)
```typescript
// Criar src/styles/calendar.css
// Importar apenas nas páginas de agenda
import '@/styles/calendar.css';
```

---

### 8. **AuthStore - Persistência Zustand**

#### ⚠️ Observação
- Zustand com `persist` está salvando no localStorage
- Pode causar hydration errors no Next.js 15
- Dados sensíveis no localStorage podem ser vulnerabilidade

#### ✅ Solução

**A) Usar cookies HTTP-only (mais seguro):**
```typescript
// Mover autenticação para cookies server-side
// Usar middleware do Next.js para validar sessão
```

**B) Se manter localStorage, adicionar hydration check:**
```typescript
// authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... store
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      // Adicionar skipHydration para Next.js
      skipHydration: true,
    }
  )
);

// Hidratar manualmente no client
useEffect(() => {
  useAuthStore.persist.rehydrate();
}, []);
```

---

### 9. **Next.js - Configurações de Build**

#### ✅ Otimizações Recomendadas

Adicionar ao `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Otimizações de build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental - Otimizações modernas
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
    ],
  },

  // Imagens otimizadas
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Headers de cache
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

---

### 10. **Componentes - Memoização e Otimização**

#### ❌ Problema
- Componentes sem `React.memo` quando recebem props estáveis
- Callbacks não memorizados com `useCallback`
- Valores computados não memorizados com `useMemo`

#### ✅ Solução

**A) Usar React.memo para componentes:**
```typescript
// Componentes de lista ou cards
export const OcorrenciaCard = React.memo(({ ocorrencia, onVerDetalhes }: Props) => {
  // ...
});
```

**B) Usar useCallback para handlers:**
```typescript
const handleVerDetalhes = useCallback((id: number) => {
  setModalOcorrenciaId(id);
  setIsModalOpen(true);
}, []);
```

**C) Usar useMemo para computações:**
```typescript
const pacientesFiltrados = useMemo(() => {
  // Lógica de filtro
}, [pacientes, searchTerm, selectedMedico]);
```

---

## 🔧 Funções Utilitárias Recomendadas

Criar arquivos centralizados:

### `src/lib/utils/formatters.ts`
```typescript
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | Date, format: string = 'dd/MM/yyyy'): string => {
  return format(new Date(date), format, { locale: ptBR });
};

export const formatLabel = (value: string): string => {
  const labels: Record<string, string> = {
    EVENTO: 'Evento',
    EMERGENCIA: 'Emergência',
    DOMICILIAR: 'Domiciliar',
    TRANSFERENCIA: 'Transferência',
    BASICA: 'Básica',
    MEDICO: 'Médico',
    ENFERMEIRO: 'Enfermeiro',
  };
  return labels[value] || value;
};
```

### `src/lib/utils/styles.ts`
```typescript
export const getBadgeColor = (type: string, value: string): string => {
  // Lógica centralizada de cores
  // ...
};

export const getStatusColor = (status: string): string => {
  // ...
};
```

---

## 📊 Métricas de Performance

Após aplicar otimizações, verificar:

1. **Bundle Size**
   ```bash
   npm run build
   # Verificar tamanho dos chunks em .next/static
   ```

2. **Lighthouse Score**
   - Performance > 90
   - Accessibility > 95
   - Best Practices > 90
   - SEO > 90

3. **Tempo de Carregamento**
   - First Contentful Paint (FCP) < 1.5s
   - Time to Interactive (TTI) < 3s
   - Largest Contentful Paint (LCP) < 2.5s

---

## 🚀 Roteiro de Aplicação

1. **Fase 1 - Otimizações Rápidas** (Impacto Alto)
   - [ ] Remover `refetchInterval` de `useOcorrenciasDisponiveis`
   - [ ] Mover funções utilitárias para fora de componentes
   - [ ] Otimizar imports de date-fns
   - [ ] Adicionar configurações de build no next.config.ts

2. **Fase 2 - Refatorações** (Impacto Médio)
   - [ ] Criar arquivo `formatters.ts` centralizado
   - [ ] Criar arquivo `styles.ts` para cores/badges
   - [ ] Implementar paginação server-side em `PacientesTable`
   - [ ] Adicionar memoização (React.memo, useMemo, useCallback)

3. **Fase 3 - Otimizações Avançadas** (Impacto Médio-Longo Prazo)
   - [ ] Criar views otimizadas no Supabase
   - [ ] Combinar queries relacionadas
   - [ ] Implementar code-splitting para rotas pesadas
   - [ ] Considerar Server Components onde aplicável

4. **Fase 4 - Infraestrutura** (Impacto Longo Prazo)
   - [ ] Migrar auth para cookies HTTP-only
   - [ ] Implementar Supabase Realtime apenas para notificações críticas
   - [ ] Adicionar CDN para assets estáticos
   - [ ] Implementar Service Worker para cache

---

## ⚠️ Checklist de Segurança

- [ ] Não expor variáveis sensíveis no client (apenas NEXT_PUBLIC_*)
- [ ] Validar RLS (Row Level Security) em todas as tabelas
- [ ] Sanitizar inputs do usuário
- [ ] Implementar rate limiting nas queries
- [ ] Usar HTTPS em produção
- [ ] Configurar CSP (Content Security Policy) headers

---

## 📝 Registro de Otimizações

Sempre que aplicar estas diretrizes, documentar aqui:

### [2025-10-08] - Revisão #2
- **Arquivos modificados:**
  - `src/lib/utils/formatters.ts` (adicionadas funções de formatação de input)
  - `src/components/ocorrencias/CriarOcorrenciaForm.tsx`
  - `src/components/ocorrencias/OcorrenciasTable.tsx`
  - `src/app/(dashboard)/chefe-medicos/ocorrencias/page.tsx`

- **Otimizações aplicadas:**
  1. ✅ **Funções inline removidas**: Criadas `formatarInputData` e `formatarInputHora` em formatters.ts
  2. ✅ **Imports otimizados**: Removido uso de default imports de date-fns (corrigido para named imports)
  3. ✅ **Memoização adicionada**:
     - OcorrenciasTable: useMemo para filtros e paginação
     - OcorrenciasTable: useCallback para todos os handlers (busca, filtros, ações)
  4. ✅ **Código centralizado**: Removidas duplicações de labels (STATUS_LABELS, TIPO_TRABALHO_LABELS, TIPO_AMBULANCIA_LABELS)
  5. ✅ **TypeScript corrigido**: TipoPerfil.CHEFE_MEDICOS ao invés de string literal
  6. ✅ **Redução de re-renders**: Handlers memorizados previnem recriação em cada render

- **Impacto estimado:**
  - ⚡ **Menos re-renders**: Memoização evita renderizações desnecessárias em tabelas grandes
  - 💾 **Código reutilizável**: Funções de formatação centralizadas (formatarInputData, formatarInputHora)
  - 🎯 **Código limpo**: Remoção de duplicações e funções inline
  - 📦 **Bundle otimizado**: Imports corretos de date-fns permitem melhor tree-shaking

- **Problemas encontrados e corrigidos:**
  - Default imports de date-fns causando erros TypeScript (corrigido para named imports)
  - Perfil CHEFE_MEDICOS como string literal (corrigido para TipoPerfil.CHEFE_MEDICOS)
  - Referência a occ.ambulancia.placa sem join (corrigido para occ.ambulancia_id)

---

### [2025-10-08] - Revisão #1
- **Arquivos modificados:**
  - `src/lib/utils/formatters.ts` (adicionadas funções)
  - `src/lib/utils/styles.ts` (criado novo arquivo)
  - `src/hooks/useOcorrenciasDisponiveis.ts`
  - `src/app/(dashboard)/medico/page.tsx`
  - `src/components/ocorrencias/OcorrenciaDetalhesModal.tsx`
  - `src/components/ocorrencias/OcorrenciaCard.tsx`
  - `src/components/pacientes/PacientesTable.tsx`
  - `src/app/(dashboard)/enfermeiro/agenda/page.tsx`
  - `src/app/(dashboard)/medico/agenda/page.tsx`
  - `src/app/(dashboard)/enfermeiro/page.tsx`
  - `src/config/navigation.ts`
  - `src/middleware.ts`
  - `src/lib/services/ocorrencias.ts`
  - `next.config.ts`
  - `package.json` (adicionado @types/react-big-calendar)

- **Otimizações aplicadas:**
  1. ✅ **Removido refetchInterval**: Hook `useOcorrenciasDisponiveis` não faz mais polling automático a cada 30s
  2. ✅ **Funções utilitárias centralizadas**: Criado `formatters.ts` e `styles.ts` para evitar recriação de funções
  3. ✅ **Memoização adicionada**:
     - OcorrenciaCard agora usa React.memo
     - Handlers do dashboard médico usam useCallback
  4. ✅ **Imports otimizados**: Imports de bibliotecas organizados e otimizados
  5. ✅ **Next.js otimizado**:
     - Compiler config com removeConsole em produção
     - optimizePackageImports para bibliotecas grandes
     - minimumCacheTTL para imagens
  6. ✅ **TypeScript corrigido**: Todos os enums usados corretamente (TipoPerfil, StatusOcorrencia)
  7. ✅ **Types instalados**: @types/react-big-calendar

- **Impacto estimado:**
  - 🚀 **Redução de 95% no polling**: De 30s para invalidação manual (economia de ~120 requests/hora por usuário)
  - 💾 **Bundle otimizado**: optimizePackageImports reduz bundle inicial
  - ⚡ **Menos re-renders**: Memoização evita renderizações desnecessárias
  - 🎯 **Código limpo**: Funções centralizadas facilitam manutenção
  - 📦 **Build size**: First Load JS compartilhado = 102 kB

- **Problemas encontrados:**
  - Uso incorreto de strings literais ao invés de enums (corrigido)
  - Faltava @types/react-big-calendar (instalado)
  - Tipos do Supabase precisaram de cast para compatibilidade

---

## 🎓 Boas Práticas Gerais

1. **React Query**
   - Usar `staleTime` adequado ao tipo de dado
   - Evitar `refetchInterval` sem necessidade
   - Usar `select` para transformações
   - Invalidar queries após mutações

2. **Supabase**
   - Selecionar apenas campos necessários
   - Usar indexes apropriados
   - Considerar views para queries complexas
   - Implementar paginação server-side

3. **Next.js**
   - Usar Server Components quando possível
   - Implementar code-splitting
   - Otimizar imagens com next/image
   - Configurar caching apropriado

4. **TypeScript**
   - Tipar corretamente (evitar `any`)
   - Usar tipos reutilizáveis em `types/index.ts`
   - Evitar type assertions desnecessários

5. **Performance**
   - Memoizar componentes pesados
   - Lazy load componentes não críticos
   - Debounce inputs de busca
   - Virtualizar listas longas

---

## 🔄 Como Executar Esta Rotina

Quando solicitado "Execute as diretrizes de otimização", siga:

1. Ler este documento completamente
2. Identificar arquivos modificados desde última revisão
3. Aplicar as otimizações relevantes de cada categoria
4. Testar que nada quebrou
5. Documentar as mudanças na seção "Registro de Otimizações"
6. Fazer commit das alterações

---

**Versão:** 1.0
**Última atualização:** 2025-10-08
**Autor:** Sistema de Otimização Automatizada
