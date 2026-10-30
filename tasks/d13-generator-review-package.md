# D13 generated exercises: pending human review

All 32 generation attempts are listed. These are original synthetic outputs. Mechanical results, Haiku findings and post-run AI inspection are separate from independent human approval. No corrections have been applied. One truncated output is unresolved; no review call was made for it.

[Comparison and limits](../docs/engineering/d13-generator-benchmark.md) · [Separate inspection metadata](d13-generator-analysis.json)

## claude-sonnet-5-5 · t01 · taal

Human approval: pending. Haiku: flagged. Same-model review: False.

Content hash: `ae132eb82af1dffdd0f0d6b2413977253136a510840a6d7775d4b70dae9206b1`

```text
objective:
Een synoniem van dapper in een eenvoudige zin herkennen.

prompt:
Lees de zin: 'De dapper brandweerman ging het huis in om de kat te redden.' Welk woord betekent ongeveer hetzelfde als dapper?

passage:


options:
lui
moedig
stil
bang

rubric:
Kies precies één optie. Het juiste antwoord is het woord dat ongeveer hetzelfde betekent als dapper. Geef de gekozen optie als antwoord.

answer:
moedig

explanation:
Dapper en moedig betekenen ongeveer hetzelfde: iemand durft iets gevaarlijks te doen. Bang, lui en stil hebben een andere betekenis.

```

Mechanical checks: no findings; passage words: 0.

- Haiku blocking / grammar: Na het lidwoord 'De' hoort de attributieve vorm 'dappere' te staan; 'dapper' is hier een ongrammaticale vorm.
- Separate inspection (proposed-correction): The adjective should be dappere after De in this noun phrase. Haiku also flagged this grammar defect.

## claude-sonnet-5-5 · t02 · taal

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `09b92c33dbabfa263915ae3189915d14b9c5a99de16e68d3a4e6f17ebf54fc04`

```text
objective:
Het tegengestelde van vol in een alledaagse context herkennen.

prompt:
Lisa heeft een emmer vol water gehaald om de bloemen te geven. Ze giet al het water over de planten. Daarna is de emmer niet meer vol. Welk woord is het tegengestelde van vol?

passage:


options:
zwaar
leeg
groot
rond

rubric:
Kies de ene juiste optie. Geef 1 punt als de leerling 'leeg' kiest, anders 0 punten.

answer:
leeg

explanation:
Het tegengestelde van vol is leeg. Als er niets meer in de emmer zit, is hij leeg. Zwaar, groot en rond zijn geen tegengestelden van vol.”}</br>

```

Mechanical checks: no findings; passage words: 0.

- Separate inspection (objectively-observed-format-defect): Stray quote/brace/markup is included as exercise explanation text; it needs removal in a new candidate version. Haiku returned clear.

## claude-sonnet-5-5 · s01 · spelling

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `42108b8647e0ff1cb0172f9687d4b73fcaa34b6f5413d9b87c7d72552f2c89bb`

```text
objective:
De tegenwoordige tijd van hebben bij hij kiezen.

prompt:
Welke vorm van het werkwoord hebben moet je invullen in deze zin? Kies de juiste vorm: Hij ___ vandaag een nieuwe fiets gekregen van zijn oma.

passage:


options:
heeft
hebben

rubric:
Kies de optie die bij hij past in de tegenwoordige tijd. Er is precies één juist antwoord. Antwoord door één optie te kiezen.

answer:
heeft

explanation:
Bij hij gebruik je in de tegenwoordige tijd de vorm heeft: hij heeft. De vorm hebben hoort bij wij, jullie en zij (meervoud).

```

Mechanical checks: no findings; passage words: 0.

## claude-sonnet-5-5 · s02 · spelling

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `cbcb1bb75d19029ac068ae131f0366d56dec3753cc91b943a76c1886bfe54263`

```text
objective:
Het meervoud van boom correct spellen.

prompt:
In het park staan veel grote groene ... . Welk woord past in de zin en is goed gespeld?

passage:


options:
bomen
boomen

rubric:
Kies één van de twee opties. Je krijgt 1 punt als je de juiste spelling van het meervoud van boom kiest. Bij een verkeerde of geen keuze krijg je 0 punten.

answer:
bomen

explanation:
Het woord boom heeft een lange klank: oo. Als je er -en aan toevoegt, wordt het woord in twee lettergrepen verdeeld: bo-men. In een open lettergreep schrijf je de lange klank met één o. Dus: bomen.

```

Mechanical checks: no findings; passage words: 0.

