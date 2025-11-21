# Arquitetura de Segurança - Frontend & Backend

## 🔐 Princípios de Segurança Implementados

### Trust Nothing from Frontend
- ✅ Backend valida TODOS os parâmetros
- ✅ Frontend apenas coleta dados e exibe respostas
- ✅ Nenhuma validação de negócio no frontend

## 📁 Nova Estrutura Frontend

### `src/lib/api.ts`
- **Centralização de requisições** - Todos os endpoints em um lugar
- **Type-safe** - Interfaces TypeScript para cada resposta
- **Sem lógica de negócio** - Apenas fetch/retorna

```typescript
// Uso
import { itemsApi, rolesApi } from '@/lib/api';

const response = await itemsApi.getCategory('avatarItems');
if (response.error) {
  // Backend error - display to user
  showError(response.error);
}
```

### `src/hooks/useApi.ts`
- **Hook customizado** com React Query
- **Automatic retry** e caching
- **Error handling** consistente

```typescript
// Uso
const { data, isLoading, isError, error } = useApiData(
  ['items', category],
  () => itemsApi.getCategory(category),
  { staleTime: 1000 * 60 * 5 }
);
```

### `src/lib/errors.ts`
- **Parsing de erros** da API
- **User-friendly messages** com i18n
- **Retry com backoff exponencial**

## 🛡️ Fluxo de Segurança

```
1. Frontend faz requisição via api.ts
2. Backend (Express/Cloudflare) valida:
   - Parâmetros de entrada
   - Categorias (whitelist)
   - Valores válidos
3. Se inválido → Backend retorna erro 400/422
4. Se válido → Backend faz requisição interna
5. Frontend recebe resposta e exibe
```

## 📋 Backend - O que Valida

### Express (`main/routes/items.js`)
```javascript
if (!VALID_ITEM_CATEGORIES.includes(category)) {
  return res.status(400).json({ error: 'Categoria de item inválida.' });
}
```

### Cloudflare (`functions/api/[[path]].js`)
```javascript
if (!VALID_ITEM_CATEGORIES.includes(category)) {
  return jsonResponse({ error: 'Categoria de item inválida.' }, 400);
}
```

## 🔄 Sincronização Categoria Items

### Backend
- `utils/constants.js` define `VALID_ITEM_CATEGORIES`
- Endpoint `/api/validation/item-categories` retorna a lista

### Frontend
- `ItemsContext.tsx` busca categorias via `validationApi.getItemCategories()`
- Usa as categorias retornadas pelo backend
- Sem hardcoding de valores

## 📊 Mudanças Implementadas

### ❌ Removidas do Frontend
- `validCategories` array hardcoded
- `localesList` array hardcoded  
- Validação manual de entrada
- Construção manual de URLs

### ✅ Adicionadas no Frontend
- `src/lib/api.ts` - Cliente HTTP centralizado
- `src/hooks/useApi.ts` - Hook customizado com React Query
- `src/lib/errors.ts` - Utilitários de erro
- `src/.env.example` - Exemplo de variáveis de ambiente

### ✅ Adicionadas no Backend (Express)
- `main/routes/validation.js` - Endpoint de validação
- `main/routes/index.js` - Rota registrada

## 🔗 Variáveis de Ambiente

### Frontend `.env`
```
# Desenvolvimento (local backend)
VITE_API_BASE_URL=http://localhost:3000/api

# Produção (Cloudflare)
VITE_API_BASE_URL=https://api.wolvesville.com/api
```

## 🧪 Exemplo de Uso

### Buscar Items
```typescript
// Antes (inseguro - validação no frontend)
const categories = validCategories; // hardcoded
for (const cat of categories) {
  fetch(`/api/items/${cat}`);
}

// Depois (seguro - validação no backend)
const response = await validationApi.getItemCategories();
if (!response.error && response.data) {
  for (const cat of response.data) {
    fetch(`/api/items/${cat}`);
  }
}
```

### Tratamento de Erros
```typescript
import { parseApiError, getErrorMessage } from '@/lib/errors';

try {
  const response = await itemsApi.getCategory('invalid');
  if (response.error) {
    // Backend retornou erro
    const message = getErrorMessage(new Error(response.error), t);
    showToast(message);
  }
} catch (error) {
  // Network error ou outro
  const message = getErrorMessage(error, t);
  showToast(message);
}
```

## ✅ Checklist de Segurança

- [x] Backend valida todos os parâmetros
- [x] Frontend não faz validação de negócio
- [x] API centralizada em um arquivo
- [x] Tipos TypeScript para todas as respostas
- [x] Tratamento de erros consistente
- [x] Sincronização de categorias via API
- [x] Sem hardcoding de valores
- [x] Suporte a múltiplos ambientes (dev/prod)
- [x] Documentação clara

## 🚀 Próximas Etapas (Opcional)

1. **Rate limiting** no backend
2. **Request signing** com timestamp
3. **CORS configuration** mais restritiva
4. **Logging de requisições** para auditoria
5. **Circuit breaker** para APIs externas
