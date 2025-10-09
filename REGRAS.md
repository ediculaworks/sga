# Regras de Desenvolvimento - SGA

## 🔴 Regra Absoluta: CHANGELOG é a Fonte da Verdade

**ANTES de qualquer ação:**
1. Leia `CHANGELOG.md` para entender o estado atual

**DEPOIS de completar tarefa:**
2. Atualize `CHANGELOG.md` com:
   - Data/hora (DD/MM/YYYY HH:MM)
   - O que foi feito
   - Arquivos criados/modificados
   - Dependências instaladas
   - Problemas e soluções
   - Próximo passo

**⚠️ Sem CHANGELOG atualizado = Trabalho perdido**

---

## Workflow Obrigatório

```
1. Ler CHANGELOG.md
2. Ler PROJETO.md (se necessário)
3. Planejar
4. Implementar
5. Testar
6. Atualizar CHANGELOG.md
7. Commit
```

---

## 10 Regras de Ouro

1. **SEMPRE ler CHANGELOG.md** antes de começar
2. **SEMPRE atualizar CHANGELOG.md** ao terminar
3. **SEMPRE usar TypeScript** (nunca `any`)
4. **SEMPRE usar shadcn/ui** para componentes
5. **SEMPRE validar forms** com Zod
6. **SEMPRE usar React Query** para dados do servidor
7. **SEMPRE pensar mobile-first** (responsivo)
8. **SEMPRE usar Supabase RLS** (segurança)
9. **SEMPRE testar** cenários positivos E negativos
10. **SEMPRE commitar** com mensagem descritiva

---

## Checklist de Qualidade

Antes de considerar tarefa completa:

- [ ] TypeScript sem erros
- [ ] ESLint sem warnings
- [ ] Responsivo (mobile + desktop)
- [ ] Loading states visíveis
- [ ] Error handling implementado
- [ ] Forms validados (Zod)
- [ ] Testado manualmente
- [ ] **CHANGELOG.md atualizado**
- [ ] Comentários em código complexo
- [ ] Commit realizado

---

## Padrões de Código

### Componentes
```typescript
interface Props {
  title: string;
  onClick: () => void;
}

export function Component({ title, onClick }: Props) {
  // ...
}
```

### Forms
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  field: z.string().min(1, 'Obrigatório'),
});

type FormData = z.infer<typeof schema>;
```

### Queries Supabase
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useData() {
  return useQuery({
    queryKey: ['key'],
    queryFn: async () => {
      const { data, error } = await supabase.from('table').select();
      if (error) throw error;
      return data;
    },
  });
}
```

### Nomenclatura
- **Componentes:** PascalCase (`UserCard.tsx`)
- **Funções/Hooks:** camelCase (`useAuth.ts`)
- **Tipos:** PascalCase (`UserData`, `ApiResponse`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_ITEMS`)

---

## Mensagens de Commit

**Formato:**
```
tipo: descrição curta

Descrição detalhada (opcional)
```

**Tipos:**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

**Exemplo:**
```
feat: adiciona dashboard do médico

- Implementa estatísticas
- Cria lista de ocorrências
- Adiciona modal de detalhes
```

---

## Prioridades

### Sempre Priorizar
1. Funcionalidade sobre estética
2. Performance sobre features extras
3. Segurança sobre conveniência
4. Documentação sobre código rápido
5. Simplicidade sobre complexidade

### Evitar
- ❌ Over-engineering
- ❌ Premature optimization
- ❌ Código duplicado
- ❌ Dependências desnecessárias
- ❌ Comentários óbvios

---

## Quando Encontrar Problemas

1. **Documentar no CHANGELOG.md**
   - Problema encontrado
   - Solução aplicada
   - Por que aconteceu

2. **Perguntar ao usuário** se:
   - Decisão afeta arquitetura
   - Múltiplas soluções possíveis
   - Breaking change necessário
   - Credenciais/senhas necessárias

3. **Nunca assumir** estruturas não documentadas

---

## Lembre-se

**PROJETO.md** = COMO fazer (contexto)
**REGRAS.md** = REGRAS a seguir
**CHANGELOG.md** = O QUE foi feito (histórico)

**Nunca comece sem ler CHANGELOG.md**
**Nunca termine sem atualizar CHANGELOG.md**
