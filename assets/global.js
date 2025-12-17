const sliderInit = (isUpdate) => {
	if (
		document.querySelectorAll(".js-media-list") &&
		document.querySelectorAll(".js-media-list").length > 0
	) {
		document.querySelectorAll(".js-media-list").forEach((elem) => {
			// persist original slide HTML for main media list
			if (!elem._originalSlideHtml) {
				elem._originalSlideHtml = Array.from(elem.querySelectorAll('.swiper-slide')).map(s => s.outerHTML);
			}
			const mediaListId = elem.dataset?.jsMediaListId;
			const mediaSublist = Array.from(document.querySelectorAll(".js-media-sublist")).find((subElem) => subElem.dataset?.jsMediaListId === mediaListId && subElem.swiper);
			let slider = new Swiper(elem, {
				slidesPerView: 1,
				spaceBetween: 1,
				autoHeight: true,
				speed: 800,
				mousewheel: {
					forceToAxis: true,
				},
				navigation: {
					nextEl: ".product .product__slider-nav .swiper-button-next",
					prevEl: ".product .product__slider-nav .swiper-button-prev",
				},
				pagination: {
					el: ".product .product__pagination",
					type: "bullets",
					clickable: true,
				},
				thumbs: {
					swiper: mediaListId && mediaSublist ? mediaSublist.swiper : "",
				},
				on: {
					slideChangeTransitionStart: function () {
						if (mediaListId && mediaSublist) {
							mediaSublist.swiper.slideTo(this.activeIndex);
						}
					},
					slideChange: function () {
						window.pauseAllMedia();
						this.params.noSwiping = false;

						// Update custom pagination number
						updateCustomPagination(this);

						// Sync popup slider by data attribute instead of index to avoid misalignment after filtering
						if (document.querySelector(".js-popup-slider") && document.querySelector(".js-popup-slider").swiper) {
							const activeSlide = this.slides[this.activeIndex];
							const dataMediaId = activeSlide?.querySelector('[data-media-id]')?.getAttribute('data-media-id');
							if (dataMediaId) {
								const popupSlides = document.querySelector(".js-popup-slider").swiper.slides;
								const popupIndex = Array.from(popupSlides).findIndex(s => s.getAttribute('data-media-modal-id') === dataMediaId);
								if (popupIndex >= 0) {
									document.querySelector(".js-popup-slider").swiper.slideTo(popupIndex);
								}
							}
						}
					},
					slideChangeTransitionEnd: function () {
						if (this.slides[this.activeIndex].querySelector("model-viewer")) {
							this.slides[this.activeIndex]
								.querySelector(".shopify-model-viewer-ui__button--poster")
								.removeAttribute("hidden");
						}
					},
					touchStart: function () {
						if (this.slides[this.activeIndex].querySelector("model-viewer")) {
							if (
								!this.slides[this.activeIndex]
									.querySelector("model-viewer")
									.classList.contains("shopify-model-viewer-ui__disabled")
							) {
								this.params.noSwiping = true;
								this.params.noSwipingClass = "swiper-slide";
							} else {
								this.params.noSwiping = false;
							}
						}
					},
				},
			});

			if (isUpdate) {
				setTimeout(function () {
					slider.update();
				}, 800);
			}
		});
	}
};

const subSliderInit = (isUpdate) => {
	if (
		document.querySelectorAll(".js-media-sublist") &&
		document.querySelectorAll(".js-media-sublist").length > 0
	) {
		document.querySelectorAll(".js-media-sublist").forEach((elem) => {
			let subSlider = new Swiper(elem, {
				slidesPerView: 4,
				spaceBetween: 8,
				direction: "horizontal",
				freeMode: false,
				watchSlidesProgress: true,
				//autoHeight: true,
				on: {
					touchEnd: function (s, e) {
						let range = 5;
						let diff = (s.touches.diff = s.isHorizontal()
							? s.touches.currentX - s.touches.startX
							: s.touches.currentY - s.touches.startY);
						if (diff < range || diff > -range) s.allowClick = true;
					},
				},
				breakpoints: {
					990: {
						spaceBetween: 16,
						direction: "vertical",
						slidesPerView: 4,
					},
				},
			});

			// persist original slide HTML for sublist (thumbnails)
			if (!elem._originalSlideHtml) {
				elem._originalSlideHtml = Array.from(elem.querySelectorAll('.swiper-slide')).map(s => s.outerHTML);
			}

			if (isUpdate) {
				setTimeout(function () {
					subSlider.update();
				}, 800);
			}
		});
	}
};

// Helper function to update custom pagination number
const updateCustomPagination = (swiperInstance) => {
	// Determine which counter we're updating (main product or popup modal)
	const isPopupModal = swiperInstance.el?.classList.contains('js-popup-slider');
	
	if (isPopupModal) {
		// For popup slider in modal
		const modal = document.querySelector('product-modal');
		if (modal) {
			const paginationCurrent = modal.querySelector('.pagination-current');
			const paginationTotal = modal.querySelector('.pagination-total');
			if (paginationCurrent) {
				paginationCurrent.textContent = swiperInstance.activeIndex + 1;
			}
			if (paginationTotal) {
				paginationTotal.textContent = swiperInstance.slides.length;
			}
		}
	} else {
		// For main product slider
		const paginationCurrent = document.querySelector('.pagination-current');
		const paginationTotal = document.querySelector('.pagination-total');
		if (paginationCurrent) {
			paginationCurrent.textContent = swiperInstance.activeIndex + 1;
		}
		// Update total to match current slider's total slides (filtered by variant)
		if (paginationTotal) {
			paginationTotal.textContent = swiperInstance.slides.length;
		}
	}
};

// Initialize pagination arrow buttons
const initPaginationArrows = () => {
	const paginationPrev = document.querySelector('.pagination-prev');
	const paginationNext = document.querySelector('.pagination-next');

	// Prefer the media list inside the same product section as the pagination
	// This ensures multiple product sections on a page don't get cross-wired
	let mediaList = null;
	if (paginationPrev) {
		// Find the nearest section wrapper (MainProduct-<id>) which has data-section
		const productSection = paginationPrev.closest('section[data-section]');
		if (productSection) {
			mediaList = productSection.querySelector('.js-media-list');
		}
	}
	// Fallback to product__main or global selectors if none found in the section
	if (!mediaList && paginationPrev) {
		const productMain = paginationPrev.closest('.product__main') || paginationPrev.closest('[data-product-main]');
		mediaList = productMain ? productMain.querySelector('.js-media-list') : null;
	}
	// Fallback to the first global media list if still none found
	if (!mediaList) mediaList = document.querySelector('.js-media-list');

	if (!paginationPrev || !paginationNext || !mediaList) {
		// If not ready yet, wait and retry
		setTimeout(initPaginationArrows, 100);
		return;
	}

	// Wait for Swiper to initialize
	const checkSwiper = setInterval(() => {
		const mainSlider = mediaList?.swiper;
		if (!mainSlider) return;
		
		clearInterval(checkSwiper);

		// Debug info: confirm we found the correct media list and swiper instance
		console.debug && console.debug('initPaginationArrows: found mediaList, mainSlider:', mediaList, mainSlider);

		const updateArrowStates = () => {
			if (paginationPrev) {
				// Directly check if at beginning (activeIndex = 0)
				if (mainSlider.activeIndex === 0) {
					paginationPrev.disabled = true;
				} else {
					paginationPrev.disabled = false;
				}
			}
			if (paginationNext) {
				// Directly check if at end: activeIndex >= total slides - 1
				const isAtEnd = mainSlider.activeIndex >= (mainSlider.slides.length - 1);
				if (isAtEnd) {
					paginationNext.disabled = true;
				} else {
					paginationNext.disabled = false;
				}
			}
		};

		// Add click handlers - ensure they trigger slide change
		paginationPrev.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			console.debug && console.debug('paginationPrev clicked', { mainSliderExists: !!mainSlider, disabled: paginationPrev.disabled, isBeginning: mainSlider?.isBeginning, activeIndex: mainSlider?.activeIndex });
			if (mainSlider && !paginationPrev.disabled) {
				// compute target index safely
				const target = Math.max(0, (mainSlider.activeIndex || 0) - 1);
				if (target === mainSlider.activeIndex) {
					updateArrowStates();
					return;
				}
				try {
					mainSlider.slideTo(target, 300);
				} catch (err) {
					console.warn && console.warn('paginationPrev: slideTo failed', err);
				}

				// If a popup slider exists (zoom modal), sync it to the matching media id so visible modal updates
				try {
					const popupElem = document.querySelector('.js-popup-slider');
					if (popupElem && popupElem.swiper) {
						const targetSlide = mainSlider.slides && mainSlider.slides[target];
						const dataMediaId = targetSlide && (targetSlide.querySelector('[data-media-id]')?.getAttribute('data-media-id') || targetSlide.getAttribute('data-media-id'));
						if (dataMediaId) {
							const popupSlides = popupElem.swiper.slides || [];
							const popupIndex = Array.from(popupSlides).findIndex(s => s.getAttribute('data-media-modal-id') === dataMediaId || s.querySelector('[data-media-id]')?.getAttribute('data-media-id') === dataMediaId);
							if (popupIndex >= 0) popupElem.swiper.slideTo(popupIndex, 300);
						}
					}
				} catch (err) {
					console.warn && console.warn('paginationPrev: popup sync failed', err);
				}

				// slideChange event will handle pagination update automatically
				// Avoid fallback that can cause jumping or resetting
			}
		});

		paginationNext.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			console.debug && console.debug('paginationNext clicked', { mainSliderExists: !!mainSlider, disabled: paginationNext.disabled, isEnd: mainSlider?.isEnd, activeIndex: mainSlider?.activeIndex });
			if (mainSlider && !paginationNext.disabled) {
				const maxIndex = (mainSlider.slides && mainSlider.slides.length - 1) || 0;
				const target = Math.min(maxIndex, (mainSlider.activeIndex || 0) + 1);
				if (target === mainSlider.activeIndex) {
					updateArrowStates();
					return;
				}
				try {
					mainSlider.slideTo(target, 300);
				} catch (err) {
					console.warn && console.warn('paginationNext: slideTo failed', err);
				}

				// Sync popup slider when visible
				try {
					const popupElem = document.querySelector('.js-popup-slider');
					if (popupElem && popupElem.swiper) {
						const targetSlide = mainSlider.slides && mainSlider.slides[target];
						const dataMediaId = targetSlide && (targetSlide.querySelector('[data-media-id]')?.getAttribute('data-media-id') || targetSlide.getAttribute('data-media-id'));
						if (dataMediaId) {
							const popupSlides = popupElem.swiper.slides || [];
							const popupIndex = Array.from(popupSlides).findIndex(s => s.getAttribute('data-media-modal-id') === dataMediaId || s.querySelector('[data-media-id]')?.getAttribute('data-media-id') === dataMediaId);
							if (popupIndex >= 0) popupElem.swiper.slideTo(popupIndex, 300);
						}
					}
				} catch (err) {
					console.warn && console.warn('paginationNext: popup sync failed', err);
				}

				// slideChange event will handle pagination update automatically
				// Avoid fallback that can cause jumping or resetting
			}
		});

		// Update arrow states on slide change
		mainSlider.on('slideChange', updateArrowStates);
		mainSlider.on('afterInit', updateArrowStates);
		
		// Initial state
		updateArrowStates();
	}, 50);
};

