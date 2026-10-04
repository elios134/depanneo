# « Qui paie ? » — proposition à valider par André

Base : décret n° 87-712 du 26 août 1987 (réparations locatives) et usages courants des bailleurs.
Valeurs : **L** = à la charge du locataire · **P** = à la charge du propriétaire · **D** = ça dépend de la cause · **A** = autre organisme (fournisseur d'eau, Enedis, syndic/gestionnaire, GRDF).
La phrase est celle affichée sous la ligne « Qui paie ? » (courte, tutoiement). Pour un propriétaire occupant, l'appli affiche simplement « À ta charge » sauf pour **A**.

> André : corrige directement la colonne « Qui » et la phrase, ou dis-moi les lignes à changer.

## Plomberie

| Panne · résultat | Verdict | Qui | Phrase |
|---|---|---|---|
| chasse-coule · resultat_flotteur | 🟢 | L | Entretien courant : détartrage et petites pièces de la chasse d'eau. |
| chasse-coule · resultat_clapet | 🟢 | L | Le remplacement des joints de chasse d'eau fait partie de l'entretien du locataire. |
| chasse-coule · resultat_couper | 🟠 | D | Joints et réglages : locataire. Mécanisme usé par l'âge : propriétaire. |
| chasse-ne-marche-plus · resultat_vide | 🟢 | L | Ouvrir le robinet d'arrivée : rien à payer. |
| chasse-ne-marche-plus · resultat_tringle | 🟢 | L | Petite réparation de la chasse : entretien du locataire. |
| chasse-ne-marche-plus · resultat_mecanisme | 🟠 | D | Pièce cassée par usure normale : propriétaire. Casse par mauvaise utilisation : locataire. |
| douche-ecoule-mal · resultat_bonde | 🟢 | L | Le débouchage des évacuations jusqu'à la colonne commune est à la charge du locataire. |
| douche-ecoule-mal · resultat_canalisation | 🟠 | D | Bouchon dans ton logement : locataire. Dans la colonne de l'immeuble : propriétaire ou syndic. |
| evier-bouche · resultat_deboucher | 🟢 | L | Débouchage courant : entretien du locataire. |
| evier-bouche · resultat_siphon | 🟢 | L | Nettoyage du siphon : entretien du locataire. |
| evier-bouche · resultat_canalisation | 🟠 | A | Canalisation commune : préviens le gestionnaire ou le syndic de l'immeuble. |
| flexible-douche-fuit · resultat_joint | 🟢 | L | Joints et flexibles de douche : entretien du locataire. |
| flexible-douche-fuit · resultat_flexible | 🟢 | L | Le remplacement du flexible de douche est à la charge du locataire. |
| flexible-douche-fuit · resultat_pommeau | 🟢 | L | Joint et détartrage du pommeau : entretien du locataire. |
| fuite-eau · resultat_raccord | 🟢 | L | Joints et raccords apparents : entretien du locataire. |
| fuite-eau · resultat_perce | 🟠 | P | Un tuyau percé (usure, corrosion) est à la charge du propriétaire, sauf dégât causé par le locataire. |
| fuite-eau · resultat_compteur | 🟠 | A | Fuite au compteur : préviens ton fournisseur d'eau, c'est souvent à sa charge. |
| fuite-eau · resultat_plafond | 🔴 | D | Ça vient souvent du voisin du dessus : déclare le sinistre à ton assurance habitation. |
| fuite-eau · resultat_inconnue | 🟠 | D | Selon l'origine : joint ou raccord (locataire), tuyau ou canalisation (propriétaire). |
| fuite-pied-wc · resultat_pipe | 🟠 | D | Joint de la pipe : souvent locataire. Pipe ou cuvette fêlée par l'âge : propriétaire. |
| fuite-pied-wc · resultat_condensation | 🟢 | L | Ce n'est pas une panne : rien à payer, pense à aérer. |
| groupe-securite-goutte · resultat_normal | 🟢 | L | Manœuvrer le groupe de sécurité fait partie de l'entretien du locataire. |
| groupe-securite-goutte · resultat_pro | 🟠 | D | Groupe de sécurité entartré : souvent locataire. Thermostat ou chauffe-eau en panne : propriétaire. |
| odeur-egout · resultat_siphon_sec | 🟢 | L | Remplir le siphon : rien à payer. |
| odeur-egout · resultat_nettoyer | 🟢 | L | Nettoyage du siphon : entretien du locataire. |
| odeur-egout · resultat_pro | 🟠 | P | Ventilation ou canalisation abîmée : à la charge du propriétaire. |
| odeur-egout · resultat_gaz | 🔴 | A | Urgence gaz : appelle le numéro d'urgence. Ne t'occupe pas des frais maintenant. |
| pas-eau-chaude · resultat_mitigeur | 🟢 | L | Détartrage ou cartouche du mitigeur : entretien du locataire. |
| pas-eau-chaude · resultat_rearmer | 🟢 | L | Réarmer un disjoncteur : rien à payer. |
| pas-eau-chaude · resultat_attendre | 🟢 | L | Rien à payer : le ballon se remplit cette nuit. |
| pas-eau-chaude · resultat_pro | 🟠 | P | Résistance, thermostat ou contacteur du chauffe-eau : à la charge du propriétaire. |
| pas-eau-chaude · resultat_chauffagiste | 🟠 | D | Entretien annuel de la chaudière : locataire. Réparation ou remplacement : propriétaire. |
| pression-faible · resultat_mousseur | 🟢 | L | Détartrer les mousseurs : entretien du locataire. |
| pression-faible · resultat_reseau | 🟠 | A | Problème de réseau : contacte le service des eaux. |
| pression-faible · resultat_arret | 🟠 | P | Réducteur de pression ou robinet d'arrêt défectueux : à la charge du propriétaire. |
| robinet-dur · resultat_cartouche | 🟠 | L | Le remplacement des cartouches et joints de robinet est à la charge du locataire. |
| robinet-dur · resultat_tete | 🟠 | L | Têtes et joints de robinet : entretien du locataire. |
| robinet-dur · resultat_arret | 🟠 | P | Remplacer le robinet d'arrêt général : à la charge du propriétaire (ou du syndic). |
| robinet-goutte · resultat_joint | 🟢 | L | Joints et clapets de robinet : entretien du locataire. |
| robinet-goutte · resultat_cartouche | 🟠 | L | La cartouche du mitigeur est à la charge du locataire. |
| robinet-goutte · resultat_pied | 🟠 | D | Joint : locataire. Corps du robinet usé par l'âge : propriétaire. |
| wc-bouche · resultat_ne_plus_tirer | 🟠 | L | Débouchage des WC : entretien du locataire. |
| wc-bouche · resultat_ventouse | 🟢 | L | Débouchage des WC : entretien du locataire. |
| wc-bouche · resultat_canalisation | 🟠 | A | Canalisation commune : préviens le gestionnaire ou le syndic de l'immeuble. |
| wc-lent-a-remplir · resultat_ouvrir | 🟢 | L | Ouvrir le robinet d'arrivée : rien à payer. |
| wc-lent-a-remplir · resultat_calcaire | 🟢 | L | Détartrer le robinet flotteur : entretien du locataire. |
| wc-lent-a-remplir · resultat_pro | 🟠 | D | Robinet flotteur cassé par l'usure : propriétaire. Simple membrane ou joint : locataire. |
| bruit-tuyaux · resultat_belier | 🟠 | P | Poser un anti-bélier sur l'installation : à la charge du propriétaire. |
| bruit-tuyaux · resultat_sifflement | 🟢 | L | Ouvrir les robinets d'arrêt, détartrer : entretien du locataire. |
| bruit-tuyaux · resultat_chauffe_eau | 🟠 | D | Détartrage : souvent locataire. Chauffe-eau à remplacer : propriétaire. |

## Électricité

| Panne · résultat | Verdict | Qui | Phrase |
|---|---|---|---|
| ampoule-clignote · resultat_ampoule | 🟢 | L | Les ampoules sont à la charge du locataire. |
| ampoule-clignote · resultat_pro | 🟠 | L | Douilles et interrupteurs abîmés : leur remplacement est à la charge du locataire. |
| ampoule-clignote · resultat_pro_urgent | 🔴 | P | Défaut sur l'installation électrique : à la charge du propriétaire. |
| courant-une-piece · resultat_rearmer | 🟢 | L | Réarmer un disjoncteur : rien à payer. |
| courant-une-piece · resultat_pro | 🟠 | D | Fil desserré sur une prise ou un interrupteur : locataire. Défaut de l'installation : propriétaire. |
| disjoncteur-saute · resultat_appareil | 🟠 | L | C'est ton appareil qui est en cause : à ta charge. |
| disjoncteur-saute · resultat_surcharge | 🟢 | L | Répartir les appareils : rien à payer. |
| disjoncteur-saute · resultat_court_circuit | 🔴 | D | Appareil en défaut : locataire. Défaut de l'installation : propriétaire. |
| lumiere-hs · resultat_ampoule | 🟢 | L | Les ampoules sont à la charge du locataire. |
| lumiere-hs · resultat_piece | 🟢 | L | Réarmer un disjoncteur : rien à payer. |
| lumiere-hs · resultat_pro | 🟠 | D | Interrupteur à remplacer : locataire. Fil ou installation défectueux : propriétaire. |
| plus-de-courant · resultat_reseau | 🟠 | A | Coupure du réseau : c'est Enedis qui intervient, rien à payer. |
| plus-de-courant · resultat_reenclencher | 🟢 | L | Réenclencher le disjoncteur : rien à payer. |
| plus-de-courant · resultat_pro | 🔴 | D | Avant le disjoncteur général : Enedis. Dans le logement : propriétaire. |
| prise-hs · resultat_danger | 🔴 | D | Prise abîmée par l'usage : locataire. Installation défectueuse : propriétaire. |
| prise-hs · resultat_appareil | 🟢 | L | C'est ton appareil qui est en cause : à ta charge. |
| prise-hs · resultat_piece | 🟢 | L | Réarmer un disjoncteur : rien à payer. |
| prise-hs · resultat_pro | 🟠 | L | Le remplacement des prises est à la charge du locataire. |
