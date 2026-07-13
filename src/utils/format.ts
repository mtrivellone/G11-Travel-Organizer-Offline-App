const MESI = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];

export const fmtDay = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getDate()}${MESI[d.getMonth()]}`;
};

export const fmtRange = (a: string, b: string): string => `${fmtDay(a)} –${fmtDay(b)}`;

export const fmtEuro = (n: number): string =>
  '€ ' + n.toLocaleString('it-IT', { maximumFractionDigits: 0 });

const GIORNI = ['dom','lun','mar','mer','gio','ven','sab'];

export const fmtWeekday = (iso: string): string => {
  const d = new Date(iso);
  return GIORNI[d.getDay()];
};