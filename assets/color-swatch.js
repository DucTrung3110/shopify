/**
 * Color Swatch Handler
 * Xử lý logic chọn color variant và update giao diện
 * Supports: Color & Size swatches với keyboard navigation
 */

if (!customElements.get('color-swatch-handler')) {
  customElements.define('color-swatch-handler', class extends HTMLElement {
    constructor() {
      super();
      this.init();
    }

    init() {
      // Support both color and size swatches
      this.swatchInputs = this.querySelectorAll('input[type="radio"][name*="Color"], input[type="radio"][name*="Size"]');
      this.setupEventListeners();
      this.setupAccessibility();
    }

    setupEventListeners() {
      this.swatchInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          this.onSwatchChange(e);
        });

        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            this.focusNext(input);
          }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.focusPrev(input);
          }
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    }

    setupAccessibility() {
      const labels = this.querySelectorAll('label.color-swatch');
      labels.forEach((label, index) => {
        const input = label.previousElementSibling;
        if (input) {
          input.setAttribute('role', 'radio');
          input.setAttribute('tabindex', index === 0 ? '0' : '-1');
          input.setAttribute('aria-label', input.dataset.optionValue || 'Option');
        }
      });
    }

    onSwatchChange(event) {
      const input = event.target;
      const label = input.nextElementSibling;

      if (label && label.classList.contains('color-swatch')) {
        // Update tabindex
        this.swatchInputs.forEach(inp => inp.setAttribute('tabindex', '-1'));
        input.setAttribute('tabindex', '0');

        // Trigger variant selection
        const variantRadios = document.querySelector('variant-radios');
        if (variantRadios) {
          const allRadios = variantRadios.querySelectorAll('input[type="radio"]');
          allRadios.forEach(radio => {
            if (radio.value === input.value) {
              radio.checked = true;
              radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        }
      }
    }

    focusNext(currentInput) {
      const inputs = Array.from(this.swatchInputs);
      const currentIndex = inputs.indexOf(currentInput);
      const nextIndex = (currentIndex + 1) % inputs.length;
      inputs[nextIndex].focus();
      inputs[nextIndex].checked = true;
      inputs[nextIndex].dispatchEvent(new Event('change', { bubbles: true }));
    }

    focusPrev(currentInput) {
      const inputs = Array.from(this.swatchInputs);
      const currentIndex = inputs.indexOf(currentInput);
      const prevIndex = (currentIndex - 1 + inputs.length) % inputs.length;
      inputs[prevIndex].focus();
      inputs[prevIndex].checked = true;
      inputs[prevIndex].dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}