## claude-sonnet-5-5 · w01 · word-problems

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `a92deda428c1616d016ce1c2550a7b6f975cde6e369b49f462b3087f05e794f2`

```text
objective:
Het totaal van gelijke groepen met vermenigvuldiging berekenen.

prompt:
Sam heeft vier zakjes met knikkers. In elk zakje zitten 6 knikkers. Hoeveel knikkers heeft Sam in totaal?

passage:


options:


rubric:
Geef alleen het aantal knikkers als getal.

answer:
24

explanation:
Er zijn 4 zakjes met elk 6 knikkers. Je rekent 4 × 6 = 24. Sam heeft 24 knikkers.

```

Mechanical checks: no findings; passage words: 0.

## claude-sonnet-5-5 · w02 · word-problems

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `5fcf4a41c359e502c7899bc2764e694145f6952f4d4dbda7e98e317883f031cd`

```text
objective:
Wisselgeld na twee aankopen berekenen.

prompt:
Sam gaat naar de boekwinkel. Hij koopt een boek van 7 euro en een schrift van 5 euro. Hij betaalt met een biljet van 20 euro. Hoeveel euro krijgt Sam terug?

passage:


options:


rubric:
Het antwoord is goed als het getal 8 genoemd wordt samen met het woord euro (bijvoorbeeld '8 euro'). Een antwoord zonder euro of met een ander bedrag is fout.

answer:
8 euro

explanation:
Eerst tel je op wat Sam uitgeeft: 7 + 5 = 12 euro. Dan trek je dat af van wat hij betaalt: 20 - 12 = 8 euro. Sam krijgt dus 8 euro terug.

```

Mechanical checks: no findings; passage words: 0.

- Separate inspection (conditional-learner-instruction-exposure): This rubric supplies the correct amount. It would reveal the answer if displayed as learner response instructions. The non-reading brief did not explicitly distinguish learner instructions from private marking guidance, so this is also a benchmark contract limitation, not an unconditional model-error claim.

## claude-sonnet-5-5 · r01 · reading

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `0089602913c9f724d7c3156aa97637089db2c279ac7171137548895a3f1722f5`

```text
objective:
Een expliciet genoemde dag terugvinden in een verhaal.

prompt:
Op welke dag gaat Noor met haar klas naar de moestuin?

passage:
Noor zit in groep 5. Op maandag vertelt juf Sanne iets spannends. De klas gaat een moestuin bezoeken! Noor kan bijna niet wachten. Ze vraagt of ze laarzen mee moet nemen. 'Ja, want de grond kan nat zijn,' zegt de juf. Op dinsdag oefent de klas vragen die ze kunnen stellen aan de tuinman. Noor schrijft op: 'Hoe groeien wortels?' Eindelijk is het woensdag. Het bezoek aan de moestuin is vandaag. Met de fiets gaan ze naar de rand van het dorp. Daar wacht meneer Bram bij het hek. Hij laat rijen sla, bonen en pompoenen zien. Noor mag een radijs uit de grond trekken. Ze ruikt aan de aarde en lacht. 'Deze is nog warm van de zon,' zegt ze. Aan het eind krijgt iedereen een klein zakje zaadjes mee. Op donderdag wil Noor ze meteen planten in een pot op de vensterbank. Ze hoopt dat er snel een groen blaadje boven komt.

options:


rubric:
Geef 1 punt als de leerling de juiste dag schrijft. Andere dagen zijn fout. Hoofdletters en spelling van de dagnaam zijn niet belangrijk als de dag duidelijk te herkennen is.

answer:
woensdag

explanation:
In de tekst staat letterlijk: "Eindelijk is het woensdag. Het bezoek aan de moestuin is vandaag." Maandag, dinsdag en donderdag zijn andere activiteiten.

```

Mechanical checks: no findings; passage words: 154.

## claude-sonnet-5-5 · r02 · reading

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `affb04010dc5713105f0365a3b1892119305126150fea8df18dc2a2e2d237aca`