// Call on page load
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initPaginationArrows);
} else {
	initPaginationArrows();
};

const popupSliderInit = (isUpdate) => {
	if (document.querySelector(".js-popup-slider")) {
		let popupSlider = new Swiper(document.querySelector(".js-popup-slider"), {
			slidesPerView: 1,
			speed: 400,
			effect: 'slide',
			navigation: {
				nextEl: ".product-media-modal .product__slider-nav .swiper-button-next",
				prevEl: ".product-media-modal .product__slider-nav .swiper-button-prev",
			},
			pagination: {
				el: ".product-media-modal .product__pagination",
				type: "bullets",
				clickable: true,
			},
			on: {
				afterInit: function () {
					if (document.querySelector(".product__outer--static-column-aside")) {
						document
							.querySelectorAll(".product__media-list .product__media-toggle")
							.forEach((elem, index) => {
								elem.addEventListener("click", (e) => {
									if (document.querySelector(".js-popup-slider") && document.querySelector(".js-popup-slider").swiper) {
										document.querySelector(".js-popup-slider").swiper.slideTo(index);
									}
								});
							});
					}
					// Update custom pagination
					updateCustomPagination(this);
				},
				slideChange: function () {
					window.pauseAllMedia();
					this.params.noSwiping = false;
					document.querySelector(".product-media-modal__content")?.classList.remove("zoom");
					// Update custom pagination
					updateCustomPagination(this);
				},
				touchMove: function () {
					document.querySelector(".product-media-modal__content")?.classList.remove("zoom");
				},
				slideChangeTransitionEnd: function () {
					if (this.slides[this.activeIndex].querySelector("model-viewer")) {
						this.slides[this.activeIndex]
							.querySelector(".shopify-model-viewer-ui__button--poster")
							.removeAttribute("hidden");
					}
				},
				touchStart: function () {
					if (this.slides[this.activeIndex].querySelector("model-viewer")) {
						if (
							!this.slides[this.activeIndex]
								.querySelector("model-viewer")
								.classList.contains("shopify-model-viewer-ui__disabled")
						) {
							this.params.noSwiping = true;
							this.params.noSwipingClass = "swiper-slide";
						} else {
							this.params.noSwiping = false;
						}
					}
				},
			},
		});

		if (isUpdate) {
			setTimeout(function () {
				popupSlider.update();
			}, 800);
		}
	}
};

/**
 * Filter the product media slider to only include slides associated with the selected variant.
 * If no slides are matched, the function leaves the original set.
 */
