/**
 * vlibras-loader.js
 *
 * Injeta o VLibras Widget no DOM e fornece funções utilitárias
 * para controlar o painel do VLibras programaticamente.
 */

const VLIBRAS_APP_URL = 'https://vlibras.gov.br/app';
const VLIBRAS_PLUGIN_SRC = `${VLIBRAS_APP_URL}/vlibras-plugin.js`;

let _loadPromise = null;

/**
 * Carrega o VLibras no DOM (idempotente — chame quantas vezes quiser).
 * @param {Object} [options]
 * @param {'R'|'L'} [options.position='R']
 * @returns {Promise<void>} Resolve quando o VLibras estiver pronto.
 */
export function loadVLibras(options = {}) {
  const { position = 'R' } = options;
  if (_loadPromise) return _loadPromise;

  _loadPromise = new Promise((resolve, reject) => {
    // Markup exigido pelo VLibras
    const vwContainer = document.createElement('div');
    vwContainer.setAttribute('vw', '');
    vwContainer.setAttribute('data-lw-managed', '');
    vwContainer.className = 'enabled';
    vwContainer.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    // Insere no início do body para não interferir no layout da página
    document.body.insertBefore(vwContainer, document.body.firstChild);

    const script = document.createElement('script');
    script.src = VLIBRAS_PLUGIN_SRC;
    script.async = true;

    script.onload = () => {
      try {
        new window.VLibras.Widget({
          rootPath: VLIBRAS_APP_URL,
          position: position
        });
        // VLibras faz setup assíncrono — aguarda antes de resolver
        setTimeout(resolve, 1800);
      } catch (err) {
        reject(new Error(`[LibrasWidget] Falha ao inicializar VLibras: ${err.message}`));
      }
    };

    script.onerror = () =>
      reject(new Error('[LibrasWidget] Falha ao carregar vlibras-plugin.js'));

    document.body.appendChild(script);
  });

  return _loadPromise;
}

/**
 * Abre ou fecha o painel do VLibras clicando no seu botão interno.
 */
export function toggleVLibrasPanel() {
  const btn = document.querySelector('[data-lw-managed] [vw-access-button]');
  if (btn) {
    btn.click();
  }
}

/** Abre o painel do VLibras (se estiver fechado). */
export function openVLibrasPanel() {
  if (!isPanelOpen()) toggleVLibrasPanel();
}

/** Fecha o painel do VLibras (se estiver aberto). */
export function closeVLibrasPanel() {
  if (isPanelOpen()) toggleVLibrasPanel();
}

/** Retorna se o painel está aberto. */
export function isPanelOpen() {
  const wrapper = document.querySelector('[vw-plugin-wrapper]');
  if (!wrapper) return false;
  
  const style = window.getComputedStyle(wrapper);
  return wrapper.classList.contains('active') || (style.display !== 'none' && style.visibility !== 'hidden');
}
