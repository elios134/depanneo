"""Génère les icônes et l'écran de démarrage de Dépannéo depuis assets/logo/.

Relançable : python scripts/generer-icones.py
(Pillow requis : pip install pillow)
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

RACINE = Path(__file__).resolve().parent.parent
LOGO = RACINE / "assets" / "logo" / "Depanneo-logo.jpg"
SORTIE = RACINE / "assets" / "images"
TAILLE = 1024
ZONE_MAISON = (520, 140, 885, 480)
# Polices Windows utilisées pour écrire le nom en blanc (écran de démarrage sombre).
POLICE_TITRE = "C:/Windows/Fonts/segoeuib.ttf"
POLICE_SOUS_TITRE = "C:/Windows/Fonts/segoeui.ttf"
# Teinte la plus sombre du logo (plus bas canal) : sert à estimer la transparence.
CANAL_MIN_LOGO = 60


def decouper(zone) -> Image.Image:
    """Découpe une zone du logo puis resserre sur les pixels non blancs."""
    img = Image.open(LOGO).convert("RGB").crop(zone)
    inverse = ImageChops.invert(img.convert("L")).point(lambda v: 255 if v > 40 else 0)
    return img.crop(inverse.getbbox())


def rendre_transparent(img: Image.Image) -> Image.Image:
    """Retire le fond blanc avec des bords doux (sans halo blanc ni gris)."""
    rgba = Image.new("RGBA", img.size)
    src, dst = img.load(), rgba.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = src[x, y]
            alpha = min(1.0, (255 - min(r, g, b)) / (255 - CANAL_MIN_LOGO))
            if alpha < 0.04:
                dst[x, y] = (0, 0, 0, 0)
                continue
            # On retire la part de blanc mélangée : couleur = (c - (1-a)*255) / a
            couleur = tuple(
                max(0, min(255, round((c - (1 - alpha) * 255) / alpha))) for c in (r, g, b)
            )
            dst[x, y] = (*couleur, round(alpha * 255))
    return rgba


def placer(maison: Image.Image, part: float, fond) -> Image.Image:
    """Centre la maison dans un carré de 1024 px, elle occupe `part` du côté."""
    cible = int(TAILLE * part)
    echelle = cible / max(maison.size)
    taille = (round(maison.width * echelle), round(maison.height * echelle))
    redim = maison.resize(taille, Image.LANCZOS)
    toile = Image.new("RGBA", (TAILLE, TAILLE), fond)
    toile.alpha_composite(redim, ((TAILLE - taille[0]) // 2, (TAILLE - taille[1]) // 2))
    return toile


def logo_sombre(maison: Image.Image) -> Image.Image:
    """Maison + « Dépannéo » en blanc + sous-titre gris clair, sur fond transparent."""
    largeur, haut = 700, 760
    toile = Image.new("RGBA", (largeur, haut), (0, 0, 0, 0))
    m = maison.resize((420, round(maison.height * 420 / maison.width)), Image.LANCZOS)
    toile.alpha_composite(m, ((largeur - m.width) // 2, 40))
    dessin = ImageDraw.Draw(toile)

    def centrer(texte, police, y, couleur):
        g, h, d, b = dessin.textbbox((0, 0), texte, font=police)
        dessin.text(((largeur - (d - g)) / 2 - g, y), texte, font=police, fill=couleur)

    centrer("Dépannéo", ImageFont.truetype(POLICE_TITRE, 96), 40 + m.height + 20, (255, 255, 255, 235))
    centrer("Diagnostic & Réparation Maison", ImageFont.truetype(POLICE_SOUS_TITRE, 32), 40 + m.height + 150, (255, 255, 255, 140))
    return toile.crop(toile.getbbox())


def main() -> None:
    SORTIE.mkdir(parents=True, exist_ok=True)
    maison = rendre_transparent(decouper(ZONE_MAISON))

    icone = placer(maison, 0.62, (255, 255, 255, 255)).convert("RGB")
    icone.save(SORTIE / "icon.png")

    placer(maison, 0.58, (0, 0, 0, 0)).save(SORTIE / "android-icon-foreground.png")
    Image.new("RGB", (TAILLE, TAILLE), (255, 255, 255)).save(SORTIE / "android-icon-background.png")

    silhouette = placer(maison, 0.58, (0, 0, 0, 0))
    # Silhouette nette : on supprime le bruit léger du JPEG et on renforce les bords.
    alpha = silhouette.getchannel("A").point(lambda a: 0 if a < 40 else min(255, a * 2))
    mono = Image.new("RGBA", (TAILLE, TAILLE), (0, 0, 0, 0))
    mono.putalpha(alpha)
    mono.save(SORTIE / "android-icon-monochrome.png")

    icone.resize((48, 48), Image.LANCZOS).save(SORTIE / "favicon.png")
    # Écran de démarrage sombre : maison + nom en blanc (le texte du logo est bleu foncé,
    # illisible sur fond noir, on le réécrit).
    logo = logo_sombre(maison)
    # Android 12+ n'affiche que le cercle central (diamètre = 2/3 du carré) :
    # le logo doit tenir entièrement dans ce cercle.
    diametre = TAILLE * 2 / 3 * 0.96
    echelle = diametre / (logo.width**2 + logo.height**2) ** 0.5
    taille = (round(logo.width * echelle), round(logo.height * echelle))
    toile = Image.new("RGBA", (TAILLE, TAILLE), (0, 0, 0, 0))
    toile.alpha_composite(logo.resize(taille, Image.LANCZOS), ((TAILLE - taille[0]) // 2, (TAILLE - taille[1]) // 2))
    toile.save(SORTIE / "splash-icon.png")
    print("Icônes générées dans", SORTIE)


if __name__ == "__main__":
    main()