function filterMediaSlidesByVariant(sectionId, variant) {
	if (!variant) return;
	const productMain = document.querySelector(`[data-product-main="${sectionId}"]`);
	if (!productMain) return;
	const mediaList = productMain.querySelector('.product__media-list');
	if (!mediaList || !mediaList.swiper) return;

	const elem = mediaList;
	
	// Store original slide HTML if not already stored
	if (!elem._originalSlideHtml) {
		elem._originalSlideHtml = Array.from(elem.querySelectorAll('.swiper-slide')).map(s => s.outerHTML);
		elem._originalSlideCount = elem._originalSlideHtml.length;
	}
	const original = elem._originalSlideHtml;
	
	const mediaSublist = (function() {
		const id = elem.dataset?.jsMediaListId;
		if (!id) return null;
		return Array.from(document.querySelectorAll('.js-media-sublist')).find(sub => sub.dataset?.jsMediaListId === id && sub.swiper);
	})();

	// Store original sublist slides if not already stored
	if (mediaSublist && !mediaSublist._originalSlideHtml) {
		mediaSublist._originalSlideHtml = Array.from(mediaSublist.querySelectorAll('.swiper-slide')).map(s => s.outerHTML);
	}

	// Try to read strict variant->images mapping from VariantImages-<productId> script
	let strictList = null;
	try {
		const productMediaScript = document.getElementById('ProductMedia');
		const productId = productMediaScript?.dataset?.productId || null;
		if (productId) {
			const variantImagesScript = document.getElementById(`VariantImages-${productId}`);
			if (variantImagesScript) {
				const mapping = JSON.parse(variantImagesScript.textContent || '{}');
				const arr = mapping[String(variant.id)];
				if (arr && Array.isArray(arr) && arr.length) {
					strictList = arr.slice();
				} else if (arr && typeof arr === 'string') {
					// If it's a JSON string, parse it
					try {
						const parsed = JSON.parse(arr);
						if (Array.isArray(parsed) && parsed.length) {
							strictList = parsed;
						}
					} catch (e) {
						// Not a valid JSON string, skip
					}
				}
			}
		}
	} catch (e) {
		// ignore JSON errors and fall back to computed associations
	}

	const swiper = elem.swiper;

		if (strictList) {
			// Normalize strictList entries: they may be media ids (numbers) or image src strings
			const allowedMediaIds = new Map(); // Use Map to preserve order from strictList
			const allowedSrcs = new Map();
			const allowedPathnames = new Map();
			const allowedBasenames = new Map();
			
			strictList.forEach((item, index) => {
				if (typeof item === 'number' || (typeof item === 'string' && /^\d+$/.test(item))) {
					allowedMediaIds.set(Number(item), index);
				} else if (typeof item === 'string') {
					// normalize protocol-relative URLs and store multiple comparison keys
					let normalized = item;
					if (normalized.indexOf('://') === -1 && normalized.indexOf('//') === 0) {
						normalized = window.location.protocol + normalized;
					}
					allowedSrcs.set(normalized, index);
					try {
						const u = new URL(normalized, window.location.origin);
						allowedPathnames.set(u.pathname, index);
						const parts = u.pathname.split('/');
						allowedBasenames.set(parts[parts.length - 1], index);
					} catch (e) {
						// ignore URL parsing errors
					}
				}
			});

			// Map slides with their sort order index
			const slidesWithOrder = original.map((html, originalIndex) => {
				const temp = document.createElement('div');
				temp.innerHTML = html;
				const slide = temp.firstElementChild;
				let sortIndex = -1;
				
				// attempt to read data-media-id attribute (format: sectionId-mediaId)
				const dataMediaId = slide?.getAttribute('data-media-id') || slide?.querySelector('[data-media-id]')?.getAttribute('data-media-id');
				if (dataMediaId) {
					const parts = dataMediaId.split('-');
					const mediaId = Number(parts[parts.length - 1]);
					if (allowedMediaIds.has(mediaId)) {
						sortIndex = allowedMediaIds.get(mediaId);
						return { html, sortIndex, mediaId };
					}
				}
				
				// fallback: check image srcs inside slide
				const img = slide?.querySelector('img');
				if (img && img.src) {
					// normalize image src for comparison
					let imgSrc = img.src;
					try {
						if (imgSrc.indexOf('://') === -1 && imgSrc.indexOf('//') === 0) imgSrc = window.location.protocol + imgSrc;
						const imgUrl = new URL(imgSrc, window.location.origin);
						const imgPath = imgUrl.pathname;
						const imgBase = imgPath.split('/').pop();
						if (allowedSrcs.has(imgSrc)) sortIndex = allowedSrcs.get(imgSrc);
						else if (allowedPathnames.has(imgPath)) sortIndex = allowedPathnames.get(imgPath);
						else if (allowedBasenames.has(imgBase)) sortIndex = allowedBasenames.get(imgBase);
					} catch (e) {
						// fallback: direct string compare
						if (allowedSrcs.has(img.src)) sortIndex = allowedSrcs.get(img.src);
					}
				}
				
				return sortIndex >= 0 ? { html, sortIndex } : null;
			}).filter(item => item !== null);
			
			// Sort by strictList order (sortIndex)
			const filtered = slidesWithOrder.sort((a, b) => a.sortIndex - b.sortIndex).map(item => item.html);

			const slidesToUse = filtered.length ? filtered : original;
			
			// Safety log: warn if no strict matches found
			if (!filtered.length && original.length > 0) {
				console.warn('⚠️ No strict filter matches for variant ID:', variant.id, '- using all', original.length, 'slides as fallback');
			}
			
			// Recreate slider with only matching slides (fallback to all if no matches)
			swiper.removeAllSlides();
			swiper.appendSlide(slidesToUse);
			swiper.update();
			
			// Force rebuild the DOM wrapper in correct order by removing and re-adding
			const wrapper = elem.querySelector('.swiper-wrapper');
			if (wrapper && slidesToUse.length > 0) {
				// Get all current slides in DOM
				const currentSlides = Array.from(wrapper.querySelectorAll('.swiper-slide'));
				
				// Create a map to find elements by their data-media-id
				const idToElement = new Map();
				currentSlides.forEach(el => {
					const mediaId = el.getAttribute('data-media-id') || 
						el.querySelector('[data-media-id]')?.getAttribute('data-media-id');
					if (mediaId) {
						idToElement.set(mediaId, el);
					}
				});
				
				// Rebuild DOM in correct order by extracting media IDs from HTML and reordering
				const mediaIdOrder = [];
				slidesToUse.forEach((html) => {
					const temp = document.createElement('div');
					temp.innerHTML = html;
					const slide = temp.firstElementChild;
					const mediaId = slide?.getAttribute('data-media-id') || 
						slide?.querySelector('[data-media-id]')?.getAttribute('data-media-id');
					if (mediaId) {
						mediaIdOrder.push(mediaId);
					}
				});
				
				// Clear and rebuild wrapper with slides in correct order
				const fragment = document.createDocumentFragment();
				mediaIdOrder.forEach(mediaId => {
					const el = idToElement.get(mediaId);
					if (el) {
						fragment.appendChild(el.cloneNode(true));
					}
				});
				
				// Clear wrapper and add ordered elements
				while (wrapper.firstChild) {
					wrapper.removeChild(wrapper.firstChild);
				}
				wrapper.appendChild(fragment);
				
				// Force Swiper to recalculate after DOM reorder
				swiper.update();
			}
			
			// Update pagination to reflect new slide count
			updateCustomPagination(swiper);

		// also filter the thumbnail sublist (if present) - SORT BY STRICTLIST ORDER
		if (mediaSublist) {
			const subElem = mediaSublist;
			const originalSub = subElem._originalSlideHtml;
			
			// Map sublist slides with their sort order index
			const subSlidesWithOrder = originalSub.map((html) => {
				const temp = document.createElement('div');
				temp.innerHTML = html;
				const slide = temp.firstElementChild;
				let sortIndex = -1;
				
				const dataMediaId = slide?.getAttribute('data-media-sub-id') || slide?.getAttribute('data-media-id') || slide?.querySelector('[data-media-id]')?.getAttribute('data-media-id');
				if (dataMediaId) {
					const parts = dataMediaId.split('-');
					const mediaId = Number(parts[parts.length - 1]);
					if (allowedMediaIds.has(mediaId)) {
						sortIndex = allowedMediaIds.get(mediaId);
						return { html, sortIndex };
					}
				}
				
				const img = slide?.querySelector('img');
				if (img && img.src) {
					if (allowedSrcs.has(img.src)) sortIndex = allowedSrcs.get(img.src);
					else {
						try {
							const imgPath = new URL(img.src).pathname;
							for (const [s, idx] of allowedSrcs) {
								try {
									const sPath = new URL(s, window.location.origin).pathname;
									if (sPath === imgPath) {
										sortIndex = idx;
										break;
									}
								} catch (e) { /* ignore */ }
							}
						} catch (e) { /* ignore */ }
					}
				}
				
				return sortIndex >= 0 ? { html, sortIndex } : null;
			}).filter(item => item !== null);
			
			// Sort sublist by strictList order
			const filteredSub = subSlidesWithOrder.sort((a, b) => a.sortIndex - b.sortIndex).map(item => item.html);
			const slidesSubToUse = filteredSub.length ? filteredSub : originalSub;
			
			mediaSublist.swiper.removeAllSlides();
			mediaSublist.swiper.appendSlide(slidesSubToUse);
			mediaSublist.swiper.update();
			
			// Reorder thumbnail DOM as well
			const subWrapper = subElem.querySelector('.swiper-wrapper');
			if (subWrapper && slidesSubToUse.length > 0) {
				const currentSubSlides = Array.from(subWrapper.querySelectorAll('.swiper-slide'));
				const idToSubElement = new Map();
				currentSubSlides.forEach(el => {
					const mediaId = el.getAttribute('data-media-sub-id') || 
						el.getAttribute('data-media-id') || 
						el.querySelector('[data-media-id]')?.getAttribute('data-media-id');
					if (mediaId) {
						idToSubElement.set(mediaId, el);
					}
				});
				
				const subMediaIdOrder = [];
				slidesSubToUse.forEach((html) => {
					const temp = document.createElement('div');
					temp.innerHTML = html;
					const slide = temp.firstElementChild;
					const mediaId = slide?.getAttribute('data-media-sub-id') || 
						slide?.getAttribute('data-media-id') || 
						slide?.querySelector('[data-media-id]')?.getAttribute('data-media-id');
					if (mediaId) {
						subMediaIdOrder.push(mediaId);
					}
				});
				
				const subFragment = document.createDocumentFragment();
				subMediaIdOrder.forEach(mediaId => {
					const el = idToSubElement.get(mediaId);
					if (el) {
						subFragment.appendChild(el.cloneNode(true));
					}
				});
				
				while (subWrapper.firstChild) {
					subWrapper.removeChild(subWrapper.firstChild);
				}
				subWrapper.appendChild(subFragment);
				mediaSublist.swiper.update();
			}
		}

		// Try to slide to featured_media or first slide
		if (variant.featured_media) {
			const mediaId = `${sectionId}-${variant.featured_media.id}`;
			const newIndex = Array.from(swiper.slides).findIndex(s => s.querySelector('[data-media-id]')?.getAttribute('data-media-id') === mediaId);
			if (newIndex >= 0) {
				swiper.slideTo(newIndex);
			} else if (swiper.slides.length > 0) {
				swiper.slideTo(0); // fallback to first slide
			}
		}

		return;
	}

	// Fallback: existing computed association filtering (non-strict)
	const variantIdStr = String(variant.id);

	const filtered = original.filter(html => {
		const temp = document.createElement('div');
		temp.innerHTML = html;
		const slide = temp.firstElementChild;
		const ids = slide?.dataset?.variantIds;
		if (!ids) return false;
		return ids.split(',').map(s => s.trim()).includes(variantIdStr);
	});

	const slidesToUse = filtered.length ? filtered : original;

	// Safety log: warn if no matches found in fallback mode
	if (!filtered.length && original.length > 0) {
		console.warn('⚠️ No variant matches found for ID:', variantIdStr, '- using all', original.length, 'slides as fallback');
	}

	// Recreate slider with matching slides
	swiper.removeAllSlides();
	swiper.appendSlide(slidesToUse);
	swiper.update();
	
	// Update pagination to reflect new slide count
	updateCustomPagination(swiper);

	// also filter the thumbnail sublist (if present)
	if (mediaSublist) {
		const subElem = mediaSublist;
		const originalSub = subElem._originalSlideHtml;
		const filteredSub = originalSub.filter(html => {
			const temp = document.createElement('div');
			temp.innerHTML = html;
			const slide = temp.firstElementChild;
			const ids = slide?.dataset?.variantIds;
			if (!ids) return false;
			return ids.split(',').map(s => s.trim()).includes(variantIdStr);
		});
		const slidesSubToUse = filteredSub.length ? filteredSub : originalSub;
		mediaSublist.swiper.removeAllSlides();
		mediaSublist.swiper.appendSlide(slidesSubToUse);
		mediaSublist.swiper.update();
	}

	// If the variant has a featured_media, try to slide to it.
	if (variant.featured_media) {
		const mediaId = `${sectionId}-${variant.featured_media.id}`;
		const newIndex = Array.from(swiper.slides).findIndex(s => s.querySelector('[data-media-id]')?.getAttribute('data-media-id') === mediaId);
		if (newIndex >= 0) swiper.slideTo(newIndex);
	}
}