```text
objective:
Een expliciet genoemde oorzaak van een routewijziging begrijpen.

prompt:
Waarom maakt de klas van juf Marit een omweg naar de bibliotheek?

passage:
Op donderdagochtend ging groep 5 van juf Marit naar de bibliotheek. Iedereen had zijn leesboek in de rugzak gedaan en de bibliotheekpasjes zaten veilig in een zakje. De zon scheen en er stond bijna geen wind. Normaal liep de klas over de oude brug bij de vijver, want dat was de kortste weg. Maar toen ze bij de brug kwamen, stond er een groot hek voor. Een man in een oranje jas stond naast een kar met planken. 'Sorry, kinderen,' zei hij. 'De brug wordt gerepareerd. Niemand mag er nu overheen.' Juf Marit knikte. 'Dan nemen we de weg langs het park,' zei ze. Samen liepen ze langs de bakkerij en het speelveld. Daan telde onderweg zeven fietsen en Lotte zag een eend met kleine kuikens. Het duurde tien minuten langer dan anders, maar niemand klaagde. Bij de bibliotheek wachtte mevrouw Aydin al bij de deur. Ze liet de kinderen de nieuwe stripboeken zien. Daan koos een boek over een draak en Lotte nam een boek over paarden mee terug naar school.

options:


rubric:
Geef 1 punt als het antwoord vermeldt dat de brug wordt gerepareerd (of dat de brug dicht is vanwege herstelwerk). Geen punt voor antwoorden over het weer, de tijd of andere oorzaken.

answer:
Omdat de brug wordt gerepareerd.

explanation:
De tekst noemt de oorzaak expliciet: "De brug wordt gerepareerd." Daarom mag niemand er overheen en loopt de klas om.

```

Mechanical checks: passage-word-count-outside-brief; passage words: 172.

- Separate inspection (objectively-observed-brief-violation): The reading brief explicitly forbids putting the answer in rubric, but this text supplies the bridge-repair reason. Haiku returned clear. A future schema should distinguish learner instructions from private grading guidance.
- Separate inspection (objectively-observed-length-violation): Passage has 172 whitespace-delimited words; the frozen brief requires 120–160. Haiku returned clear; the mechanical check caught this.

## gemini-3.8-flash · t01 · taal

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `5256956f9b37a747a0b02b9037ff015740f2dbd0338609686ddedb4cb8ddc87d`

```text
objective:
Een synoniem van dapper in een eenvoudige zin herkennen.

prompt:
Lees de zin:
De brandweerman klom op het hoge dak om de kat te redden; wat was hij dapper!

Welk woord betekent ongeveer hetzelfde als 'dapper'?

passage:


options:
stil
moedig
lui
bang

rubric:
Kies het juiste antwoord uit de vier keuzes.

answer:
moedig

explanation:
'Dapper' en 'moedig' betekenen allebei dat je niet bang bent om iets moeilijks of gevaarlijks te doen.

```

Mechanical checks: no findings; passage words: 0.

## gemini-3.8-flash · t02 · taal

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `80707a2ae5a6fa572d4ed8a3267dd5a93423b79c2ad0165f152845dcb578dd1e`

```text
objective:
Het tegengestelde van vol in een alledaagse context herkennen.

prompt:
De prullenbak op school zit helemaal vol met papier. Wat is het tegengestelde van vol?

passage:


options:
rond
leeg
groot
zwaar

rubric:
Kies het juiste antwoord uit de vier keuzes.

answer:
leeg

explanation:
Het tegenovergestelde van vol is leeg. Als een prullenbak niet vol is, kan er niets meer in zitten en is hij leeg.

```

Mechanical checks: no findings; passage words: 0.

- Separate inspection (proposed-correction): Not full does not entail empty; a partly filled bin is a counterexample. This explanatory wording is misleading. Haiku returned clear.

## gemini-3.8-flash · s01 · spelling

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `7a54df49ce7d2d96085f895975878ae9cfaf0b555592b9814eff8943d505103b`

```text
objective:
De tegenwoordige tijd van hebben bij hij kiezen.

prompt:
Welk woord moet op de open plek staan?

Hij ... vandaag een nieuwe fiets gekregen.

passage:


options:
heeft
hebben

rubric:
Kies het juiste antwoord uit de twee opties.

answer:
heeft

explanation:
Het onderwerp in de zin is 'hij'. Bij 'hij' hoort in de tegenwoordige tijd de persoonsvorm 'heeft'.

```

Mechanical checks: no findings; passage words: 0.

## gemini-3.8-flash · s02 · spelling

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `db6dc83dad48ec28dd6f8edbacc4772a272771aff2d92e1a4ada6e24cf5d7b39`

```text
objective:
Het meervoud van boom correct spellen.

prompt:
In het park staan veel hoge ...

Welk woord is goed gespeld?

passage:


options:
bomen
boomen

rubric:
Kies het juiste antwoord uit de twee opties.

answer:
bomen

explanation:
Bij het meervoud van boom klinkt de /oo/ als een lange klank aan het einde van een klankgroep (bo-men). Je schrijft dan één klinker: bomen.

```

