import type { NexaiPoseId } from './nexai-library';

/** Catalogue 2 copy approved on 19 October 2026. Historical filename retained.
 * Voice/approval rules: docs/design/nexai-messages.md. Rewrites need a new review.
 */
const groups = [
  {
    id: 'welcome',
    label: 'Welkom & taken kiezen',
    pose: 'curious-1',
    note: 'Nieuwsgierig welkom: even snuffelen, een plekje zoeken, samen kiezen. Kattenhumor gaat over Nexai zelf.',
    lines: `
Psst, Adam! Welke taak gaan we ontdekken?
Hé, daar ben je! Ik schuif een pootje op.
Ik heb al even gespiekt. Welke taak kies jij?
Mijn oren staan rechtop. Wat gaan we doen?
Pootjes klaar. Welke taak kies jij?
Hmm, rekenen of taal? Jij mag kiezen.
Kies een taak. Ik kom er gezellig bij zitten.
Wat zou er in die taak zitten? Kies maar!
Hoi Adam! Waar duiken we vandaag in?
Ik zit op mijn plek. Welke taak wordt het?
Eerst even uitrekken. Zo! Wat kies jij?
Jij kiest de taak. Ik neem mijn snorharen mee.
O, taken! Welke zullen we eens bekijken?
Een plekje voor mij, een taak voor jou. Welke?
Hoi! Mijn nieuwsgierige neus is er ook.
Waar beginnen we? Ik wil wel meekijken.
Kies maar. Ik ben benieuwd wat we tegenkomen.
Mijn dutje kan wachten. Wat kies jij?
Ik kies meestal een doos. Jij een taak?
Taken kiezen met pootjes is lastig. Kies jij?
`,
  },
  {
    id: 'ready',
    label: 'Klaar voor een som',
    pose: 'calm-1',
    note: 'Tijdens een vraag, ook bij een terugkerende vraag. Geen hint, antwoord of aankondiging van een herkansing.',
    lines: `
Ik kijk mee. Neem je tijd.
Hmm, wat zou hier uitkomen?
Ik zit naast je. Reken maar.
Even kijken. Welke getallen zie je?
Ik ben benieuwd naar jouw antwoord.
Stil pootje. Jij denkt even na.
Ik zit goed. Reken op jouw tempo.
Waar begin jij? Ik kijk mee.
Jij rekent. Ik houd mijn pootjes stil.
Zullen we de som eens bekijken?
Ik wacht hier terwijl jij nadenkt.
Ik spits mijn oren. Wat komt eruit?
Uitgerekend? Laat je antwoord maar zien.
Even stil samen. Neem je tijd.
Een som om te bekijken. Jij eerst.
Ik blijf zitten. Neem rustig de tijd.
Welk getal heb jij gevonden?
Mijn plekje is naast jou. Reken maar.
Eerst even kijken. Wat vul jij in?
Alles bekeken? Dan is de som aan jou.
`,
  },
  {
    id: 'firstCorrect',
    label: 'Goed in één keer',
    pose: 'happy-2',
    note: 'Na een correct eerste antwoord. Prijs dit antwoord, zonder uitspraken over slimheid, inzet of een reeks die we niet hebben gemeten.',
    lines: `
Ja! Helemaal goed.
Goed! Pootje erbij.
Kijk, dat klopt precies.
Ja, Adam! Dat is goed.
Die klopt. Pootje erop!
Juist! Daar is je antwoord.
Meteen goed. Ha!
Ja! Die is goed gerekend.
Goed! Een knikje van mij.
O, kijk! Het klopt.
Ja hoor! Precies goed.
Gevonden! Dat klopt.
Klopt! Ik kijk weer mee.
Die heb je! Helemaal goed.
Goed gerekend. Prr!
Juist! Die vinken we af.
Dat klopt. Kopje omhoog!
Ja! Dat getal klopt.
Precies dat getal. Goed!
Goed! Daar knik ik voor.
`,
  },
  {
    id: 'firstIncorrect',
    label: 'Eerste antwoord onjuist',
    pose: 'encourage-2',
    note: 'Geen oplossing of hint. Geen verdriet, boosheid of oordeel over inzet. Verder gaan blijft direct mogelijk.',
    lines: `
Nog niet goed. Ik ga met je mee.
Dat klopt nog niet. Ik blijf hier.
Nog niet goed. Samen rustig verder.
Deze klopt nog niet. Neem je tijd.
Nog niet goed. Mijn plekje blijft naast jou.
Dat klopt nog niet. We pakken de volgende.
Nog niet juist. Ik zit naast je.
Nog niet goed. Een fout hoort erbij.
Deze klopt nog niet. Even laten liggen.
Nog niet goed, Adam. Ik kijk verder mee.
Dat is nog niet goed. Verder, op jouw tempo.
Deze klopt nog niet. We gaan samen door.
Nog niet juist. We kijken rustig verder.
Dat antwoord klopt nog niet. Ik ben erbij.
Nog niet goed. We gaan op ons gemak verder.
Dat klopt nog niet. Rustig aan, hoor.
Nog niet goed. Kies Verder als je klaar bent.
Deze klopt nog niet. Samen naar de volgende.
Nog niet goed. Ik blijf naast je zitten.
Het klopt nog niet. Verder met de volgende som.
`,
  },
  {
    id: 'retryCorrect',
    label: 'Goed bij opnieuw proberen',
    pose: 'proud-1',
    note: 'Bevestig correctheid en ga door. Geen uitleg na een correct tweede antwoord.',
    lines: `
Ja! Nu helemaal goed.
Goed! Daar is je uitkomst.
Kijk eens, nu klopt het.
Daar is hij! Helemaal goed.
Nu klopt de som. Pootje erop!
Aha! Dat antwoord klopt.
Juist! Nu is hij opgelost.
Gevonden! Dat is goed, Adam.
Ja! Nu staat het er goed.
Klopt nu! Een knikje van mij.
Deze is nu goed. Ha!
Ja, precies! Nu klopt het.
Goed! Ik kijk weer met je mee.
Nu is het goed. Pootje erbij!
Dat is juist. We kunnen door.
Goed! Deze kunnen we afronden.
Aha, nu zit je goed!
Dat is hem. Pootje erop!
Ja! De juiste uitkomst.
O, kijk! Nu is hij opgelost.
`,
  },
  {
    id: 'explanation',
    label: 'Tweede fout · uitleg bekijken',
    pose: 'curious-2',
    note: 'Na de tweede fout. Verwijs naar de echte uitleg; verzin geen oorzaak voor Adams antwoord.',
    lines: `
Nog niet goed. Zullen we de stappen bekijken?
Nog niet juist. Ik kijk mee naar de uitleg.
Hoe werkt deze som? Kijk mee naar de uitleg.
Aha, hier staan de stappen. Kijk maar mee.
Ik kom erbij zitten. Lees de uitleg rustig.
Laten we de stappen eens van dichtbij bekijken.
Nog niet goed. Kijk met mij naar de uitwerking.
Hmm, hoe zit dit? De stappen staan hieronder.
Benieuwd hoe het werkt? Bekijk de uitwerking.
Ik kijk over je schouder mee naar de uitleg.
Nog niet juist. We bekijken de stappen samen.
Eén stap tegelijk. Ik kijk hieronder met je mee.
Zullen we uitzoeken hoe deze som werkt? Kijk mee.
Kijk, de uitwerking! Waar begint de eerste stap?
Hier staan het antwoord en de stappen. Kijk mee.
Even samen kijken. Hoe gaat die eerste stap?
Nog niet goed. We nemen het voorbeeld erbij.
Ik kijk mee. Begin maar bij de eerste stap.
Ik blijf hier zitten. De uitleg staat hieronder.
Kom, we bekijken hoe je deze som kunt uitrekenen.
`,
  },
  {
    id: 'complete',
    label: 'Taak afgerond',
    pose: 'proud-2',
    note: 'Alle vragen en herhalingen zijn afgerond. Geen claim dat alles goed was of dat een gamepas is verdiend.',
    lines: `
Taak klaar! Even mijn poten strekken.
Alle vragen gedaan. Pootjes los!
Laatste som gedaan! Ik rek me even uit.
Taak af, Adam! Pootje erop.
Alle sommen gehad. Ik kijk mee naar je resultaat.
Die taak is af. Krul in mijn staart!
Zo, taak klaar! Waar is mijn kussentje?
Klaar! Zullen we kijken hoe het ging?
Hele taak gedaan. Een pootje van mij!
Taak af. Ik ben benieuwd naar je overzicht.
Rekentaak klaar. Rekkende kat ook!
Klaar! Ik kijk mee naar je overzicht.
Alle vragen gedaan. Tijd voor een rekje.
Taak afgerond! Mijn pootjes mogen los.
Taak af! Daar maak ik een sprongetje voor.
Taak klaar. Snorharen uit de rekenstand!
Alle sommen gehad. Even lekker uitrekken.
Dit rijtje is klaar. Ik strek mijn staart.
Afgevinkt! Met een denkbeeldig kattenpootje.
Taak klaar! Zullen we je resultaat bekijken?
`,
  },
  {
    id: 'perfect',
    label: 'Alles in één keer goed',
    pose: 'celebrate-2',
    note: 'Alle antwoorden waren bij de eerste poging correct. Grote vreugde zonder niveauverhoging of beloning toe te zeggen.',
    lines: `
Alles meteen goed! Pootjes in de lucht!
In één keer alles goed. Prorr, wat mooi!
Alles meteen goed! Mijn staart krult ervan.
Alle sommen meteen goed, Adam! Pootje erop!
Alles in één keer goed. Klein kattenfeest!
Alles meteen goed. Twee pootjes voor jou!
Elke som meteen goed! Daar ga ik van spinnen.
Ja! Alles direct goed. Kattenapplaus!
Alle sommen meteen goed. Snorharen vooruit!
Alles in één keer opgelost! Hoera, miauw!
Alles meteen goed! Mijn oren staan rechtop.
Een hele rij meteen goed. Pootjes omhoog!
Eerste tot laatste som meteen goed. Hoera!
Alles meteen goed. Ik maak een vreugdesprongetje!
Alles in één keer goed. Een buiging van mij!
Elke som meteen raak! Mijn pootjes klappen.
Alles meteen goed. Ik dans een kattenrondje!
Alles in één keer goed. Dat vier ik mee!
Alle sommen direct goed! Staart in een feestkrul.
Alles meteen goed! Dit katje klapt voor je.
`,
  },
  {
    id: 'support',
    label: 'Taak klaar · samen oefenen',
    pose: 'encourage-3',
    note: 'Ondersteunend afronden en Ammar om hulp vragen. Geen diagnose, oordeel of belofte over hoe snel leren gaat.',
    lines: `
Taak af. Ik kijk met jou en Ammar mee.
Zullen we met Ammar een som bekijken? Ik schuif aan.
Klaar. Welke som wil je samen met Ammar bekijken?
Taak gedaan. Vraag Ammar erbij; ik blijf hier.
Samen uitzoeken? Vraag Ammar om mee te kijken.
Eén som met Ammar bekijken? Ik kom erbij zitten.
Taak klaar. Hulp vragen mag, ik wacht hier.
Welke stap wil je Ammar laten zien? Ik kijk mee.
Roep Ammar er gerust bij. Er is plek naast ons.
Vraag Ammar om hulp. We bekijken de sommen samen.
Taak af. Met Ammar verder kijken? Ik ben erbij.
Nog sommen te oefenen. Vraag Ammar om mee te kijken.
Waar beginnen jullie? Kijk samen met Ammar.
Taak af. Ik kijk met jullie mee naar de uitleg.
Neem met Ammar één som. Ik schuif een pootje op.
Benieuwd naar een stap? Vraag Ammar om uitleg.
Ammar erbij halen? Ik blijf gezellig zitten.
Vraag maar uitleg aan Ammar. Ik kijk naast je mee.
Taak af. Zullen we de sommen met Ammar bekijken?
Samen verder puzzelen? Kies een som met Ammar.
`,
  },
  {
    id: 'guardianReview',
    label: 'Ammar moet de taak bekijken',
    pose: 'calm-2',
    note: 'Alleen wanneer de taak werkelijk op beoordeling wacht. Neutraal; de beoordeling zegt nog niets over de oorzaak.',
    lines: `
Taak af! Ammar mag nog kijken. Ik wacht hier.
Ammar moet nog kijken. Ik blijf bij de taak.
Haal Ammar bij je taak. Ik schuif een pootje op.
Ammar mag nu meekijken. Ik zit er alvast bij.
Geef Ammar een seintje. Je taak ligt klaar.
Klaar, Adam! Laat Ammar je taak eens zien.
Ammar moet nog kijken. Haal je hem erbij?
Je taak wacht op Ammar. Ik wacht gezellig mee.
Taak gedaan. Haal Ammar erbij, dan kijken we samen.
Vraag Ammar te kijken. Ik maak een plekje vrij.
Taak klaar voor Ammar. Zullen we samen kijken?
Laat Ammar je resultaat zien. Ik kijk ook mee.
Antwoorden klaar! Haal Ammar bij ons om te kijken.
Ammar moet nog beoordelen. Ik blijf hier zitten.
Er wacht een taak op Ammar. Geef hem een seintje.
Roep Ammar bij de taak. Ik zit alvast klaar.
Je taak wacht op Ammars blik. Ik blijf erbij.
Vraag Ammar bij dit scherm. Ik kijk met jullie mee.
Vragen klaar! Nu Ammar nog. Ik wacht met je mee.
Je taak ligt klaar. Laat je Ammar even meekijken?
`,
  },
  {
    id: 'effortConcern',
    label: 'Stevig aanspreken · aandacht',
    pose: 'angry-1',
    note: 'Losse voorstellen voor de gewenste boze Nexai. Activeringsregels zijn nog niet bepaald. Geen bewering dat Nexai Adams gedachten of inzet kent.',
    lines: `
Hé, even terug naar de som. Ik kijk mee.
Adam, lees eerst de hele vraag. Ik wacht hier.
Even stoppen. Wat vraagt de som? We kijken samen.
Terug naar je taak. Eén vraag, ik blijf erbij.
Eerst lezen, dan rekenen. Ik houd mijn pootjes stil.
Wacht even. Bekijk je antwoord voor je doorgaat.
Hmm, wat wordt er gevraagd? Lees de som nog eens.
Rustig aan, Adam. Ik loop niet weg.
Kom, we pakken de vraag er rustig weer bij.
Eerst de hele vraag bekijken. Ik kijk naast je mee.
Deze som eerst. Ik blijf rustig zitten.
Hé, terug naar de taak. Ik ben erbij.
Eerst uitrekenen. Ik wacht met mijn pootjes stil.
Even samen kijken? Vraag Ammar erbij als je wilt.
Mijn oren zijn erbij. Lees de hele vraag rustig.
Adam, bekijk eerst de som. Reken op je gemak.
Even stilstaan. Waar begin je bij deze vraag?
Lezen, rekenen, antwoorden. Eén ding tegelijk.
Vraag Ammar hoe je verder kunt. Ik blijf erbij.
Hé, één vraag tegelijk. Ik kijk met je mee.
`,
  },
  {
    id: 'overdueBlock',
    label: 'Gepland oefenblok nog open',
    pose: 'angry-2',
    note: 'Voorstellen voor daadwerkelijk openstaand gepland werk. Gemist werk bewijst geen onwil. Planning, uitzonderingen en activering worden later ontworpen.',
    lines: `
Dit blok staat nog open. Ammar erbij? Ik kijk mee.
Nog een blok gepland. Kies met Ammar een moment.
Hé Adam, dit blok is nog open. Zullen we kijken?
Nog taken open. Overleg met Ammar; ik schuif aan.
Daar staat nog een blok. Wanneer past het met Ammar?
Nog een blok open. Vraag Ammar wat nu past.
Dit blok is nog niet klaar. Ik kijk mee naar je taken.
Even samen kijken: er staat nog een oefenblok open.
Hé, nog een blok open. Neem de planning mee naar Ammar.
Dit blok wacht nog. Ik kijk met je mee.
Nog een blok open. Hoe past dat in jullie planning?
Taken nog open. Kies met Ammar een rustig moment.
Dit blok is blijven liggen. Kijk met Ammar wat past.
Ik zie nog een open blok. Bekijk je taken maar.
Dit blok staat nog open. Wat spreken jullie af?
Adam, dit blok is nog niet af. Samen de planning zien?
Nog een open blok. Vraag Ammar erbij; ik blijf hier.
Er wacht nog een blok. Vraag Ammar wanneer het past.
Dit blok is nog open. Samen met Ammar uitzoeken?
Nog taken open. Ik kijk met jou en Ammar mee.
`,
  },
] as const satisfies readonly {
  id: string;
  label: string;
  pose: NexaiPoseId;
  note: string;
  lines: string;
}[];

export const messageCategories = groups.map(({ lines, ...category }) => ({
  ...category,
  messages: lines
    .trim()
    .split('\n')
    .map((text, index) => ({
      id: `${category.id}-${String(index + 1).padStart(2, '0')}`,
      category: category.id,
      text,
      pose: category.pose,
    })),
}));
export const messageCandidates = messageCategories.flatMap(
  (group) => group.messages,
);
export const messageCatalogueVersion = 'nexai-messages-v2';
