// Module-level singleton so HorizonHero can drive the GlobalBackground camera
// without React context. Both are client-side only.
export const bgCamera = {
  tx: 0,
  ty: 30,
  tz: 200,               // ambient position for non-hero pages
};
