# Appathon Project Δικτυακός Προγραμματισμός

# Εφαρμογή υπολογισμού και πρότασης διαδρομών για τα λεωφορεία του open dataset του IMET

## Δεμερτζής Θεόδωρος 03112186

Η παρούσα εργασία υλοποιεί ένα σύστημα σύστασης διαδρομής για τα λεωφορεία που κα-
ταγράφονται από το IMET βάσει επιλεχθέντων από τον χρήστη κριτηρίων. Πρώτη επιλογή
είναι η εγγύτητα στη τοποθεσία που βρίσκεται ο χρήστης (την οποία δίνει σε χάρτη)
και δεύτερη η εκτιμώμενη (με πολύ απλό τρόπο, σε καμία περίπτωση δεν αποτελεί υ-
πεύθυνη πρόταση αλλά μπορεί εύκολα να τροποποιηθεί από κάποιον ειδικό) ασφαλέστε-
ρη διαδρομή όσον αφορά τη διάδοση του κορονοΪού. Το interface της εφαρμογής είναι
μια ιστοσελίδα που περιέχει έναν χάρτη και μία απλή φόρμα για να καταγράφει ο χρήσ-
της το επιλεθέν κριτήριο. Προκειμένου να αντιμετώπίσω το πρόβλημα με τους server
του Πολυτεχνίου υλοποίησα απευθείας http requests στο api του imet οπότε και παίρ-
νω ολόκληρα τα αρχεία τα οποία επεξεργάζονται από το frontend.

## Τεχνολογίες που χρησιμοποιήθηκαν:

- Node js για τη δημιουργία του server και npm για την εγκατάσταση των πακέτων
  που απαιτήθηκαν

- Javascript για τη δημιουργία του fronend όπου γίνονται όλες οι διεργασίες και
  ειδικότερα React για την υλοποίηση του interface. Το αρχικό στήσιμο του project
  έγινε με το εργαλείο create-react-app μέσω του npm

- Η βιβλιοθήκη axios για τα http requests στο imet.

- Η βιβλιοθήκη turf js καθώς και η συνάρτηση concaveman για τις απαιτούμενες γεωμετρικές διεργασίες (καθώς και η tiny-queue για τη fifo ουρά του bfs)

https://github.com/Turfjs/turf
https://github.com/mapbox/concaveman
https://github.com/nolanlawson/tiny-queue

- Η βιβλιοθήκη react-leaflet (που έχει τη leaflet σαν βασικό dependency) για την α-
  πεικόνιση του διαδραστικού χάρτη καθώς και το layer από το openstreetmaps
  (το link που αναγράφεται πάνω πάνω στην εφαρμογή μπήκε κατ'απαίτηση του δημιου-
  ργού του svg με τη στάση λεοφορείου)

## Λίγα λόγια για την υλοποίηση

