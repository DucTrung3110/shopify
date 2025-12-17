/**
 * Color Swatch Setup Checker
 * Kiểm tra xem color swatch setup có đúng không
 */

(function() {
  'use strict';

  const SwatchChecker = {
    checks: [],
    
    run() {
      console.log('%c🎨 COLOR SWATCH SETUP CHECKER', 'font-size: 16px; font-weight: bold; color: #6366f1;');
      console.log('%c' + '='.repeat(50), 'color: #e0e7ff');
      
      this.checkMetafieldSupport();
      this.checkVariantRadios();
      this.checkSwatchElements();
      this.checkCSSLoaded();
      this.checkJSLoaded();
      this.checkThemeSettings();
      
      this.printSummary();
    },

    checkMetafieldSupport() {
      console.log('\n📋 METAFIELD CHECK:');
      
      // Kiểm tra xem variant có metafield không
      const variant = document.querySelector('variant-radios, variant-selects');
      if (!variant) {
        this.log('⚠️  Không tìm thấy variant-radios hoặc variant-selects element', 'warn');
        return;
      }
      
      const script = variant.querySelector('script[type="application/json"]');
      if (!script) {
        this.log('⚠️  Không tìm thấy variant JSON data', 'warn');
        return;
      }
      
      try {
        const variants = JSON.parse(script.textContent);
        if (variants && variants.length > 0) {
          const firstVariant = variants[0];
          if (firstVariant.metafields) {
            this.log('✅ Variant có metafields', 'pass');
            console.log('   Metafields:', firstVariant.metafields);
          } else {
            this.log('⚠️  Variant không có metafields', 'warn');
          }
        }
      } catch (e) {
        this.log('❌ Lỗi parse variant JSON: ' + e.message, 'error');
      }
    },

    checkVariantRadios() {
      console.log('\n🎛️  VARIANT RADIOS CHECK:');
      
      const variantRadios = document.querySelector('variant-radios');
      if (variantRadios) {
        this.log('✅ variant-radios element tìm thấy', 'pass');
        
        const radios = variantRadios.querySelectorAll('input[type="radio"]');
        this.log(`   Tổng ${radios.length} radio inputs`, 'info');
        
        const checkedRadio = variantRadios.querySelector('input[type="radio"]:checked');
        if (checkedRadio) {
          this.log('✅ Có 1 radio được select', 'pass');
          this.log(`   Value: ${checkedRadio.value}`, 'info');
        }
      } else {
        this.log('⚠️  Không tìm thấy variant-radios', 'warn');
      }
    },

    checkSwatchElements() {
      console.log('\n🎨 SWATCH ELEMENTS CHECK:');
      
      const swatches = document.querySelectorAll('label.color-swatch');
      if (swatches.length > 0) {
        this.log(`✅ Tìm thấy ${swatches.length} color swatches`, 'pass');
        
        swatches.forEach((swatch, idx) => {
          const bgColor = window.getComputedStyle(swatch).backgroundColor;
          const size = window.getComputedStyle(swatch).width;
          const selected = swatch.previousElementSibling?.checked;
          
          console.log(`   [${idx}] Color: ${bgColor}, Size: ${size}, Selected: ${selected}`);
        });
      } else {
        this.log('❌ Không tìm thấy color swatches', 'error');
      }
    },

    checkCSSLoaded() {
      console.log('\n📄 CSS CHECK:');
      
      const stylesheets = Array.from(document.styleSheets);
      const productCSS = stylesheets.find(sheet => 
        sheet.href && (sheet.href.includes('section-main-product.css') || sheet.href.includes('component-card.css'))
      );
      
      if (productCSS) {
        this.log('✅ Product CSS loaded', 'pass');
      } else {
        this.log('⚠️  Product CSS có thể chưa load hoặc CORS issue', 'warn');
      }
      
      // Check CSS variables
      const root = document.documentElement;
      const swatchSize = getComputedStyle(root).getPropertyValue('--swatch-size');
      if (swatchSize) {
        this.log(`✅ CSS variable --swatch-size: ${swatchSize}`, 'pass');
      } else {
        this.log('⚠️  CSS variable --swatch-size chưa set', 'warn');
      }
    },

    checkJSLoaded() {
      console.log('\n⚙️  JAVASCRIPT CHECK:');
      
      if (customElements.get('color-swatch-handler')) {
        this.log('✅ color-swatch-handler custom element registered', 'pass');
      } else {
        this.log('⚠️  color-swatch-handler custom element chưa register', 'warn');
      }
      
      if (customElements.get('variant-radios')) {
        this.log('✅ variant-radios custom element registered', 'pass');
      }
    },

    checkThemeSettings() {
      console.log('\n⚙️  THEME SETTINGS CHECK:');
      
      // Check nếu theme settings object có sẵn
      if (typeof window.themeSettings !== 'undefined') {
        this.log('✅ Theme settings object found', 'pass');
      } else {
        this.log('ℹ️  Theme settings object không accessible từ window', 'info');
      }
    },

    printSummary() {
      console.log('\n%c' + '='.repeat(50), 'color: #e0e7ff');
      console.log('%c✅ SETUP CHECKER HOÀN THÀNH', 'font-size: 14px; font-weight: bold; color: #22c55e;');
      console.log('Nếu có ❌ hoặc ⚠️, vui lòng kiểm tra troubleshooting guide.');
    },

    log(message, type = 'info') {
      const styles = {
        pass: 'color: #22c55e; font-weight: bold;',
        error: 'color: #ef4444; font-weight: bold;',
        warn: 'color: #f59e0b; font-weight: bold;',
        info: 'color: #3b82f6;'
      };
      
      console.log(`%c${message}`, styles[type] || styles.info);
      this.checks.push({ message, type });
    }
  };

  // Auto-run khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SwatchChecker.run());
  } else {
    SwatchChecker.run();
  }

  // Export để có thể call manually
  window.SwatchChecker = SwatchChecker;
})();