Mechanical checks: no findings; passage words: 0.

## gemini-3.8-flash · w01 · word-problems

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `e8d8b5cd17a8af9cb163bffd97eecdd45a769765a7951f49ac2111fc1b22dbe7`

```text
objective:
Het totaal van gelijke groepen met vermenigvuldiging berekenen.

prompt:
Sem heeft 4 zakjes met knikkers. In elk zakje zitten precies 6 knikkers. Hoeveel knikkers heeft Sem in totaal?

passage:


options:


rubric:
Geef alleen het getal als antwoord.

answer:
24

explanation:
Er zijn 4 zakjes met elk 6 knikkers, dus de vermenigvuldiging is 4 x 6 = 24.

```

Mechanical checks: no findings; passage words: 0.

## gemini-3.8-flash · w02 · word-problems

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `6805b6a61b35222974d20b915cf4a2d7155f8d5a11d63c581979848a03758d8c`

```text
objective:
Wisselgeld na twee aankopen berekenen.

prompt:
Samira staat in de boekwinkel en koopt een leesboek van 7 euro en een schrift van 5 euro. Ze betaalt bij de kassa met een briefje van 20 euro. Hoeveel euro krijgt Samira terug?

passage:


options:


rubric:
Schrijf het antwoord op als een getal gevolgd door 'euro' (bijvoorbeeld: 8 euro).

answer:
8 euro

explanation:
Eerst tel je de kosten bij elkaar op: 7 euro + 5 euro = 12 euro. Daarna trek je dit bedrag af van het betaalde geld: 20 euro - 12 euro = 8 euro. Samira krijgt dus 8 euro terug.

```

Mechanical checks: no findings; passage words: 0.

- Separate inspection (conditional-learner-instruction-exposure): This rubric supplies the correct amount. It would reveal the answer if displayed as learner response instructions. The non-reading brief did not explicitly distinguish learner instructions from private marking guidance, so this is also a benchmark contract limitation, not an unconditional model-error claim.

## gemini-3.8-flash · r01 · reading

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `0cc961a53ecaa0dd3e6a9083d6c56b3ee5490aad71dc4c7263bd6af83c10d5cd`

```text
objective:
Een expliciet genoemde dag terugvinden in een verhaal.

prompt:
Op welke dag bezoekt de klas van Noor de moestuin?

passage:
Maandag vertelde meester Daan al over het grote schoolreisje van deze week. De kinderen van groep 5 mochten namelijk naar de grote moestuin aan de rand van het dorp. Dinsdag maakten ze in tweetallen tekeningen van verschillende soorten groenten, zoals wortels, radijsjes en kroppen sla. Op woensdag was het eindelijk zover en fietste de hele klas naar de tuin toe. Tuinman Bram stond hen al op te wachten bij het hek met een grote gieter in zijn hand. Noor mocht meteen helpen om rijpe aardbeien te plukken. Ze stopte er stiekem eentje in haar mond en die smaakte heerlijk zoet. Daarna kregen alle kinderen een schepje om onkruid weg te halen rond de bonenplanten. Donderdag zouden ze in de klas soep gaan koken van de verse oogst, maar deze zonnige middag tussen de planten was nu al onvergetelijk.

options:


rubric:
Geef de juiste dag van de week waarop het bezoek plaatsvindt.

answer:
woensdag

explanation:
In de tekst staat letterlijk: 'Op woensdag was het eindelijk zover en fietste de hele klas naar de tuin toe.'

```

Mechanical checks: no findings; passage words: 138.

## gemini-3.8-flash · r02 · reading

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `ac0a6508a22a96053d332d923ad0b8246aeb67eb002cfea940a61a9cd83095ff`

```text
objective:
Een expliciet genoemde oorzaak van een routewijziging begrijpen.

prompt:
Waarom moet de klas een omweg maken naar de bibliotheek?

passage:
Vandaag gaat groep 5 naar de grote bibliotheek in het centrum. Meester Frank controleert of iedereen zijn bibliotheekpas bij zich heeft. Buiten schijnt de zon en er staat een zachte lentewind. Het is heerlijk wandelweer. De kinderen lopen netjes in een lange rij over het trottoir. Meestal steken ze bij het park meteen het water over om er snel te zijn. Maar als ze dichterbij komen, zien ze overal rood-witte linten en waarschuwingsborden. De oude houten brug wordt gerepareerd door twee werkmannen in oranje hesjes. Een van de planken is namelijk losgeraakt. 'We moeten vandaag omlopen langs de molen,' zegt meester Frank vrolijk. Tim en Sofie vinden het helemaal niet erg. Door de extra route komen ze langs de dierenweide waar net drie lammetjes zijn geboren. Na een kwartier lopen zijn ze toch nog op tijd bij de bibliotheek.

options:


rubric:
Beoordeel of de leerling als reden noemt dat de brug gerepareerd of gemaakt wordt.

answer:
Omdat de brug wordt gerepareerd.

explanation:
In de tekst staat letterlijk: "De oude houten brug wordt gerepareerd door twee werkmannen in oranje hesjes."

```

