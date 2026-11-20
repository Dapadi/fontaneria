import { navigation } from './navigation';
import { gallery } from './gallery';
import { accordion } from './accordion';
import { contact } from './contact';
import { analytics } from './analytics';

navigation();
gallery();
accordion();
contact();
analytics();

const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const loadMotion = () => {
  if (!motion.matches) return;
  const init = () => {
    if (motion.matches) void import('./animations').then(mod => mod.animations()).catch(() => {});
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(init,{timeout:650});
  else setTimeout(init,120);
};
if (document.readyState === 'complete') loadMotion();
else window.addEventListener('load',loadMotion,{once:true});
