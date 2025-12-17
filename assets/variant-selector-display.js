/**
 * Variant Selector Display
 * Tracks selected color/size values and displays them dynamically
 * Features: Real-time value display, keyboard navigation support, mobile friendly
 */

class VariantSelectorDisplay {
  constructor() {
    // Keep track of displays we've already wired to avoid duplicate listeners
    this._wired = new WeakSet();
    this.init();
  }

  init() {
    this.attachToExistingDisplays();
    this.observeForDynamicChanges();
  }

  attachToExistingDisplays() {
    // Find every visible selected-value-display on the page
    const displays = Array.from(document.querySelectorAll('.selected-value-display'));

    displays.forEach(display => this._wireDisplay(display));
  }

  _wireDisplay(display) {
    if (!display || this._wired.has(display)) return;

    // Try to find the controls group that belongs to this display
    let fieldset = display.closest('fieldset');
    let controlsGroup = null;

    if (fieldset) {
      controlsGroup = fieldset.querySelector('.product-form__controls-group') || fieldset.querySelector('.product-form__controls');
    }

    // Fallback: look for a sibling controls group
    if (!controlsGroup) {
      controlsGroup = display.parentElement && display.parentElement.querySelector('.product-form__controls-group');
    }

    if (!controlsGroup) return;

    const inputs = Array.from(controlsGroup.querySelectorAll('input[type="radio"]'));
    if (inputs.length === 0) return;

    // Attach listeners
    inputs.forEach((input, index) => {
      const changeHandler = () => this.updateDisplay(display, input);
      input.addEventListener('change', changeHandler);

      const keyHandler = (e) => this.handleKeyboardNavigation(e, inputs, index);
      input.addEventListener('keydown', keyHandler);
    });

    // Set initial value: checked input or first input
    const checked = controlsGroup.querySelector('input[type="radio"]:checked') || inputs[0];
    if (checked) this.updateDisplay(display, checked);

    this._wired.add(display);
  }

  updateDisplay(display, selectedInput) {
    if (!display || !selectedInput) return;

    const valueText = selectedInput.dataset.optionValue || selectedInput.value || '';
    const valueSpan = display.querySelector('.value-text');
    if (valueSpan) valueSpan.textContent = valueText;
  }

  handleKeyboardNavigation(e, inputs, currentIndex) {
    let targetIndex = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        targetIndex = (currentIndex + 1) % inputs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        targetIndex = (currentIndex - 1 + inputs.length) % inputs.length;
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        inputs[currentIndex].checked = true;
        inputs[currentIndex].dispatchEvent(new Event('change', { bubbles: true }));
        return;
      default:
        return;
    }

    if (targetIndex !== null && inputs[targetIndex]) {
      inputs[targetIndex].focus();
      inputs[targetIndex].checked = true;
      inputs[targetIndex].dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  observeForDynamicChanges() {
    // Observe additions to the DOM to handle AJAX-loaded product sections
    if (!window.MutationObserver) return;

    const observer = new MutationObserver(mutations => {
      let found = false;
      for (const mut of mutations) {
        if (mut.addedNodes && mut.addedNodes.length) {
          mut.addedNodes.forEach(node => {
            if (!(node instanceof HTMLElement)) return;
            if (node.matches && node.matches('.selected-value-display')) {
              this._wireDisplay(node);
              found = true;
            } else if (node.querySelector && node.querySelector('.selected-value-display')) {
              Array.from(node.querySelectorAll('.selected-value-display')).forEach(d => this._wireDisplay(d));
              found = true;
            }
          });
        }
      }

      // If an AJAX variant loader replaced the whole product area, re-scan to be safe
      if (found === false && document.querySelectorAll('.selected-value-display').length > 0) {
        this.attachToExistingDisplays();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this._observer = observer;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VariantSelectorDisplay();
  });
} else {
  new VariantSelectorDisplay();
}

// Also handle dynamic content (AJAX loaded)
document.addEventListener('variant:loaded', () => {
  new VariantSelectorDisplay();
});

// Export for use in other contexts
window.VariantSelectorDisplay = VariantSelectorDisplay;