Mechanical checks: no findings; passage words: 139.

- Separate inspection (objectively-observed-brief-violation): The reading brief explicitly forbids putting the answer in rubric, but this text supplies the bridge-repair reason. Haiku returned clear. A future schema should distinguish learner instructions from private grading guidance.

## claude-haiku-5-5 · t01 · taal

Human approval: pending. Haiku: clear. Same-model review: True.

Content hash: `c4d60ffc74eace4df70bd94b730ad96a369151d7a8833501f8aa3334c9a3c887`

```text
objective:
Een synoniem van dapper in een eenvoudige zin herkennen.

prompt:
Welk woord betekent ongeveer hetzelfde als dapper? De ridder liep dapper naar de draak toe. Kies het juiste woord.

passage:


options:
bang
lui
moedig
stil

rubric:
1 punt voor het kiezen van het juiste synoniem; 0 punten voor een ander woord.

answer:
moedig

explanation:
Dapper en moedig betekenen ongeveer hetzelfde: iemand die niet bang is om gevaarlijke dingen te doen. Bang, lui en stil betekenen juist iets anders.

```

Mechanical checks: no findings; passage words: 0.

## claude-haiku-5-5 · t02 · taal

Human approval: pending. Haiku: flagged. Same-model review: True.

Content hash: `bb81d95561292c2f48be7908a181e21120ae554bd69d3bd4eb373a8cb9fe6bff`

```text
objective:
Het tegengestelde van vol in een alledaagse context herkennen.

prompt:
Mila heeft een beker die helemaal vol water zit. Ze wil de beker omdraaien om te zien wat er gebeurt. Wat is het tegengestelde van vol?

passage:


options:
rond
zwaar
groot
leeg

rubric:
Kies het ene woord dat het tegengestelde van vol is. Lees de vraag goed en kies één antwoord.

answer:
leeg

explanation:
Het tegengestelde van vol is leeg. Een beker die vol is zit helemaal onder water of drinken; een lege beker heeft niets erin.</br>

```

Mechanical checks: no findings; passage words: 0.

- Haiku attention / explanation-error: The explanation's description of a full cup is inaccurate and confusing; being full does not mean being completely underwater or being drunk from. The key 'leeg' itself is correct.
- Separate inspection (proposed-correction): A full cup is not necessarily submerged. Haiku flagged this explanation at attention severity.
- Separate inspection (objectively-observed-format-defect): Stray markup remains in the explanation.

## claude-haiku-5-5 · s01 · spelling

Human approval: pending. Haiku: clear. Same-model review: True.

Content hash: `84c283613c9beb1777a65f1150d8a24f6478bc23e40ab9bc48abd7a733c0732e`

```text
objective:
De tegenwoordige tijd van hebben bij hij kiezen.

prompt:
Welke vorm van hebben past in de zin? Kies het juiste woord.

passage:


options:
heeft
hebben

rubric:
Correct als het juiste woord wordt gekozen: bij het onderwerp 'hij' in de tegenwoordige tijd is de vorm 'heeft'. Eén punt voor het juiste antwoord, nul punten voor het foute antwoord.

answer:
heeft

explanation:
Bij 'hij' (een enkelvoudig onderwerp) hoort in de tegenwoordige tijd de vorm 'heeft'. 'Hebben' is de meervoudsvorm en past bij 'zij' of 'wij'. Dus: Hij ___ een rode fiets.

```

Mechanical checks: no findings; passage words: 0.

- Separate inspection (objectively-observed-brief-violation): The required new sentence with hij and a blank is absent from prompt; it appears only in the explanation. The target form cannot be chosen from the learner question as requested. Haiku returned clear.

## claude-haiku-5-5 · s02 · spelling

Human approval: pending. Haiku: clear. Same-model review: True.

Content hash: `db1d4315e94343f50ccc50728f51647a3b5c920184d08ab1c397a9142754e55b`

