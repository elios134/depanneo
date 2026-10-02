"""Génère les icônes et l'écran de démarrage de Dépannéo depuis assets/logo/.

Relançable : python scripts/generer-icones.py
(Pillow requis : pip install pillow)
"""
from pathlib import Path

from PIL import Image, ImageChops

RACINE = Path(__file__).resolve().parent.parent
LOGO = RACINE / "assets" / "logo" / "ZenHome-logo.jpg"
SORTIE = RACINE / "assets" / "images"
TAILLE = 1024
ZONE_MAISON = (520, 140, 885, 480)
# Teinte la plus sombre du logo (plus bas canal) : sert à estimer la transparence.
CANAL_MIN_LOGO = 60


def decouper_maison() -> Image.Image:
    """Découpe la maison puis resserre sur les pixels non blancs."""
    img = Image.open(LOGO).convert("RGB").crop(ZONE_MAISON)
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


def main() -> None:
    SORTIE.mkdir(parents=True, exist_ok=True)
    maison = rendre_transparent(decouper_maison())

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
    placer(maison, 0.80, (0, 0, 0, 0)).save(SORTIE / "splash-icon.png")
    print("Icônes générées dans", SORTIE)


if __name__ == "__main__":
    main()