if (navigator.userAgent.indexOf("iPhone") > -1) {
	document
		.querySelector("[name=viewport]")
		.setAttribute(
			"content",
			"width=device-width, initial-scale=1, maximum-scale=1",
		);
}

function getFocusableElements(container) {
	if (!container) return [];
	return Array.from(
		container.querySelectorAll(
			"summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe",
		),
	);
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
	summary.setAttribute("role", "button");
	summary.setAttribute("aria-expanded", "false");

	if (summary.nextElementSibling.getAttribute("id")) {
		summary.setAttribute("aria-controls", summary.nextElementSibling.id);
	}

	summary.addEventListener("click", (event) => {
		event.currentTarget.setAttribute(
			"aria-expanded",
			!event.currentTarget.closest("details").hasAttribute("open"),
		);
	});

	if (summary.closest("header-drawer")) return;
	summary.parentElement.addEventListener("keyup", onKeyUpEscape);
});

function onKeyUpEscape(event) {
	if (event.code.toUpperCase() !== "ESCAPE") return;

	const openDetailsElement = event.target.closest("details[open]");
	if (!openDetailsElement) return;

	const summaryElement = openDetailsElement.querySelector("summary");
	openDetailsElement.removeAttribute("open");
	summaryElement.setAttribute("aria-expanded", false);
	summaryElement.focus();
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
	var elements = getFocusableElements(container);
	var first = elements[0];
	var last = elements[elements.length - 1];

	removeTrapFocus();

	trapFocusHandlers.focusin = (event) => {
		if (
			event.target !== container &&
			event.target !== last &&
			event.target !== first
		)
			return;

		document.addEventListener("keydown", trapFocusHandlers.keydown);
	};

	trapFocusHandlers.focusout = function () {
		document.removeEventListener("keydown", trapFocusHandlers.keydown);
	};

	trapFocusHandlers.keydown = function (event) {
		if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
		// On the last focusable element and tab forward, focus the first element.
		if (event.target === last && !event.shiftKey) {
			event.preventDefault();
			first.focus();
		}

		//  On the first focusable element and tab backward, focus the last element.
		if (
			(event.target === container || event.target === first) &&
			event.shiftKey
		) {
			event.preventDefault();
			last.focus();
		}
	};

	document.addEventListener("focusout", trapFocusHandlers.focusout);
	document.addEventListener("focusin", trapFocusHandlers.focusin);

	if (elementToFocus) elementToFocus.focus();
}

function pauseAllMedia() {
	document.querySelectorAll(".js-youtube").forEach((video) => {
		video.contentWindow.postMessage(
			'{"event":"command","func":"' + "pauseVideo" + '","args":""}',
			"*",
		);
	});
	document.querySelectorAll(".js-vimeo").forEach((video) => {
		video.contentWindow.postMessage('{"method":"pause"}', "*");
	});
	document.querySelectorAll("video").forEach((video) => video.pause());
	document.querySelectorAll("product-model").forEach((model) => {
		if (model.modelViewerUI) model.modelViewerUI.pause();
	});
}

function removeTrapFocus(elementToFocus = null) {
	document.removeEventListener("focusin", trapFocusHandlers.focusin);
	document.removeEventListener("focusout", trapFocusHandlers.focusout);
	document.removeEventListener("keydown", trapFocusHandlers.keydown);

	if (elementToFocus && !elementToFocus.classList.contains("card-focused"))
		elementToFocus.focus();
}

class QuantityInput extends HTMLElement {
	constructor() {
		super();
		this.input = this.querySelector("input");
		this.changeEvent = new Event("change", { bubbles: true });

		this.querySelectorAll("button").forEach((button) => {
			this.setMinimumDisable();

			button.addEventListener("click", this.onButtonClick.bind(this));
		});

		var eventList = ["paste", "input"];

		for (event of eventList) {
			this.input.addEventListener(event, function (e) {
				const numberRegex = /^0*?[1-9]\d*$/;

				if (
					numberRegex.test(e.currentTarget.value) ||
					e.currentTarget.value === ""
				) {
					e.currentTarget.value;
				} else {
					e.currentTarget.value = 1;
				}

				if (e.currentTarget.value === 1 || e.currentTarget.value === "") {
					this.previousElementSibling.classList.add("disabled");
				} else {
					this.previousElementSibling.classList.remove("disabled");
				}
			});
		}

		this.input.addEventListener("focusout", function (e) {
			if (e.currentTarget.value === "") {
				e.currentTarget.value = 1;
			}
		});
	}

	setMinimumDisable() {
		if (this.input.value == 1) {
			this.querySelector('button[name="minus"]').classList.add("disabled");
		} else {
			this.querySelector('button[name="minus"]').classList.remove("disabled");
		}
	}

	onButtonClick(event) {
		event.preventDefault();
		const previousValue = this.input.value;

		event.target.name === "plus" ? this.input.stepUp() : this.input.stepDown();
		if (previousValue !== this.input.value)
			this.input.dispatchEvent(this.changeEvent);

		this.setMinimumDisable();
	}
}

customElements.define("quantity-input", QuantityInput);

function debounce(fn, wait) {
	let t;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn.apply(this, args), wait);
	};
}

const serializeForm = (form) => {
	const obj = {};
	const formData = new FormData(form);
	for (const key of formData.keys()) {
		obj[key] = formData.get(key);
	}
	return JSON.stringify(obj);
};

function fetchConfig(type = "json") {
	return {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: `application/${type}`,
		},
	};
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == "undefined") {
	window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
	return function () {
		return fn.apply(scope, arguments);
	};
};

Shopify.setSelectorByValue = function (selector, value) {
	for (var i = 0, count = selector.options.length; i < count; i++) {
		var option = selector.options[i];
		if (value == option.value || value == option.innerHTML) {
			selector.selectedIndex = i;
			return i;
		}
	}
};

Shopify.addListener = function (target, eventName, callback) {
	target.addEventListener
		? target.addEventListener(eventName, callback, false)
		: target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
	options = options || {};
	var method = options["method"] || "post";
	var params = options["parameters"] || {};

	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);

	for (var key in params) {
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", params[key]);
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
	country_domid,
	province_domid,
	options,
) {
	this.countryEl = document.getElementById(country_domid);
	this.provinceEl = document.getElementById(province_domid);
	this.provinceContainer = document.getElementById(
		options["hideElement"] || province_domid,
	);

	Shopify.addListener(
		this.countryEl,
		"change",
		Shopify.bind(this.countryHandler, this),
	);

	this.initCountry();
	this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
	initCountry: function () {
		var value = this.countryEl.getAttribute("data-default");
		Shopify.setSelectorByValue(this.countryEl, value);
		this.countryHandler();
	},

	initProvince: function () {
		var value = this.provinceEl.getAttribute("data-default");
		if (value && this.provinceEl.options.length > 0) {
			Shopify.setSelectorByValue(this.provinceEl, value);
		}
	},

	countryHandler: function (e) {
		var opt = this.countryEl.options[this.countryEl.selectedIndex];
		var raw = opt.getAttribute("data-provinces");
		var provinces = JSON.parse(raw);

		this.clearOptions(this.provinceEl);
		if (provinces && provinces.length == 0) {
			this.provinceContainer.style.display = "none";
		} else {
			for (let i = 0; i < provinces.length; i++) {
				var opt = document.createElement("option");
				opt.value = provinces[i][0];
				opt.innerHTML = provinces[i][1];
				this.provinceEl.appendChild(opt);
			}

			this.provinceContainer.style.display = "";
		}
	},

	clearOptions: function (selector) {
		while (selector.firstChild) {
			selector.removeChild(selector.firstChild);
		}
	},

	setOptions: function (selector, values) {
		for (var i = 0, count = values.length; i < values.length; i++) {
			var opt = document.createElement("option");
			opt.value = values[i];
			opt.innerHTML = values[i];
			selector.appendChild(opt);
		}
	},
};

class MenuDrawer extends HTMLElement {
	constructor() {
		super();

		this.mainDetailsToggle = this.querySelector("details");
		const summaryElements = this.querySelectorAll("summary");
		this.addAccessibilityAttributes(summaryElements);

		this.headerWrapper = document.querySelector(".header-wrapper");
		if (this.headerWrapper) this.headerWrapper.preventHide = false;

		if (navigator.platform === "iPhone")
			document.documentElement.style.setProperty(
				"--viewport-height",
				`${window.innerHeight}px`,
			);

		this.addEventListener("keyup", this.onKeyUp.bind(this));
		this.addEventListener("focusout", this.onFocusOut.bind(this));
		this.bindEvents();
	}

	bindEvents() {
		this.querySelectorAll("summary").forEach((summary) =>
			summary.addEventListener("click", this.onSummaryClick.bind(this)),
		);
		this.querySelectorAll("button").forEach((button) => {
			if (this.querySelector(".toggle-scheme-button") === button) return;
			if (this.querySelector(".header__localization-button") === button) return;
			if (this.querySelector(".header__localization-lang-button") === button)
				return;
			button.addEventListener("click", this.onCloseButtonClick.bind(this));
		});
	}