```text
objective:
Het meervoud van boom correct spellen.

prompt:
Welk woord is het correcte meervoud van boom? Kies het juiste woord in de zin: In het park staan veel mooie ___.

passage:


options:
bomen
boomen

rubric:
Kies één optie. Het juiste antwoord is het enkele correct gespelde woord; de andere optie is fout gespeld.

answer:
bomen

explanation:
Het meervoud van boom is bomen. In het Nederlands wordt de lange klinker oo in een open lettergreep geschreven als enkele o, dus boom wordt bomen en niet boomen.

```

Mechanical checks: no findings; passage words: 0.

## claude-haiku-5-5 · w01 · word-problems

Human approval: pending. Haiku: clear. Same-model review: True.

Content hash: `ceb4bf3f2197e542bb2e5616df3c93a3b2a068548730cbb5aadcb0617836df25`

```text
objective:
Het totaal van gelijke groepen met vermenigvuldiging berekenen.

prompt:
Sanne heeft een verjaardagsfeestje en wil de knikkers eerlijk verdelen. Ze maakt 4 zakjes klaar en doet in elk zakje 6 knikkers. Hoeveel knikkers heeft Sanne in totaal klaarliggen?

passage:


options:


rubric:
Geef alleen het aantal knikkers als getal. Er zijn geen opties. Het goede antwoord is een geheel getal; schrijf geen eenheid of toelichting in het antwoordveld.

answer:
24

explanation:
Er zijn 4 zakjes met elk 6 knikkers. Dat is een vermenigvuldiging: 4 × 6 = 24. Sanne heeft dus 24 knikkers klaarliggen.

```

Mechanical checks: no findings; passage words: 0.

## claude-haiku-5-5 · w02 · word-problems

Human approval: pending. Haiku: clear. Same-model review: True.

Content hash: `c7538fe83d1a53955b2609435681ddb1312f890bf493c30f72df42e55d1fd53f`

```text
objective:
Wisselgeld na twee aankopen berekenen.

prompt:
Mila gaat naar de winkel om spullen voor school te kopen. Ze wil een boek kopen dat 7 euro kost en een schrift dat 5 euro kost. Ze betaalt met een biljet van 20 euro. Hoeveel euro krijgt Mila terug van de kassamedewerker?

passage:


options:


rubric:
Het antwoord is correct als de leerling het exacte bedrag aan wisselgeld in euro's geeft (8 euro). Een antwoord zonder de eenheid euro is niet volledig.

answer:
8 euro

explanation:
Stap 1: het boek en het schrift kosten samen 7 + 5 = 12 euro. Stap 2: van het biljet van 20 euro gaat 20 − 12 = 8 euro terug. Mila krijgt dus 8 euro terug.</explanation>

```

Mechanical checks: no findings; passage words: 0.

- Separate inspection (objectively-observed-format-defect): Stray markup remains in the explanation. Haiku returned clear.
- Separate inspection (conditional-learner-instruction-exposure): This rubric supplies the correct amount. It would reveal the answer if displayed as learner response instructions. The non-reading brief did not explicitly distinguish learner instructions from private marking guidance, so this is also a benchmark contract limitation, not an unconditional model-error claim.

## claude-haiku-5-5 · r01 · reading

Human approval: pending. Haiku: unresolved/not dispatched. Same-model review: True.

No complete parseable candidate; generation hit the output limit. Cost remains included.

## claude-haiku-5-5 · r02 · reading

Human approval: pending. Haiku: clear. Same-model review: True.

Content hash: `495606cb667f65a10ed36943a91980d4378fde865c7e9d12f87f00a8ab773e40`

```text
objective:
Een expliciet genoemde oorzaak van een routewijziging begrijpen.

prompt:
Waarom maakt de klas een omweg naar de bibliotheek?

passage:
Op dinsdagochtend stond de klas van meester Jansen klaar om naar de bibliotheek te lopen. Iedereen had een tas met boeken en een schrift mee. Normaal gingen ze altijd over de oude brug bij de molen, want dat was de kortste weg. Maar deze week was die brug afgesloten met oranje hekken. Er stond een bordje met de tekst: wegens reparatie gesloten. Mees Bakker keek over de hekken en zei: 'Dan moeten we helemaal om het park heen.' Meester Jansen knikte. 'Dat duurt een kwartiertje langer, maar we komen er wel. Iedereen blijft bij elkaar.' Ze liepen langs de vijver, waar de eenden in de zon zwommen. Sanne vond het leuk om een andere route te nemen. Ze zag een eekhoorn die over een tak klom. Na het park liepen ze langs de school van de kleuters en staken ze de straat over bij het zebrapad. Bij de bibliotheek aangekomen zetten de kinderen hun tassen neer en pakten ze meteen de stapel boeken die ze die week mochten uitzoeken. Sommigen wilden een dik boek over dinosaurussen, anderen kozen een spannend verhaal over een geheime kamer. Meester Jansen lachte en zei dat het goed was dat ze even een andere kant op waren gegaan, want zo hadden ze meer gezien dan ze van plan waren.

options:


rubric:
Open vraag: beoordeel of het antwoord de expliciete reden noemt, namelijk dat de brug wordt gerepareerd (afgesloten voor reparatie). Het weer is niet de reden. Antwoord is correct als de brug/reparatie genoemd wordt.

answer:
Omdat de brug bij de molen wordt gerepareerd en daarom is afgesloten.

explanation:
Letterlijk citaat uit de tekst: "Maar deze week was die brug afgesloten met oranje hekken. Er stond een bordje met de tekst: wegens reparatie gesloten." Dit bewijst dat de reparatie van de brug de reden is voor de omweg.

```

