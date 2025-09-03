import express from "express";
import cors from "cors";
import pa11y from "pa11y";

const app = express();
app.use(cors());


app.get("/check", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      error: "Ingen webbadress angiven. Vänligen skriv in en fullständig URL, t.ex. https://exempel.se"
    });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({
      error: "Ogiltig webbadress. Kontrollera att du skrev in en korrekt URL, t.ex. https://exempel.se"
    });
  }

  try {
    const results = await Promise.race([
      pa11y(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 15000)
      )
    ]);

    return res.json(results);

  } catch (err) {
    if (err.message === "timeout") {
      return res.status(504).json({
        error: "Webbsidan svarade inte i tid. Kontrollera att URL:en är korrekt och att sidan är online."
      });
    } else {
      return res.status(500).json({
        error: "Kunde inte analysera webbsidan. Kontrollera att sidan är tillgänglig online och försök igen."
      });
    }
  }
});

// Starta servern
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend körs på port ${PORT}`));