	addAccessibilityAttributes(summaryElements) {
		summaryElements.forEach((element) => {
			element.setAttribute("role", "button");
			element.setAttribute("aria-expanded", false);
			element.setAttribute("aria-controls", element.nextElementSibling.id);
		});
	}

	onKeyUp(event) {
		if (event.code.toUpperCase() !== "ESCAPE") return;

		const openDetailsElement = event.target.closest("details[open]");
		if (!openDetailsElement) return;

		openDetailsElement === this.mainDetailsToggle
			? this.closeMenuDrawer(this.mainDetailsToggle.querySelector("summary"))
			: this.closeSubmenu(openDetailsElement);
	}

	onSummaryClick(event) {
		const summaryElement = event.currentTarget;
		const detailsElement = summaryElement.parentNode;
		const isOpen = detailsElement.hasAttribute("open");

		if (detailsElement === this.mainDetailsToggle) {
			if (isOpen) event.preventDefault();
			isOpen
				? this.closeMenuDrawer(summaryElement)
				: this.openMenuDrawer(summaryElement);
		} else {
			trapFocus(
				summaryElement.nextElementSibling,
				detailsElement.querySelector("button"),
			);

			setTimeout(() => {
				detailsElement.classList.add("menu-opening");
			});
		}
	}

	openMenuDrawer(summaryElement) {
		if (this.headerWrapper) this.headerWrapper.preventHide = true;
		setTimeout(() => {
			this.mainDetailsToggle.classList.add("menu-opening");
		});
		summaryElement.setAttribute("aria-expanded", true);
		trapFocus(this.mainDetailsToggle, summaryElement);
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
	}

	closeMenuDrawer(event, elementToFocus = false) {
		if (event !== undefined) {
			this.mainDetailsToggle.classList.remove("menu-opening");
			this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
				details.removeAttribute("open");
				details.classList.remove("menu-opening");
			});
			this.mainDetailsToggle
				.querySelector("summary")
				.setAttribute("aria-expanded", false);
			document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
			removeTrapFocus(elementToFocus);
			this.closeAnimation(this.mainDetailsToggle);
			this.header = this.header || document.querySelector(".shopify-section-header");
			const main = document.querySelector("main");
			if (
				main?.querySelectorAll(".shopify-section")[0]?.classList.contains("section--has-overlay") &&
				!this.header.classList.contains("animate")
			) {
				this.header.classList.remove("color-background-overlay-hidden");
				this.header.classList.add("color-background-overlay");
			}

			if (this.headerWrapper) this.headerWrapper.preventHide = false;
		}
	}

	onFocusOut(event) {
		setTimeout(() => {
			if (
				this.mainDetailsToggle.hasAttribute("open") &&
				!this.mainDetailsToggle.contains(document.activeElement)
			)
				this.closeMenuDrawer();
		});
	}

	onCloseButtonClick(event) {
		const detailsElement = event.currentTarget.closest("details");
		this.closeSubmenu(detailsElement);
	}

	closeSubmenu(detailsElement) {
		detailsElement.classList.remove("menu-opening");
		removeTrapFocus();
		this.closeAnimation(detailsElement);
	}

	closeAnimation(detailsElement) {
		let animationStart;

		const handleAnimation = (time) => {
			if (animationStart === undefined) {
				animationStart = time;
			}

			const elapsedTime = time - animationStart;

			if (elapsedTime < 400) {
				window.requestAnimationFrame(handleAnimation);
			} else {
				detailsElement.removeAttribute("open");
				if (detailsElement.closest("details[open]")) {
					trapFocus(
						detailsElement.closest("details[open]"),
						detailsElement.querySelector("summary"),
					);
				}
			}
		};

		window.requestAnimationFrame(handleAnimation);
	}
}

customElements.define("menu-drawer", MenuDrawer);

class HeaderDrawer extends MenuDrawer {
	constructor() {
		super();
		this.headerWrapper = document.querySelector('.header-wrapper');
		if (this.headerWrapper) this.headerWrapper.preventHide = false;
	}

	openMenuDrawer(summaryElement) {
		if (this.headerWrapper) this.headerWrapper.preventHide = true;
		this.header = this.header || document.querySelector(".shopify-section-header");
		this.borderOffset =
			this.borderOffset ||
			this.closest(".header-wrapper").classList.contains("header-wrapper--border-bottom") ? 1 : 0;

		const main = document.querySelector("main");
		if (main?.querySelectorAll(".shopify-section")[0]?.classList.contains("section--has-overlay")) {
			this.header.classList.remove("color-background-overlay");
			this.header.classList.add("color-background-overlay-hidden");
		}


		setTimeout(() => {
			this.mainDetailsToggle.classList.add("menu-opening");
		});

		summaryElement.setAttribute("aria-expanded", true);
		trapFocus(this.mainDetailsToggle, summaryElement);
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
	}
}

customElements.define("header-drawer", HeaderDrawer);

class ModalDialog extends HTMLElement {
	constructor() {
		super();
		this.querySelector('[id^="ModalClose-"]').addEventListener(
			"click",
			this.hide.bind(this, false),
		);
		this.addEventListener("keyup", (event) => {
			if (event.code.toUpperCase() === "ESCAPE") this.hide();
		});
		if (this.classList.contains("media-modal")) {
			this.addEventListener("pointerup", (event) => {
				if (
					event.pointerType === "mouse" &&
					!event.target.closest("deferred-media, product-model")
				)
					this.hide();
			});
		} else {
			this.addEventListener("click", (event) => {
				if (event.target === this) this.hide();
			});
		}
	}

	filterPopupSlider(sectionId, variant) {
		const popupSlider = this.querySelector('.js-popup-slider');
		if (!popupSlider || !popupSlider.swiper) return;

		const elem = popupSlider;
		
		// Store original slide HTML if not already stored
		if (!elem._originalSlideHtml) {
			elem._originalSlideHtml = Array.from(elem.querySelectorAll('.swiper-slide')).map(s => s.outerHTML);
		}
		const original = elem._originalSlideHtml;
		
		// Try to read strict variant->images mapping from VariantImages-<productId> script
		let strictList = null;
		try {
			const productMediaScript = document.getElementById('ProductMedia');
			const productId = productMediaScript?.dataset?.productId || null;
			if (productId) {
				const variantImagesScript = document.getElementById(`VariantImages-${productId}`);
				if (variantImagesScript) {
					const mapping = JSON.parse(variantImagesScript.textContent || '{}');
					const arr = mapping[String(variant.id)];
					if (arr && Array.isArray(arr) && arr.length) {
						strictList = arr.slice();
					} else if (arr && typeof arr === 'string') {
						try {
							const parsed = JSON.parse(arr);
							if (Array.isArray(parsed) && parsed.length) {
								strictList = parsed;
							}
						} catch (e) { /* Not valid JSON */ }
					}
				}
			}
		} catch (e) {
			/* ignore JSON errors */
		}

		const swiper = elem.swiper;

		if (strictList) {
			// Normalize strictList entries: they may be media ids (numbers) or image src strings
			const allowedMediaIds = new Map(); // Use Map to preserve order from strictList
			const allowedSrcs = new Map();
			const allowedPathnames = new Map();
			const allowedBasenames = new Map();
			
			strictList.forEach((item, index) => {
				if (typeof item === 'number' || (typeof item === 'string' && /^\d+$/.test(item))) {
					allowedMediaIds.set(Number(item), index);
				} else if (typeof item === 'string') {
					let normalized = item;
					if (normalized.indexOf('://') === -1 && normalized.indexOf('//') === 0) {
						normalized = window.location.protocol + normalized;
					}
					allowedSrcs.set(normalized, index);
					try {
						const u = new URL(normalized, window.location.origin);
						allowedPathnames.set(u.pathname, index);
						const parts = u.pathname.split('/');
						allowedBasenames.set(parts[parts.length - 1], index);
					} catch (e) { /* ignore */ }
				}
			});

			// Map slides with their sort order index
			const slidesWithOrder = original.map((html, originalIndex) => {
				const temp = document.createElement('div');
				temp.innerHTML = html;
				const slide = temp.firstElementChild;
				let sortIndex = -1;
				
				// Check data-media-modal-id attribute
				const dataMediaId = slide?.getAttribute('data-media-modal-id');
				if (dataMediaId) {
					const parts = dataMediaId.split('-');
					const mediaId = Number(parts[parts.length - 1]);
					if (allowedMediaIds.has(mediaId)) {
						sortIndex = allowedMediaIds.get(mediaId);
						return { html, sortIndex };
					}
				}
				
				// Check image srcs
				const img = slide?.querySelector('img');
				if (img && img.src) {
					let imgSrc = img.src;
					try {
						if (imgSrc.indexOf('://') === -1 && imgSrc.indexOf('//') === 0) imgSrc = window.location.protocol + imgSrc;
						const imgUrl = new URL(imgSrc, window.location.origin);
						const imgPath = imgUrl.pathname;
						const imgBase = imgPath.split('/').pop();
						if (allowedSrcs.has(imgSrc)) sortIndex = allowedSrcs.get(imgSrc);
						else if (allowedPathnames.has(imgPath)) sortIndex = allowedPathnames.get(imgPath);
						else if (allowedBasenames.has(imgBase)) sortIndex = allowedBasenames.get(imgBase);
					} catch (e) {
						if (allowedSrcs.has(img.src)) sortIndex = allowedSrcs.get(img.src);
					}
				}
				
				return sortIndex >= 0 ? { html, sortIndex } : null;
			}).filter(item => item !== null);
			
			// Sort by strictList order (sortIndex)
			const filtered = slidesWithOrder.sort((a, b) => a.sortIndex - b.sortIndex).map(item => item.html);

			const slidesToUse = filtered.length ? filtered : original;
			
			// Rebuild popup slider (fallback to all if no matches)
			swiper.removeAllSlides();
			swiper.appendSlide(slidesToUse);
			swiper.update();
			
			// Force rebuild the DOM wrapper in correct order by removing and re-adding
			const wrapper = elem.querySelector('.swiper-wrapper');
			if (wrapper && slidesToUse.length > 0) {
				// Get all current slides in DOM
				const currentSlides = Array.from(wrapper.querySelectorAll('.swiper-slide'));
				
				// Create a map to find elements by their data-media-modal-id
				const idToElement = new Map();
				currentSlides.forEach(el => {
					const mediaId = el.getAttribute('data-media-modal-id') || 
						el.querySelector('[data-media-id]')?.getAttribute('data-media-id');
					if (mediaId) {
						idToElement.set(mediaId, el);
					}
				});
				
				// Rebuild DOM in correct order by extracting media IDs from HTML and reordering
				const mediaIdOrder = [];
				slidesToUse.forEach((html) => {
					const temp = document.createElement('div');
					temp.innerHTML = html;
					const slide = temp.firstElementChild;
					const mediaId = slide?.getAttribute('data-media-modal-id') || 
						slide?.querySelector('[data-media-id]')?.getAttribute('data-media-id');
					if (mediaId) {
						mediaIdOrder.push(mediaId);
					}
				});
				
				// Clear and rebuild wrapper with slides in correct order
				const fragment = document.createDocumentFragment();
				mediaIdOrder.forEach(mediaId => {
					const el = idToElement.get(mediaId);
					if (el) {
						fragment.appendChild(el.cloneNode(true));
					}
				});
				
				// Clear wrapper and add ordered elements
				while (wrapper.firstChild) {
					wrapper.removeChild(wrapper.firstChild);
				}
				wrapper.appendChild(fragment);
				
				// Force Swiper to recalculate after DOM reorder
				swiper.update();
			}
			
			// Update pagination to reflect new slide count
			updateCustomPagination(swiper);
			return;
		}

		// Fallback: filter by variant IDs
		const variantIdStr = String(variant.id);
		const filtered = original.filter(html => {
			const temp = document.createElement('div');
			temp.innerHTML = html;
			const slide = temp.firstElementChild;
			const ids = slide?.dataset?.variantIds;
			if (!ids) return false;
			return ids.split(',').map(s => s.trim()).includes(variantIdStr);
		});

		const slidesToUse = filtered.length ? filtered : original;
		swiper.removeAllSlides();
		swiper.appendSlide(slidesToUse);
		swiper.update();
		
		// Update pagination to reflect new slide count
		updateCustomPagination(swiper);
	}

