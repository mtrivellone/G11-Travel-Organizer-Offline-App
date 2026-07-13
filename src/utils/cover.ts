// Assegna un colore (2 tonalità per il gradiente) in base alla lettera iniziale della destinazione.
const PALETTES: [string, string][] = [
  ['#2C5A52', '#9CB7A8'], // A-E · verde
  ['#3C5A7A', '#A9BFD6'], // F-J · blu
  ['#B5623A', '#E3C4A0'], // K-O · terracotta
  ['#7A5A8C', '#CDB7DA'], // P-T · viola
  ['#8A6C3E', '#D9C79E'], // U-Z · ocra
];

export function coverForDestination(destination: string): [string, string] {
  const letter = destination.trim().charAt(0).toUpperCase();
  const index = letter >= 'A' && letter <= 'Z' ? letter.charCodeAt(0) - 65 : 0;
  const bucket = Math.min(4, Math.floor(index / 5));
  return PALETTES[bucket];
}