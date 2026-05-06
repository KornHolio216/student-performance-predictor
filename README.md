# Student Performance Predictor

Projekt przygotowałem w ramach laboratorium ARiSC lab 04 - wdrażanie modeli ML. Pokazuję w nim cały proces: od przygotowania danych i treningu modelu regresji w Pythonie, przez eksport modelu do JavaScript, aż po użycie go w aplikacji webowej stworzonej w Vue.

Aplikacja przewiduje wartość `Performance Index` ucznia na podstawie danych dotyczących nauki, poprzednich wyników, snu, aktywności dodatkowych oraz liczby rozwiązanych arkuszy próbnych.

## Cel projektu

Celem projektu było wykorzystanie wytrenowanego modelu ML w aplikacji z interfejsem użytkownika. Model przygotowałem w Pythonie, a następnie wyeksportowałem go do JavaScript za pomocą biblioteki `m2cgen`.

Dzięki temu predykcja działa bezpośrednio w przeglądarce i nie wymaga backendu w Pythonie.

Projekt obejmuje:

1. wybór datasetu do regresji,
2. trening modelu ML,
3. eksport modelu do JavaScript,
4. przygotowanie aplikacji webowej,
5. integrację aplikacji z modelem.

## Technologie

Część ML:

- Python
- pandas
- numpy
- scikit-learn
- m2cgen
- Jupyter Notebook

Część webowa:

- Vue 3
- Vite
- JavaScript
- HTML
- CSS

## Struktura projektu

```text
student-performance-predictor/
├── ml/
│   ├── data/
│   │   └── Student_Performance.csv
│   ├── notebooks/
│   │   └── training.ipynb
│   ├── exports/
│   │   ├── metrics.json
│   │   └── model.js
│   └── requirements.txt
│
├── web/
│   ├── public/
│   ├── src/
│   │   ├── model/
│   │   │   └── predictor.js
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

## Dataset

W projekcie użyłem datasetu `Student Performance (Multiple Linear Regression)` z Kaggle.

Zbiór zawiera dane opisujące ucznia:

- `Hours Studied` - liczba godzin nauki,
- `Previous Scores` - poprzednie wyniki,
- `Extracurricular Activities` / `Extra Activities` - dodatkowe aktywności,
- `Sleep Hours` - liczba godzin snu,
- `Sample Question Papers Practiced` - liczba rozwiązanych arkuszy próbnych,
- `Performance Index` - wartość przewidywana przez model.

Ponieważ `Performance Index` jest wartością liczbową, potraktowałem projekt jako problem regresji.

## Model ML

Do predykcji wykorzystałem model `LinearRegression` z biblioteki `scikit-learn`.

Cechy wejściowe:

```python
feature_columns = [
    "Hours Studied",
    "Previous Scores",
    "Extra Activities",
    "Sleep Hours",
    "Sample Question Papers Practiced"
]
```

Wartość przewidywana:

```python
y = df["Performance Index"]
```

Przed treningiem wykonałem podstawowy preprocessing:

- zmieniłem nazwę kolumny `Extracurricular Activities` na `Extra Activities`,
- zakodowałem wartości `Yes` / `No` jako `1` / `0`,
- sprawdziłem brakujące wartości,
- upewniłem się, że dane wejściowe są numeryczne,
- podzieliłem dane na zbiór treningowy i testowy.

## Metryki modelu

Model oceniłem za pomocą metryk:

- `MAE`
- `MSE`
- `RMSE`
- `R2`

Przykładowe wyniki:

```text
MAE:  1.6111
MSE:  4.0826
RMSE: 2.0205
R2:   0.9890
```

Wartość `R2` bliska 1 oznacza bardzo dobre dopasowanie modelu do danych testowych. `RMSE` około 2 oznacza, że model myli się średnio o około 2 punkty w skali `Performance Index`.

## Eksport modelu do JavaScript

Model wyeksportowałem do JavaScript za pomocą `m2cgen`:

```python
js_code = m2c.export_to_javascript(model)
js_code += "\n\nexport { score };\n"