	connectedCallback() {
		if (this.moved) return;
		this.moved = true;
		document.body.appendChild(this);
	}

	show(opener) {
		this.openedBy = opener;
		const popup = this.querySelector(".template-popup");
		document.body.classList.add("overflow-hidden-modal");
		this.setAttribute("open", "");
		if (popup) popup.loadContent();
		trapFocus(this, this.querySelector('[role="dialog"]'));
		window.pauseAllMedia();
	}

	hide() {
		let isOpen = false;

		this.removeAttribute("open");
		removeTrapFocus(this.openedBy);
		window.pauseAllMedia();

		document.querySelectorAll("body > quick-add-modal").forEach((el) => {
			if (el.hasAttribute("open")) {
				isOpen = true;
			}
		});

		if (!isOpen) {
			document.body.classList.remove("overflow-hidden-modal");
			document.body.dispatchEvent(new CustomEvent("modalClosed"));
		}

		const images = document.querySelector(".product-media-modal__content");

		if (images) {
			images.classList.remove("zoom");
		}
	}
}

customElements.define("modal-dialog", ModalDialog);

class ModalOpener extends HTMLElement {
	constructor() {
		super();

		const button = this.querySelector("button");

		if (!button) return;
		button.addEventListener("click", () => {
			const modal = document.querySelector(this.getAttribute("data-modal"));
			if (modal) modal.show(button);
		});
	}
}

customElements.define("modal-opener", ModalOpener);

class DeferredMedia extends HTMLElement {
	constructor() {
		super();
		this.querySelector('[id^="Deferred-Poster-"]')?.addEventListener(
			"click",
			this.loadContent.bind(this),
		);
	}

	loadContent() {
		if (!this.getAttribute("loaded")) {
			const content = document.createElement("div");
			content.appendChild(
				this.querySelector("template").content.firstElementChild.cloneNode(
					true,
				),
			);

			this.setAttribute("loaded", true);
			window.pauseAllMedia();
			this.appendChild(
				content.querySelector("video, model-viewer, iframe"),
			).focus();

			if (
				this.closest(".swiper")?.swiper.slides[
					this.closest(".swiper").swiper.activeIndex
				].querySelector("model-viewer")
			) {
				if (
					!this.closest(".swiper")
						.swiper.slides[
							this.closest(".swiper").swiper.activeIndex
						].querySelector("model-viewer")
						.classList.contains("shopify-model-viewer-ui__disabled")
				) {
					this.closest(".swiper").swiper.params.noSwiping = true;
					this.closest(".swiper").swiper.params.noSwipingClass = "swiper-slide";
				}
			}
		}
	}
}

customElements.define("deferred-media", DeferredMedia);