Τα δεδομένα του imet για τις διαδρομές των λεωφορείων είναι στη μορφή linestring,
δηλαδή μια λίστα με lat lng συντεταγμένες, ενώ ταυτόχρονα δε περιέχουν ενδιάμεσες
στάσεις που κάνουν παρα μόνο την αφετηρία και τερματικό σταθμό. Αυτή η προσέγγιση
κάνει δύσκολο να καταλάβουμε ποιες διαδρομές συνδέονται και που καθώς δεν υπάρχει
πληροφορία ενός κοινού grid σταθμών (προφανώς δεν αρκεί ο τερματικός σταθμός και
η αφετηρία). Προκειμένου να μοντελοποιήσω τις εσωτερικές στάσεις κάθε διαδρομής
καθώς και ανταποκρίσεις μεταξύ διαφορετικών διαδρομών (μόνο το δεύτερο γίνεται ρη-
τά) έκανα το εξής: Για κάθε διαδρομή δημιουργούμε ένα κοίλο πολύγωνο (με χρήση της
συνάρτησης concaveman) παίρνοντας 2 linestring της διαδρομής με αρνητικό και θετι-
κό offset 50 μέτρων (lineOffset από turf js) και στη συνέχεια για κάθε ζεύγος πο-
λυγόνων ελέγχουμε αν τέμνονται (booleanDisjoint από turf js). Αν τέμνονται θεωρού-
με ότι θα έχουν και μια κοινή στάση στο σημείο τομής (λόγω του offset αν απέχουν
το πολύ 100 μέτρα θα τέμνονται, αυτό αντιμετώπίζει και το φαινόμενο που 2 διαδρο-
μές ενώ βρίσκονται σε αντίθετα ρεύματα του ίδιου δρόμου δε τέμνονται τα linestrings
τους). Έτσι έχοντας αυτό τον πίνακα τομής των διαδρομών κάνουμε bfs από το σημείο
που βρίσκεται ο χρήστης (αν δεν έχει κοντά του διαδρομή επιστρέφουμε error) με βά-
θος 7 (δλδ απορρίπτουμε διαδρομές που απαιτούν πάνω από 7 αλλαγές λεωφορείών) και επιστρέφουμε όλες τις διαφορετικές διαδρομές (φυσικά το δέντρο είναι μεγάλο οπότε
γίνεται pruning σε διαδρομές που θεωρούμε άχρηστες). Στη συνέχεια το σύνολο των
διαδρομών επεξεργάζεται ανάλογα με το κριτήριο που θέτει ο χρήστης και επιστρέφε-
ται η διαδρομή σε κείμενο καθώς και στο χάρτη. Ο τρόπος που επιλέγουμε τη διαδρομή
είναι ο εξής: Για το κριτήριο εγγύτητας παίρνουμε τη κοντινότερη διαδρομή με το
λιγότερο αριθμό αλλαγών λεωφωρείων η τη διαδρομή με μία περισσότερη αλλαγή αν η
απόσταση από την πρώτη είναι τουλάχιστον 100 μέτρα λιγότερο. Για το κριτήριο ασφά-
λειας από τον κορονοΪό παίρνουμε τη διαδρομή που έχει λίγες αλλαγές, άρα ο χρήστης
θα χρειαστεί να μπεί σε λίγα λεωφορεία, καθώς και κρίνουμε κάθε λεωφορείο ποιοτικά ανάλογα με το πόσα trajectories φεύγουν από την αφετηρία του, στη λογική ότι αν
φεύγουν πολλά σημαίνει ότι στην αφετηρία έχουμε λιγότερο συνοστισμό άρα μάλον θα
έχει λιγότερο κόσμο το κάθε λεωφορείο (αυτό σημαίνει ότι μπορεί μια διαδρομή με περισσότερες αλλαγές να κριθεί ασφαλέστερη). Ο υπολογισμός του πίνακα διασταυρώσε-
ων είναι χρονοβόρος (1 με 3 λεπτά) επομένως εκτός από τη δυνατότητα στον χρήστη να
τον υπολογίσει επί τόπου με νέο request για το json paths απ'το imet έχω και ένα αντίγραφο έτοιμο στο src του αρχείου (άλλωστε το paths δεν αλλάζει) ώστε να μπορεί
να χρησιμοποιήσει την εφαρμογή κατευθείαν.

Περισσότερα στο Powerpoint και το video

# Εγκατάσταση

Οι οδηγίες που ακολουθούν αντιστοιχούν σε λειτουργικό σύστημα linux (σίγουρα με
μικρές αν όχι καθόλου τροποποιήσεις θα ισχύουν και για windows/mac)

Καταρχήν χρειάζεται μια εγκατάσταση node και npm
https://tecadmin.net/install-nodejs-with-nvm/

στη συνέχεια κάνουμε clone το master branch από το link του repo

πλοηγούμαστε με το terminal στο φάκελο που έγινε το clone

πληκτρολογούμε τις ακόλουθες εντολές:

- npm install
- npm run build
- serve build

Στη συνέχεια ανοίγουμε έναν browser (το δοκίμασα και τρέχει σε chrome και firefox
τελευταίες εκδόσεις) στη διεύθυνση που αναγράφεται στο terminal (by default localhost:5000)

youtube link: https://youtu.be/F1z6XoOw7bg