export_paths = [
    "../exports/model.js",
    "../../web/src/model/predictor.js"
]

for export_path in export_paths:
    os.makedirs(os.path.dirname(export_path), exist_ok=True)
    with open(export_path, "w") as f:
        f.write(js_code)
```

Wygenerowany plik zawiera funkcję `score(input)`, która zwraca predykcję na podstawie tablicy danych wejściowych.

Notebook zapisuje ten sam model w dwóch miejscach:

- `ml/exports/model.js` - eksport modelu w części ML,
- `web/src/model/predictor.js` - plik importowany przez aplikację Vue.

Dzięki temu po ponownym uruchomieniu notebooka nie trzeba ręcznie kopiować modelu do aplikacji webowej. Plik `web/src/model/predictor.js` jest generowany automatycznie.

Przykład wygenerowanego modelu:

```javascript
function score(input) {
  return -33.921946215556126
    + input[0] * 2.852483930072525
    + input[1] * 1.016988198932932
    + input[2] * 0.6086166795764233
    + input[3] * 0.47694148417627186
    + input[4] * 0.19183144145054268;
}

export { score };
```

## Aplikacja webowa

Aplikację webową przygotowałem w Vue 3 oraz Vite. Użytkownik wpisuje dane ucznia w formularzu, a aplikacja wyświetla przewidywany `Performance Index`.

Formularz zawiera pola:

- `Hours Studied`,
- `Previous Scores`,
- `Extra Activities`,
- `Sleep Hours`,
- `Solved Practice Papers`.

Po kliknięciu przycisku `Predict Performance` aplikacja:

1. pobiera wartości z formularza,
2. zamienia `Extra Activities` na wartość liczbową,
3. tworzy tablicę `input`,
4. wywołuje funkcję `score(input)`,
5. wyświetla wynik predykcji.

Interfejs przygotowałem w stylu retro-futurystycznym, z ciemnym tłem, neonową zielenią, niebieskimi akcentami i siatką w tle.

Główne style interfejsu znajdują się w bloku `<style>` komponentu `App.vue`, a `style.css` zawiera podstawowe style globalne.

## Uruchomienie części ML

Przejście do folderu `ml`:

```bash
cd ml
```

Utworzenie środowiska wirtualnego:

```bash
python -m venv .venv
```

Aktywacja środowiska:

Windows:

```bash
.\.venv\Scripts\activate
```

macOS / Linux:

```bash
source .venv/bin/activate
```

Instalacja zależności:

```bash
pip install -r requirements.txt
```

Uruchomienie Jupyter Notebook:

```bash
jupyter notebook
```

Następnie otwieram plik:

```text
notebooks/training.ipynb
```

Po uruchomieniu wszystkich komórek powinny powstać lub zostać zaktualizowane pliki:

```text
ml/exports/metrics.json
ml/exports/model.js
web/src/model/predictor.js
```

Plik `web/src/model/predictor.js` jest później importowany bezpośrednio w aplikacji Vue.

## Uruchomienie aplikacji webowej

Przejście do folderu `web`:

```bash
cd web
```

Instalacja zależności:

```bash
npm install
```

Uruchomienie aplikacji:

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem pokazanym w terminalu, najczęściej:

```text
http://localhost:5173/
```

## Kolejność danych wejściowych

Najważniejsze przy integracji modelu z aplikacją jest zachowanie tej samej kolejności danych, której użyłem podczas treningu:

```javascript
const input = [
  Number(hoursStudied.value),
  Number(previousScores.value),
  Number(extraActivitiesValue),
  Number(sleepHours.value),
  Number(samplePapers.value),
];
```

Kolejność:

```text
1. Hours Studied
2. Previous Scores
3. Extra Activities
4. Sleep Hours
5. Sample Question Papers Practiced / Solved Practice Papers
```

Model wyeksportowany do JavaScript korzysta z indeksów tablicy `input`, a nie z nazw kolumn. Zmiana kolejności spowoduje błędne wyniki predykcji.
