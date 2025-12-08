// Helper to wait a bit
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const ScrollTests = {
    
    // 1. Basic scrollTo (Instant)
    async windowScrollTo(container) {
        // Reset
        container.scrollTop = 0;
        await wait(100);
        
        // Scroll to bottom
        container.scrollTo(0, container.scrollHeight);
        await wait(200);
        
        // Scroll back to top
        container.scrollTo(0, 0);
        
        return true;
    },

    // 2. scrollTo with behavior: smooth
    async windowScrollToSmooth(container) {
        container.scrollTop = 0;
        await wait(100);

        // We need to wrap smooth scroll in a promise that resolves when scroll stops
        // Since there is no native 'scrollend' event universally supported reliably in all contexts without polyfill,
        // we will just wait a fixed time that should cover the animation.
        
        container.scrollTo({ top: 500, behavior: 'smooth' });
        await wait(1000); // Smooth scroll takes time

        container.scrollTo({ top: 0, behavior: 'smooth' });
        await wait(1000);
        
        return true;
    },

    // 3. element.scrollIntoView (Instant)
    async scrollIntoView(container) {
        const target = container.querySelector('#scroll-target');
        const start = container.querySelector('.marker.start');
        
        container.scrollTop = 0;
        await wait(100);
        
        target.scrollIntoView(true); // alignToTop = true
        await wait(200);
        
        start.scrollIntoView(true);
        
        return true;
    },

    // 4. element.scrollIntoView (Smooth)
    async scrollIntoViewSmooth(container) {
        const target = container.querySelector('#scroll-target');
        const start = container.querySelector('.marker.start');
        
        container.scrollTop = 0;
        await wait(100);
        
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await wait(1000);
        
        start.scrollIntoView({ behavior: 'smooth', block: 'start' });
        await wait(1000);
        
        return true;
    },

    // 5. Direct scrollTop assignment stress
    async scrollTopSet(container) {
        // Rapidly setting scrollTop can sometimes cause layout thrashing
        for (let i = 0; i < 50; i++) {
            container.scrollTop = Math.random() * container.scrollHeight;
            // Force layout recalc
            const h = container.clientHeight; 
        }
        
        container.scrollTop = 0;
        return true;
    },

    // 6. scrollBy loop
    async scrollByLoop(container) {
        container.scrollTop = 0;
        await wait(100);
        
        const steps = 20;
        for(let i=0; i<steps; i++) {
            container.scrollBy(0, 50);
            await wait(20);
        }
        
        return true;
    },

    // 7. RAF Custom Scroll (Physics simulation style)
    async rafScroll(container) {
        container.scrollTop = 0;
        await wait(100);
        
        return new Promise((resolve) => {
            let velocity = 50;
            const friction = 0.95;
            
            function step() {
                container.scrollTop += velocity;
                velocity *= friction;
                
                if (Math.abs(velocity) > 0.5 && container.scrollTop < container.scrollHeight) {
                    requestAnimationFrame(step);
                } else {
                    resolve(true);
                }
            }
            requestAnimationFrame(step);
        });
    },
    
    // 8. CSS Scroll Snap Test
    async scrollSnap(container) {
        // Temporarily add snap classes
        container.style.scrollSnapType = 'y mandatory';
        const children = container.children;
        const originalStyles = [];
        
        Array.from(children).forEach(child => {
            originalStyles.push(child.style.scrollSnapAlign);
            child.style.scrollSnapAlign = 'start';
        });

        container.scrollTop = 0;
        await wait(100);

        // Scroll to a point and let it snap
        container.scrollBy(0, 50); // Just enough to trigger snap to next
        await wait(600);
        
        container.scrollBy(0, 500);
        await wait(600);

        // Cleanup
        container.style.scrollSnapType = '';
        Array.from(children).forEach((child, i) => {
            child.style.scrollSnapAlign = originalStyles[i] || '';
        });

        return true;
    }
};