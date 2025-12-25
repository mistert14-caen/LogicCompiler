# LogicCompiler

Logic Circuit Simulator – Extended Version
Présentation

Ce projet est une reprise et extension du dépôt original de Drendog :
https://github.com/drendog/Logic-Circuit-Simulator

L’objectif est d’enrichir le simulateur initial en lui ajoutant des capacités de description logique avancée, de hiérarchisation et d’encapsulation, tout en conservant l’ergonomie du wiring et de l’interface graphique existante.

# Nouveautés principales

 **1. Parseur logique étendu**

Cette version intègre un parseur d’équations logiques capable de manipuler :

  * des valeurs binaires (logique booléenne classique),

  * des valeurs décimales, permettant de travailler sur des bus et des signaux multi-bits.

Il devient ainsi possible de modéliser aussi bien des circuits combinatoires simples que des blocs plus complexes manipulant des mots binaires.

**2. Prototypes logiques encapsulés**

L’ajout majeur de cette version est la possibilité de définir des prototypes de fonctions logiques dans des fichiers texte.

Chaque prototype :

  * décrit ses entrées, sorties et équations internes,

  * est automatiquement lié au système de wiring du simulateur,

  * se comporte comme un bloc encapsulé (boîte noire ou grise selon le niveau de détail souhaité).

Ce mécanisme introduit une hiérarchie logique, absente de la version initiale.

**3. Système de sauvegarde repensé**

Le système de sauvegarde a été modifié afin de :

  * prendre en compte les nouveaux blocs importés,

  * restaurer correctement les connexions (wires),

  * préserver la cohérence entre l’interface graphique et le moteur logique.

# Objectifs du projet

L’objectif de ce travail est d’étendre les capacités du simulateur de Drendog pour se rapprocher :

* d’un simulateur de type Logisim,

* voire d’une approche inspirée de Verilog, mais orientée pédagogie et visualisation.

La présence de blocs hiérarchiques et encapsulés rend envisageable la simulation de systèmes plus complexes, comme par exemple un microprocesseur pédagogique de type SAP-1.

# État du projet

Ce projet est en évolution active.
Il sert à la fois :

  * d’outil d’exploration technique,

  * de support pédagogique,

  * et de base expérimentale pour des architectures logiques hiérarchiques.


# Exemples

  * https://mistert.freeboxos.fr/Logic/LogicCompiler2/?id=demo

  * https://mistert.freeboxos.fr/Logic/LogicCompiler2/?id=base

  * https://mistert.freeboxos.fr/Logic/LogicCompiler2/?id=sap1 

(Mettre programme 0F 2E E0 F0 00 00 00 00 00 00 00 00 00 00 01 05)

# Crédits

Projet original : Drendog
https://github.com/drendog/Logic-Circuit-Simulator

Extensions et développements : MisterT

# Licence

MIT License

Copyright (c) 2025 MisterT

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


Conforme à la licence du projet original de Drendog.
