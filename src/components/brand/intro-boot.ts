/**
 * Runs inline before first paint (rendered as a <script> in the landing page). Opts the page
 * into the intro only when motion is allowed and it hasn't played this session; otherwise the
 * SSR hero shows as-is. Failsafe: if the client component never claims the intro within 4s
 * (slow or broken JS), the overlay is released.
 */
const KEY = "nb-intro";

export const INTRO_BOOT = `(function(){try{var d=document.documentElement;if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;try{if(sessionStorage.getItem('${KEY}'))return;sessionStorage.setItem('${KEY}','1')}catch(e){}d.setAttribute('data-intro','play');setTimeout(function(){if(!window.__nbIntro&&d.getAttribute('data-intro')==='play')d.setAttribute('data-intro','done')},4000)}catch(e){}})();`;

