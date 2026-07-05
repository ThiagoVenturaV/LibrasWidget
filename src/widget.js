/**
 * widget.js
 *
 * Classe principal do LibrasWidget.
 * Orquestra o VLibras + translator + MutationObserver.
 */

import { translate } from './translator.js';
import {
  loadVLibras,
  openVLibrasPanel,
  closeVLibrasPanel,
  isPanelOpen,
} from './vlibras-loader.js';

export class Widget {
  /**
   * @param {Object} options
   * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} [options.position='bottom-right']
   * @param {string}  [options.color]             - Ignorado (mantido por compatibilidade)
   * @param {string}  [options.watchSelector=null] - Seletor CSS dos elementos a observar
   * @param {boolean} [options.autoTranslate=true] - Traduz automaticamente ao detectar elemento novo
   * @param {number}  [options.autoTranslateDelay=400] - Delay (ms) antes de traduzir elemento novo
   */
  constructor(options = {}) {
    this.options = {
      position: 'bottom-right',
      watchSelector: null,
      autoTranslate: true,
      autoTranslateDelay: 400,
      ...options,
    };

    this._ready = false;
    this._observer = null;

    this._build();
  }

  /* ── Setup ──────────────────────────────────────────────────── */

  async _build() {
    const mappedPosition = (this.options.position === 'left' || this.options.position?.includes('left')) ? 'L' : 'R';

    try {
      await loadVLibras({ position: mappedPosition });
      this._ready = true;

      // Inicia observer se configurado
      if (this.options.watchSelector) {
        this._startObserver();
      }
    } catch (err) {
      console.error('[LibrasWidget]', err);
    }
  }

  /* ── MutationObserver ───────────────────────────────────────── */

  _startObserver() {
    const { watchSelector, autoTranslate, autoTranslateDelay } = this.options;

    this._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          // Verifica se o nó adicionado é o alvo ou contém o alvo
          const targets = node.matches?.(watchSelector)
            ? [node]
            : [...(node.querySelectorAll?.(watchSelector) ?? [])];

          for (const target of targets) {
            if (target.dataset.lwObserved) continue;
            target.dataset.lwObserved = '1';

            if (autoTranslate) {
              setTimeout(() => {
                const text = target.innerText || target.textContent || '';
                if (text.trim()) this.translate(text.trim());
              }, autoTranslateDelay);
            }
          }
        }
      }
    });

    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /* ── API pública ────────────────────────────────────────────── */

  /**
   * Traduz um texto específico para LIBRAS.
   * Abre o painel automaticamente se estiver fechado.
   * @param {string} texto
   */
  translate(texto) {
    if (!this._ready) {
      console.warn('[LibrasWidget] Widget ainda não está pronto. Aguarde o carregamento.');
      return;
    }
    if (!texto?.trim()) return;

    translate(texto);
  }

  /**
   * Para o MutationObserver e remove o widget do DOM.
   */
  destroy() {
    this._observer?.disconnect();
    
    // Remove o container do VLibras
    const vwContainer = document.querySelector('[data-lw-managed]');
    if (vwContainer) {
      vwContainer.remove();
    }
    
    // Remove o script do VLibras
    const script = document.querySelector(`script[src*="vlibras-plugin.js"]`);
    if (script) {
      script.remove();
    }
    
    if (window.VLibras) {
      delete window.VLibras;
    }
  }
}