class VariantSelects extends HTMLElement {
	constructor() {
		super();
		this.addEventListener("change", this.onVariantChange);
		
		// Auto-filter images on initial page load with first/selected variant
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				this.initializeVariantFiltering();
			});
		} else {
			// DOM already loaded
			this.initializeVariantFiltering();
		}
	}
	
	initializeVariantFiltering() {
		// Wait for variant data to be available
		const waitForVariant = setInterval(() => {
			this.updateOptions();
			this.updateMasterId();
			
			if (this.currentVariant) {
				clearInterval(waitForVariant);
				// Trigger initial filter with default/selected variant
				this.onVariantChange();
			}
		}, 50);
	}

	onVariantChange() {
		this.updateOptions();
		this.updateMasterId();
		this.toggleAddButton(true, "", false);
		this.updatePickupAvailability();
		this.updateVariantStatuses();

		if (!this.currentVariant) {
			this.toggleAddButton(true, "", true);
			this.setUnavailable();
		} else {
			if (!this.closest("floated-form")) {
				this.updateMedia();
			}
			this.updateURL();
			this.updateVariantInput();
			this.renderProductInfo();
		}
	}

	updateOptions() {
		//const fieldsets = Array.from(this.querySelectorAll(".js-radio-colors"));
		// js-radio-colors was added to display Color swatches in the Dropdown type
		// but Color swatches are no longer supported in this type

		this.options = Array.from(
			this.querySelectorAll("select"),
			(select) => select.value,
		//).concat(
		//	fieldsets.map((fieldset) => {
		//		return Array.from(fieldset.querySelectorAll("input")).find(
		//			(radio) => radio.checked,
		//		).value;
		//	}),
		);
	}

	updateMasterId() {
		if (this.variantData || this.querySelector('[type="application/json"]')) {
			this.currentVariant = this.getVariantData().find((variant) => {
				//this.options.sort();
				//variant.options.sort();

				return !variant.options
					.map((option, index) => {
						return this.options[index] === option;
					})
					.includes(false);
			});
		}
	}

	isHidden(elem) {
		const styles = window.getComputedStyle(elem);
		return styles.display === "none" || styles.visibility === "hidden";
	}

	updateMedia() {
		if (!this.currentVariant || !this.currentVariant?.featured_media) return;

		const mediaId = `${this.dataset.section}-${this.currentVariant.featured_media.id}`;

		const productMain = document.querySelector(`[data-product-main="${this.dataset.section}"]`);

		// Filter the media slides so only images associated with the selected variant remain.
		filterMediaSlidesByVariant(this.dataset.section, this.currentVariant);

		// Also filter the popup slider (zoom modal)
		const productModal = document.querySelector(".product-media-modal");
		if (productModal && productModal instanceof ModalDialog) {
			productModal.filterPopupSlider(this.dataset.section, this.currentVariant);
		}

		if (productMain) {
			const mediaList = productMain.querySelector(".product__media-list:not(.swiper-initialized)");
			if (mediaList) {
				const activeMedia = mediaList.querySelector(`[data-media-id="${mediaId}"]`);
				mediaList.querySelectorAll("[data-media-id]").forEach((element) => {
					element.classList.remove("active-media");
				});
				if (activeMedia) activeMedia.classList.add("active-media");
			}
		}

		const swiperWrappers = document.querySelectorAll(".product__media-wrapper");

		swiperWrappers.forEach((elem) => {
			if (!this.isHidden(elem)) {
				const newMedia = elem.querySelector(`[data-media-id="${mediaId}"]`);

				if (elem.querySelector(".js-media-list")) {
					elem.querySelector(".js-media-list").swiper.slideTo(
						elem.querySelector(".js-media-list").swiper.slides.indexOf(newMedia)
					);
				}
			}
		});
	}

	updateURL() {
		if (!this.classList.contains("featured-product-radios")) {
			if (!this.currentVariant || this.dataset.updateUrl === "false") return;
			window.history.replaceState(
				{},
				"",
				`${this.dataset.url}?variant=${this.currentVariant.id}`,
			);
		}
	}

	updateVariantInput() {
		const productForms = document.querySelectorAll(
			`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`,
		);
		productForms.forEach((productForm) => {
			const input = productForm.querySelector('input[name="id"]');
			input.value = this.currentVariant.id;
			input.dispatchEvent(new Event("change", { bubbles: true }));
		});
	}

	updateVariantStatuses() {
		const selectedOptionOneVariants = this.variantData.filter(
			(variant) => this.querySelector(":checked").value === variant.option1,
		);
		const inputWrappers = [...this.querySelectorAll(".product-form__controls")];
		inputWrappers.forEach((option, index) => {
			if (index === 0) return;
			const optionInputs = [
				...option.querySelectorAll('input[type="radio"], option'),
			];
			const previousOptionSelected =
				inputWrappers[index - 1].querySelector(":checked").value;
			const availableOptionInputsValue = selectedOptionOneVariants
				.filter(
					(variant) =>
						variant.available &&
						variant[`option${index}`] === previousOptionSelected,
				)
				.map((variantOption) => variantOption[`option${index + 1}`]);
			this.setInputAvailability(optionInputs, availableOptionInputsValue);
		});
	}

	setInputAvailability(listOfOptions, listOfAvailableOptions) {
		listOfOptions.forEach((input) => {
			if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
				if (input.tagName === "OPTION") {
					input.innerText = input.getAttribute("value");
				} else if (input.tagName === "INPUT") {
					input.classList.remove("disabled");
				}
			} else {
				if (input.tagName === "OPTION") {
					input.innerText =
						window.variantStrings.unavailable_with_option.replace(
							"[value]",
							input.getAttribute("value"),
						);
				} else if (input.tagName === "INPUT") {
					input.classList.add("disabled");
				}
			}
		});
	}

	updatePickupAvailability() {
		const pickUpAvailability = document.querySelector("pickup-availability");
		if (!pickUpAvailability) return;

		if (this.currentVariant && this.currentVariant.available) {
			pickUpAvailability.fetchAvailability(this.currentVariant.id);
		} else {
			pickUpAvailability.removeAttribute("available");
			pickUpAvailability.innerHTML = "";
		}
	}

	renderProductInfo() {
		const requestedVariantId = this.currentVariant.id;
		const sectionId = this.dataset.originalSection
			? this.dataset.originalSection
			: this.dataset.section;

		fetch(
			`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${
				this.dataset.originalSection
					? this.dataset.originalSection
					: this.dataset.section
			}`,
		)
			.then((response) => response.text())
			.then((responseText) => {
				// prevent unnecessary ui changes from abandoned selections
				if (!this.currentVariant) return;
				if (this.currentVariant.id !== requestedVariantId) return;

				const html = new DOMParser().parseFromString(responseText, "text/html");
				const destination = document.getElementById(`price-${this.dataset.section}`,);
				const source = html.getElementById(
					`price-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`,
				);
				const skuSource = html.getElementById(
					`Sku-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`,
				);
				const skuDestination = document.getElementById(
					`Sku-${this.dataset.section}`,
				);
				const inventorySource = html.getElementById(
					`Inventory-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`,
				);
				const inventoryDestination = document.getElementById(
					`Inventory-${this.dataset.section}`,
				);
				const colorNameSource = html.getElementById(
					`ColorName-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`,
				);
				const colorNameDestination = document.getElementById(
					`ColorName-${this.dataset.section}`,
				);

				if (source && destination) destination.innerHTML = source.innerHTML;
				if (inventorySource && inventoryDestination)
					inventoryDestination.innerHTML = inventorySource.innerHTML;
				if (skuSource && skuDestination) {
					skuDestination.innerHTML = skuSource.innerHTML;
					skuDestination.classList.toggle(
						"visibility-hidden",
						skuSource.classList.contains("visibility-hidden"),
					);
				}
				if (colorNameSource && colorNameDestination)
					colorNameDestination.innerHTML = colorNameSource.innerHTML;

				const price = document.getElementById(`price-${this.dataset.section}`);

				if (price) price.classList.remove("visibility-hidden");

				if (inventoryDestination)
					inventoryDestination.classList.toggle(
						"visibility-hidden",
						inventorySource.innerText === "",
					);

				this.toggleAddButton(
					!this.currentVariant.available,
					window.variantStrings.soldOut,
				);
			});
	}

	toggleAddButton(disable = true, text, modifyClass = true) {
		const productForm = document.getElementById(
			`product-form-${this.dataset.section}`,
		);
		if (!productForm) return;
		const addButton = productForm.querySelector('[name="add"]');
		const addButtonText = productForm.querySelector('[name="add"] > span');
		if (!addButton) return;

		if (disable) {
			addButton.setAttribute("disabled", "disabled");
			if (text) addButtonText.textContent = text;
		} else {
			addButton.removeAttribute("disabled");
			addButtonText.textContent = window.variantStrings.addToCart;
		}

		if (!modifyClass) return;
	}

	setUnavailable() {
		const button = document.getElementById(
			`product-form-${this.dataset.section}`,
		);
		const addButton = button.querySelector('[name="add"]');
		const price = document.getElementById(`price-${this.dataset.section}`);
		const inventory = document.getElementById(
			`Inventory-${this.dataset.section}`,
		);
		const sku = document.getElementById(`Sku-${this.dataset.section}`);

		if (!addButton) return;
		this.toggleAddButton(true, window.variantStrings.unavailable);
		if (price) price.classList.add("visibility-hidden");
		if (inventory) inventory.classList.add("visibility-hidden");
		if (sku) sku.classList.add("visibility-hidden");
	}

	getVariantData() {
		this.variantData =
			this.variantData ||
			JSON.parse(this.querySelector('[type="application/json"]').textContent);
		return this.variantData;
	}
}

customElements.define("variant-selects", VariantSelects);

class VariantRadios extends VariantSelects {
	constructor() {
		super();
	}

	setInputAvailability(listOfOptions, listOfAvailableOptions) {
		listOfOptions.forEach((input) => {
			if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
				input.classList.remove("disabled");
			} else {
				input.classList.add("disabled");
			}
		});
	}

	updateOptions() {
		const fieldsets = Array.from(this.querySelectorAll("fieldset"));
		this.options = fieldsets.map((fieldset) => {
			return Array.from(fieldset.querySelectorAll("input")).find(
				(radio) => radio.checked,
			).value;
		});
	}
}

customElements.define("variant-radios", VariantRadios);

class PasswordViewer {
	constructor() {
		const passwordField = document.querySelectorAll(".field--pass");

		passwordField.forEach((el) => {
			const input = el.querySelector("input");
			const btnWrapper = el.querySelector(".button-pass-visibility");
			const btnOpen = el.querySelector(".icon-eye-close");
			const btnClose = el.querySelector(".icon-eye");

			input.addEventListener("input", () => {
				input.value !== ""
					? (btnWrapper.style.display = "block")
					: (btnWrapper.style.display = "none");
			});

			btnOpen.addEventListener("click", () => {
				input.type = "text";
				btnOpen.style.display = "none";
				btnClose.style.display = "block";
			});

			btnClose.addEventListener("click", () => {
				input.type = "password";
				btnOpen.style.display = "block";
				btnClose.style.display = "none";
			});
		});
	}
}