Mechanical checks: answer-does-not-match-independent-reference, passage-word-count-outside-brief; passage words: 214.

- Separate inspection (objectively-observed-brief-violation): The reading brief explicitly forbids putting the answer in rubric, but this text supplies the bridge-repair reason. Haiku returned clear. A future schema should distinguish learner instructions from private grading guidance.
- Separate inspection (objectively-observed-length-violation): Passage has 214 whitespace-delimited words; the frozen brief requires 120–160. Haiku returned clear; the mechanical check caught this.
- Separate inspection (verified-answer-equivalence): This longer sentence correctly names bridge repairs, as supported by the stored passage. It is outside the frozen exact variants but is not a wrong answer. Raw checks remain unchanged.

## gpt-6-luna · t01 · taal

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `ad15dfd38b271102d69d39fe8ed92b5f739d3615fdbe2bf6e978d32b6a4decd6`

```text
objective:
Een synoniem van dapper in een eenvoudige zin herkennen.

prompt:
Mila was dapper toen ze haar klasgenoot hielp. Welk woord betekent ongeveer hetzelfde als dapper? Kies één antwoord.

passage:


options:
bang
stil
moedig
lui

rubric:
Kies één van de vier opties.

answer:
moedig

explanation:
Dapper betekent ongeveer hetzelfde als moedig.

```

Mechanical checks: no findings; passage words: 0.

## gpt-6-luna · t02 · taal

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `0e4f3d5f52017e367bc79c1fc8b0f6063ed31307d2f239af82cc0d6a90d500e7`

```text
objective:
Het tegengestelde van vol in een alledaagse context herkennen.

prompt:
Een fles heeft geen water meer. De fles is ...

passage:


options:
zwaar
leeg
groot
rond

rubric:
Kies één antwoord.

answer:
leeg

explanation:
Een fles zonder water is leeg; leeg is het tegengestelde van vol.

```

Mechanical checks: no findings; passage words: 0.

- Separate inspection (objectively-observed-brief-violation): The brief required a full-object context and an explicit antonym-of-vol question. This instead asks for a word describing an empty bottle and never includes vol in the question. Haiku returned clear.

## gpt-6-luna · s01 · spelling

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `0b4ca1daa2149c0149802f315b4f2b9f40559efe964fc0bea4ff1473a9d4ccf4`

```text
objective:
De tegenwoordige tijd van hebben bij hij kiezen.

prompt:
Kies de juiste vorm van het werkwoord hebben. Vul de zin aan: Hij ___ een nieuwe voetbal.

passage:


options:
heeft
hebben

rubric:
Kies één optie.

answer:
heeft

explanation:
Bij hij gebruik je in de tegenwoordige tijd de vorm heeft.

```

Mechanical checks: no findings; passage words: 0.

## gpt-6-luna · s02 · spelling

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `89b5cab4176ba4251796d0d529bda12cccd9fbc5bc264c6460073d90a959257e`

```text
objective:
Het meervoud van boom correct spellen.

prompt:
In het park staan veel oude ___. Welke spelling is goed? Kies één antwoord.

passage:


options:
bomen
boomen

rubric:
Kies het correct gespelde meervoud van boom.

answer:
bomen

explanation:
Het meervoud van boom schrijf je als bomen, met één o.

```

Mechanical checks: no findings; passage words: 0.

## gpt-6-luna · w01 · word-problems

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `61fe3b1d8496fdad2b96c416b6b031dfd3bd2f6ec1866d017e79e4ef92dac9fb`

