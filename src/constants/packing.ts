export const packingTemplates: Record<string, Record<string, string[]>> = {
  base: {
    Documenti: ["Documento d'identità", 'Carta di credito', 'Assicurazione'],
    Valigia: ['Cambi di vestiti', 'Necessaire', 'Scarpe comode'],
    Elettronica: ['Caricatore', 'Power bank'],
  },
  culturale: { Valigia: ['Outfit elegante', 'Borsa antifurto'], Documenti: ['Biglietti musei'] },
  citta: { Valigia: ['Scarpe comode', 'Ombrello pieghevole'] },
  roadtrip: { Auto: ['Patente', 'Navigatore offline', 'Snack'] },
  mare: { Valigia: ['Costume', 'Crema solare', 'Telo mare'] },
  montagna: { Valigia: ['Giacca a vento', 'Scarponcini', 'Borraccia'] },
  avventura: { Valigia: ['Zaino tecnico', 'Kit primo soccorso'] },
};