class ProductRecommendations extends HTMLElement {
	constructor() {
		super();

		const handleIntersection = (entries, observer) => {
			if (!entries[0].isIntersecting) return;
			observer.unobserve(this);

			if (this.querySelector('.product-recommendations__loading')) {
				this.querySelector('.product-recommendations__loading').classList.add('loading');
				this.querySelector('.product-recommendations__loading').style.display = 'flex';
			}

			fetch(this.dataset.url)
				.then((response) => response.text())
				.then((text) => {
					const html = document.createElement('div');
					html.innerHTML = text;
					const recommendations = html.querySelector('product-recommendations');
					if (recommendations && recommendations.innerHTML.trim().length) {
						this.innerHTML = recommendations.innerHTML;
					}

					if (this.querySelector('.product-recommendations__empty')) {
						this.querySelector('.product-recommendations__empty').style.display = 'flex';
					}

					/* Color swatches */
					const generateSrcset = (image, widths = []) => {
						const imageUrl = new URL(image['src']);
						return widths
							.filter((width) => width <= image['width'])
							.map((width) => {
								imageUrl.searchParams.set('width', width.toString());
								return `${imageUrl.href} ${width}w`;
							})
							.join(', ');
					};

					const createImageElement = (
						image,
						classes,
						sizes,
						productTitle
					) => {
						const previewImage = image['preview_image'];
						const newImage = new Image(previewImage['width'], previewImage['height']);
						newImage.className = classes;
						newImage.alt = image['alt'] || productTitle;
						newImage.sizes = sizes;
						newImage.src = previewImage['src'];
						newImage.srcset = generateSrcset(previewImage, [165, 360, 533, 720, 940, 1066]);
						newImage.loading = 'lazy';
						return newImage;
					};

					const checkSwatches = () => {
						document
							.querySelectorAll('.js-color-swatches-wrapper')
							.forEach((wrapper) => {
								wrapper
									.querySelectorAll('.js-color-swatches input')
									.forEach((input) => {
										input.addEventListener('click', (event) => {
											const primaryImage = wrapper.querySelector('.media--first');
											const secondaryImage = wrapper.querySelector('.media--second');
											const handleProduct = wrapper.dataset.product;

											if (event.currentTarget.checked && primaryImage) {
												wrapper
													.querySelector('.js-color-swatches-link')
													.setAttribute('href', event.currentTarget.dataset.variantLink);
												if (wrapper.querySelector('.card__add-to-cart button[name="add"]')) {
													wrapper
														.querySelector('.card__add-to-cart button[name="add"]')
														.setAttribute("aria-disabled", false);
													if (wrapper.querySelector('.card__add-to-cart button[name="add"] > span')) {
														wrapper
															.querySelector('.card__add-to-cart button[name="add"] > span')
															.classList.remove("hidden");
														wrapper
															.querySelector('.card__add-to-cart button[name="add"] .sold-out-message')
															.classList.add("hidden");
													}
													wrapper.querySelector('.card__add-to-cart input[name="id"]').value =
														event.currentTarget.dataset.variantId;
												}
												const currentColor = event.currentTarget.value;

												jQuery.getJSON(
													window.Shopify.routes.root + `products/${handleProduct}.js`,
													function (product) {
														const variant = product.variants.filter(
															(item) =>
																item.featured_media != null &&
																item.options.includes(currentColor)
														)[0];

														if (variant) {
															const newPrimaryImage = createImageElement(
																variant['featured_media'],
																primaryImage.className,
																primaryImage.sizes,
																product.title
															);

															if (newPrimaryImage.src !== primaryImage.src) {
																let flag = false;
																if (secondaryImage) {
																	const secondaryImagePathname = new URL(
																		secondaryImage.src
																	).pathname;
																	const newPrimaryImagePathname = new URL(
																		newPrimaryImage.src
																	).pathname;

																	if (secondaryImagePathname == newPrimaryImagePathname) {
																		primaryImage.remove();
																		secondaryImage.classList.remove('media--second');
																		secondaryImage.classList.add('media--first');
																		flag = true;
																	}
																}
																if (flag == false) {
																	primaryImage.animate(
																		{ opacity: [1, 0] },
																		{
																			duration: 200,
																			easing: 'ease-in',
																			fill: 'forwards',
																		}
																	).finished;
																	setTimeout(function () {
																		primaryImage.replaceWith(newPrimaryImage);
																		newPrimaryImage.animate(
																			{ opacity: [0, 1] },
																			{ duration: 200, easing: 'ease-in' }
																		);
																		if (secondaryImage) {
																			secondaryImage.remove();
																		}
																	}, 200);
																}
															}
														}
													}
												);
											}
										});
									});
							});
					};

					checkSwatches();

					const addClasses = (slider) => {
						const sliderWrapper = slider.querySelector(".product-recommendations__wrapper");
						const slides = slider.querySelectorAll(".product-recommendations__item");

						slider.classList.add("swiper");
						if (sliderWrapper) sliderWrapper.classList.add("swiper-wrapper");

						if (slides.length > 1) {
							slides.forEach((slide) => {
								slide.classList.add("swiper-slide");
							});
						}
					};

					const removeClasses = (slider) => {
						const sliderWrapper = slider.querySelector(".product-recommendations__wrapper");
						const slides = slider.querySelectorAll(".product-recommendations__item");

						slider.classList.remove("swiper");
						if (sliderWrapper) sliderWrapper.classList.remove("swiper-wrapper");

						if (slides.length > 0) {
							slides.forEach((slide) => {
								slide.removeAttribute("style");
								slide.classList.remove("swiper-slide");
							});
						}
					};

					const initSlider = () => {
						const slider = this.querySelector(".swiper--recomend-products");

						if (slider) {
							addClasses(slider);
							const numberColumns = slider.dataset.columnsMobile || 1;

							new Swiper(slider, {
								loop: false,
								speed: 800,
								breakpoints: {
									320: {
										slidesPerView: Number(numberColumns),
										slidesPerGroup: Number(numberColumns),
										spaceBetween: 8,
									},
									750: {
										slidesPerView: 2,
										slidesPerGroup: 2,
										spaceBetween: 16,
									},
								},
								pagination: {
									el: slider.querySelector(".product-recommendations__pagination"),
									clickable: true,
									type: "custom",
									renderCustom: function (swiper, current, total) {
										let out = "";
										for (let i = 1; i < total + 1; i++) {
											if (i == current) {
												out = `${out}<span class="swiper-pagination-bullet swiper-pagination-bullet-active" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`;
											} else {
												out = `${out}<span class="swiper-pagination-bullet" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`;
											}
										}
										return out;
									},
								},
							});
						}
					};

					const destroySlider = () => {
						const slider = this.querySelector('.swiper--recomend-products');

						if (slider) {
							removeClasses(slider);
						}
					};

					const initSection = () => {
						const resizeObserver = new ResizeObserver((entries) => {
							const [entry] = entries;

							if (entry.contentRect.width < 990) {
								initSlider();
							} else {
								destroySlider();
							}
						});

						resizeObserver.observe(this);
					};

					initSection();
				})
				.catch((e) => {
					console.error(e);
				})
				.finally(() => {
					if (this.querySelector('.product-recommendations__loading')) {
						this.querySelector('.product-recommendations__loading').classList.remove('loading');
						this.querySelector('.product-recommendations__loading').remove();
					}
				});
		};

		new IntersectionObserver(handleIntersection.bind(this), {
			rootMargin: '0px 0px 200px 0px',
		}).observe(this);
	}
}

customElements.define('product-recommendations', ProductRecommendations);

class LocalizationForm extends HTMLElement {
	constructor() {
		super();
		this.elements = {
			input: this.querySelector('input[name="locale_code"], input[name="country_code"]'),
			button: this.querySelector('button'),
			panel: this.querySelector('ul'),
		};
		this.elements.button.addEventListener('click', this.openSelector.bind(this));
		this.elements.button.addEventListener('focusout', this.closeSelector.bind(this));
		this.addEventListener('keyup', this.onContainerKeyUp.bind(this));

		this.querySelectorAll('a').forEach((item) =>
			item.addEventListener('click', this.onItemClick.bind(this))
		);
	}

	hidePanel() {
		this.elements.button.setAttribute('aria-expanded', 'false');
		this.elements.panel.setAttribute('hidden', true);
	}

	onContainerKeyUp(event) {
		if (event.code.toUpperCase() !== 'ESCAPE') return;

		this.hidePanel();
		this.elements.button.focus();
	}

	onItemClick(event) {
		event.preventDefault();
		this.elements.input.value = event.currentTarget.dataset.value;
		this.querySelector('form')?.submit();
	}

	openSelector() {
		this.elements.button.focus();
		this.elements.panel.toggleAttribute('hidden');
		this.elements.button.setAttribute(
			'aria-expanded',
			(this.elements.button.getAttribute('aria-expanded') === 'false').toString()
		);
	}

	closeSelector(event) {
		if (!this.contains(event.relatedTarget)) {
			this.hidePanel()
		}
	}
}

customElements.define('localization-form', LocalizationForm);

(function () {
	const initHeaderOverlay = () => {
		const main = document.getElementById("MainContent");
		const sections = main.querySelectorAll(".shopify-section");

		if (sections.length > 0) {
			const sectionFirstChild = sections[0].querySelector("[data-header-overlay]");
			const headerGroupSections = document.querySelectorAll(".shopify-section-group-header-group");
			const header = document.querySelector(".shopify-section-header");
			const breadcrumbs = document.querySelector('body > .breadcrumbs-wrapper');

			if (sectionFirstChild) {
				if (headerGroupSections[headerGroupSections.length - 1] === header) {
					sections[0].classList.add('section--has-overlay');
					sections[0].classList.remove("not-margin");
					header.classList.add('color-background-overlay');
					if (breadcrumbs) breadcrumbs.classList.add('color-background-3');
				} else {
					sections[0].classList.remove('section--has-overlay');
					sections[0].classList.add("not-margin");
					header.classList.remove('color-background-overlay');
					if (breadcrumbs) breadcrumbs.classList.remove('color-background-3');
				}
			} else {
				sections[0].classList.remove('section--has-overlay');
				header.classList.remove('color-background-overlay');
				if (breadcrumbs) breadcrumbs.classList.remove('color-background-3');
			}
		}
	};

	initHeaderOverlay();

	document.addEventListener("shopify:section:load", initHeaderOverlay);
	document.addEventListener("shopify:section:unload", initHeaderOverlay);
	document.addEventListener("shopify:section:reorder", initHeaderOverlay);
})();
