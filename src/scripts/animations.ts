import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
export function animations() {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const hero = document.querySelector('.hero h1');
    if (hero && window.scrollY < 30) {
      gsap.fromTo(hero,{clipPath:'inset(0 0 10% 0)',y:7},{clipPath:'inset(0 0 0% 0)',y:0,duration:.53,ease:'power2.out',clearProps:'clipPath,transform'});
      gsap.from('[data-hero]',{y:10,duration:.53,stagger:.07,ease:'power2.out',clearProps:'transform'});
    }
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight + 20) return;
      const headline = el.querySelector('h2');
      if (headline) gsap.from(headline,{y:12,clipPath:'inset(0 0 8% 0)',duration:.5,ease:'power2.out',clearProps:'clipPath,transform',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
    });
    gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight + 20) return;
      gsap.from(el.children,{y:14,duration:.5,stagger:.04,ease:'power2.out',clearProps:'transform',scrollTrigger:{trigger:el,start:'top 94%',once:true}});
    });
  });
  media.add({desktop:'(min-width: 761px)', mobile:'(max-width: 760px)', motion:'(prefers-reduced-motion: no-preference)'}, ctx => {
    if (!ctx.conditions?.motion) return;
    gsap.utils.toArray<HTMLElement>('.timeline-line span').forEach(line => {
      gsap.from(line,{[ctx.conditions?.desktop ? 'scaleX' : 'scaleY']:0,scrollTrigger:{trigger:line.closest('.timeline'),start:'top 89%',end:'bottom 62%',scrub:true}});
    });
  });
  media.add('(prefers-reduced-motion: no-preference) and (min-width: 1000px) and (pointer: fine)', () => {
    const lenis = new Lenis({smoothWheel:true,syncTouch:false,anchors:false,allowNestedScroll:true});
    const tick = (time: number) => lenis.raf(time*1000);
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(tick);
    if (document.querySelector('.hero')) gsap.to('.hero-image',{yPercent:4,scale:1.06,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    const disposers: (()=>void)[] = [];
    gsap.utils.toArray<HTMLElement>('[data-gallery]').forEach(el => {
      let managed = true;
      const max = () => Math.max(0,el.scrollWidth-el.clientWidth);
      const stop = () => { managed = false; };
      el.addEventListener('pointerdown',stop);
      el.addEventListener('focusin',stop);
      el.addEventListener('wheel',stop,{ passive:true });
      ScrollTrigger.create({trigger:el,start:'top 82%',end:'bottom 30%',onUpdate:self=>{
        if (managed && max()) el.scrollLeft = self.progress*max();
      }});
      disposers.push(() => {
        el.removeEventListener('pointerdown',stop);
        el.removeEventListener('focusin',stop);
        el.removeEventListener('wheel',stop);
      });
    });
    return () => { disposers.forEach(dispose=>dispose()); lenis.destroy(); gsap.ticker.remove(tick); };
  });
}
