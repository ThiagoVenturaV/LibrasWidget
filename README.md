# 🤟 LibrasWidget

Widget overlay de acessibilidade em **LIBRAS** para qualquer site — sem dependências, sem backend, sem custo. Powered by [VLibras](https://vlibras.gov.br).

---

## O que é

LibrasWidget é um script JavaScript que integra o widget oficial do VLibras em qualquer página web e adiciona facilidades como uma API de tradução programática e um observador de mutações (MutationObserver) para traduzir novos elementos no DOM automaticamente.

O LibrasWidget oferece:

- **Botão oficial do VLibras** — com o ícone padrão e animação nativa
- **API programática** — chame `widget.translate("texto")` a qualquer momento
- **MutationObserver** — detecta novos elementos no DOM e traduz automaticamente (ideal para chats e SPAs)
- **Zero dependências** — bundle único e self-contained (~4KB gzip)

---

## Instalação e Uso

Você pode utilizar o **LibrasWidget** de duas formas principais: instalando como uma dependência NPM diretamente do GitHub (recomendado para projetos modernos) ou copiando o arquivo compilado manualmente (para sites HTML simples).

---

### Opção 1: Via NPM (Recomendado para projetos com React, Vue, Vite, etc.)

Esta é a forma mais limpa e eficiente de integrar o widget, pois ele é gerenciado pelo gerenciador de pacotes do seu projeto.

1. **Instale o pacote diretamente do GitHub**:
   ```bash
   npm install github:ThiagoVenturaV/LibrasWidget
   ```

2. **Importe e inicialize no seu código**:
   ```js
   import LibrasWidget from 'libras-widget';

   new LibrasWidget({
     position: 'bottom-right' // 'bottom-right' ou 'bottom-left'
   });
   ```

---

### Opção 2: Uso manual (Para sites HTML simples/estáticos)

Se o seu projeto não utiliza gerenciadores de pacote, você pode buildar o widget e copiar o script compilado:

1. **Clone o repositório e compile o widget**:
   ```bash
   # Clone o repositório
   git clone https://github.com/ThiagoVenturaV/LibrasWidget.git
   cd LibrasWidget

   # Instale as dependências e compile o build de produção
   npm install
   npm run build
   ```
   Isso gerará os arquivos prontos para uso na pasta `dist/` (como o `libras-widget.umd.cjs`).

2. **Copie o arquivo para o seu projeto**:
   Copie o arquivo `libras-widget.umd.cjs` para a pasta do seu site.

3. **Adicione a tag no seu HTML (`index.html`)**:
   Importe e inicialize o widget antes de fechar a tag `</body>`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu Novo Site</title>
</head>
<body>

  <h1>Olá, Mundo!</h1>
  <p>Esse texto poderá ser traduzido pelo VLibras.</p>

  <!-- 1. Importa o script do widget -->
  <script src="./libras-widget.umd.cjs"></script>
  
  <!-- 2. Inicializa o widget -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      new LibrasWidget({
        position: 'bottom-right' // 'bottom-right' ou 'bottom-left'
      });
    });
  </script>
</body>
</html>
```

4. **Abra o site**:
   Abra o `index.html` no seu navegador para ver o ícone oficial do VLibras funcionando.

---

## Opções de configuração

```js
new LibrasWidget({
  position:           'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  watchSelector:      null,           // seletor CSS para auto-tradução de novos elementos
  autoTranslate:      true,           // traduz automaticamente quando watchSelector detecta elemento novo
  autoTranslateDelay: 400,            // delay (ms) antes de traduzir o elemento detectado
});
```

---

## API

### `widget.translate(texto)`

Traduz um texto específico para LIBRAS. O painel deve ser ativado pelo usuário clicando no ícone do VLibras.

```js
const widget = new LibrasWidget();

widget.translate('Ola! Esta mensagem sera traduzida para LIBRAS.');
```

### `widget.destroy()`

Remove o widget do DOM e para todos os observers.

```js
widget.destroy();
```

---

## Exemplos de uso

### Chat com auto-tradução (MutationObserver)

Toda vez que um elemento `.bot-message` for adicionado ao DOM, o widget detecta e traduz automaticamente:

```js
new LibrasWidget({
  watchSelector: '.bot-message',
  autoTranslate: true,
});
```

### Integração com SSE (streaming de respostas)

Ideal para chats com IA que streamam tokens — traduz ao receber o evento de conclusão:

```js
const widget = new LibrasWidget();

// Chama ao fechar o stream SSE
eventSource.addEventListener('done', () => {
  widget.translate(textoCompletoResposta);
});
```

### Integração com React

```jsx
import { useEffect, useRef } from 'react';

export function useLIBRAS() {
  const widgetRef = useRef(null);

  useEffect(() => {
    widgetRef.current = new window.LibrasWidget();
    return () => widgetRef.current?.destroy();
  }, []);

  return widgetRef;
}

// No componente de chat:
const libras = useLIBRAS();

function handleStreamDone(text) {
  libras.current?.translate(text);
}
```

---

## Desenvolvimento local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de dev com demo interativa
npm run dev
# http://localhost:5173

# Gerar bundle de producao
npm run build
# dist/libras-widget.umd.cjs   (para <script src>)
# dist/libras-widget.js        (ES module)
```

---

## Estrutura do projeto

```
libras-widget/
├── index.html              # Demo interativa (entry do dev server)
├── src/
│   ├── index.js            # Entry point — expoe LibrasWidget global
│   ├── widget.js           # Classe principal: inicialização, MutationObserver
│   ├── vlibras-loader.js   # Injeção do VLibras no DOM e controle do painel
│   └── translator.js       # Simulação de seleção de texto para acionar VLibras
├── dist/                   # Gerado por npm run build
├── package.json
└── vite.config.js          # Build em modo library (UMD + ES)
```

---

## Como funciona internamente

O VLibras nao expoe uma API publica de controle via `postMessage`. O widget usa um workaround conhecido: ao chamar `translate(texto)`, um elemento invisivel com o texto e criado no DOM e selecionado via `Range API`. O VLibras escuta o evento nativo `selectionchange` do browser e traduz o texto selecionado.

```
widget.translate("texto")
    cria <span> invisivel com o texto
    window.getSelection().addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
    VLibras detecta e aciona traducao
    <span> e removido do DOM apos ~1.2s
```

> [!WARNING]
> Este workaround depende do comportamento interno do VLibras. E uma abordagem nao documentada oficialmente, mas estavel e amplamente utilizada pela comunidade. Caso o VLibras atualize seu mecanismo de deteccao, o arquivo `src/translator.js` e o unico ponto que precisaria ser ajustado.

---

## Requisitos

- O site host deve estar em **HTTPS** em producao (exigencia do iframe do VLibras)
- Em `localhost` funciona normalmente (HTTP)
- Sem outras dependencias — o VLibras e carregado via CDN do governo (`vlibras.gov.br`)

---

## Licenca

MIT — livre para uso em projetos comerciais e academicos.