```text
objective:
Het totaal van gelijke groepen met vermenigvuldiging berekenen.

prompt:
Mila heeft 4 zakjes met in elk zakje 6 knikkers. Hoeveel knikkers heeft Mila in totaal?

passage:


options:


rubric:
Geef alleen het totale aantal knikkers als getal.

answer:
24

explanation:
4 × 6 = 24 knikkers.

```

Mechanical checks: no findings; passage words: 0.

## gpt-6-luna · w02 · word-problems

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `6a862887cc9e4b19394c5445177375fc20c711ae4cdfc13bafdb693940436450`

```text
objective:
Wisselgeld na twee aankopen berekenen.

prompt:
Sam koopt een boek voor 7 euro en een schrift voor 5 euro. Hij betaalt met een briefje van 20 euro. Hoeveel euro krijgt Sam terug? Schrijf je antwoord met het woord ‘euro’.

passage:


options:


rubric:
Het antwoord noemt het juiste bedrag en bevat het woord ‘euro’.

answer:
8 euro

explanation:
Eerst tel je de prijzen op: 7 + 5 = 12 euro. Daarna bereken je het wisselgeld: 20 − 12 = 8 euro.

```

Mechanical checks: no findings; passage words: 0.

## gpt-6-luna · r01 · reading

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `d354b2e2bbb937bc53e5225ecda99c9a257ed66ba704034878404b2a5ef95e03`

```text
objective:
Een expliciet genoemde dag terugvinden in een verhaal.

prompt:
Op welke dag bezocht Noor met haar klas de moestuin?

passage:
Op woensdag liep Noor met haar klas naar de moestuin achter de school. Meester Bram had verteld dat ze daar zouden zien hoe groenten groeien. Bij het hek rook Noor natte aarde en verse kruiden. Tuinvrouw Fatima gaf iedereen een klein schepje. Noor hielp een rijtje wortels voorzichtig uit de grond te halen. Sommige wortels waren recht en lang, andere juist klein en krom. Daarna plantte de klas jonge slaplantjes in een leeg bed. Noor maakte de aarde los, terwijl haar vriend Sam de plantjes water gaf. Fatima liet ook zien hoe je onkruid herkent. Noor vond het leuk om met haar handen in de aarde te werken. Ze leerde dat planten genoeg licht en water nodig hebben. Voor ze teruggingen, kregen de kinderen een zakje tuinkerszaad mee. Noor wilde het thuis op de vensterbank zaaien en elke dag kijken hoe het groeide. In de klas vertelde ze later wat ze had ontdekt.

options:


rubric:
Antwoord met de dag waarop het bezoek plaatsvond.

answer:
Woensdag.

explanation:
In de passage staat: “Op woensdag liep Noor met haar klas naar de moestuin achter de school.”

```

Mechanical checks: no findings; passage words: 153.

## gpt-6-luna · r02 · reading

Human approval: pending. Haiku: clear. Same-model review: False.

Content hash: `dd916998a7ae614deb64771e0e3bcf2126e2036c28e479c9a93e9d95dc26cce3`

```text
objective:
Een expliciet genoemde oorzaak van een routewijziging begrijpen.

prompt:
Waarom nam de klas een omweg naar de bibliotheek?

passage:
Op dinsdagmorgen liep groep vijf van meester Karim naar de bibliotheek. Het was droog en de zon scheen tussen de wolken door. Bij het plein wees meester Karim naar een bord langs het water. Daar stond: “Brug afgesloten wegens reparatie.” De klas kon niet over de brug lopen. Meester Karim stelde voor om langs het park te gaan en daarna de brede straat te volgen. Dat was een langere route, maar iedereen vond het prima. Onderweg telde Noor de rode fietsen die ze passeerden. Sam zag een eend met drie kleintjes bij de oever. Toen ze bij de bibliotheek aankwamen, hield de bibliothecaris al bij de deur de wacht en zwaaide. Binnen legde meester Karim uit waar de klas vandaan kwam. De kinderen kozen boeken voor hun leeskwartier. Ze waren blij dat de omweg hen toch op tijd had gebracht.

options:


rubric:
Antwoord met één volledige zin.

answer:
De klas nam een omweg omdat de brug werd gerepareerd en afgesloten was.

explanation:
In de passage staat: “Brug afgesloten wegens reparatie.”

```

Mechanical checks: answer-does-not-match-independent-reference; passage words: 140.

- Separate inspection (verified-answer-equivalence): This longer sentence correctly names bridge repairs, as supported by the stored passage. It is outside the frozen exact variants but is not a wrong answer. Raw checks remain unchanged.
