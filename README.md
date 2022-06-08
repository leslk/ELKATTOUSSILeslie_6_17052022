# Projet 6 "Piquante" de la formation developpeur Web d'Openclassrooms

Une fois le projet installé, rendez-vous sur http://localhost:4200/

## Technologies utilisées : 

Node.js , MongoBD , Mongoose

## Pour installer le projet : 
1. Cloner le repository
2. Effectuer la commande npm install dans le dossier front 
3. Effectuer la commande npm install dans le dossier back
4. Renommer le fichier .env.example se trouvant dans le dossier config en fichier .env et renseigner : 

     * Le nom d'utilisateur de la base de données MongoBD fourni, comme valeur dans la clé DB_USER   
     * Le mot de passe d'accès à la base de données MongoBD fourni, comme valeur dans la clé DB_PASSWORD   
     * La valeur fournie pour la clé TOKEN_SECRET  
     * Une valeur fournie pour la clé CRYPTO_JS_KEY  

5. Lancer le server frontend avec 'npm run start'
6. Lancer le server backend avec 'node server' ou installer nodemon en global via la commande 'npm install -g nodemon' pour pouvoir utiliser la commande 'nodemon server'
