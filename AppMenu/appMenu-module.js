class AppMenu extends HTMLElement {
    async connectedCallback() {
        const shadow = this.attachShadow({mode: 'open'})

        async function fetchTheme() {
            /*
            Renvoie le thème global du shader, tout en laissant à l'ordinateur le temps de s'allumer
            */

            for (let i = 0; i < 30; i++) {
                try {
                    const res = await fetch('http://localhost:3000/settingsThemes') // Demande au serveur de renvoyer les informations liées au thème
                    return await res.json() // Parse la réponse en un tableau exploitable
                } catch (e) {
                    await new Promise(r => setTimeout(r, 1000)) // Applique un délais avant de relancer une demande
                }
            }
            return []   // Si le serveur n'a pas réussi à s'allumer à temps
        }

        const settingsThemes = await fetchTheme()
    
        shadow.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    color: ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    font-family: Arial, Helvetica, sans-serif;
                }

                .appMenu {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    border: 1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    background-color: ${settingsThemes[0].theme === 'Clair' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
                    z-index: 1;
                    box-sizing: border-box;
                }

                /* -- Partie conteneure d'applications -- */ 

                .container {
                    display: grid;
                    margin: 0.5%;
                    gap: 1px;
                    grid-template-rows: 52px;
                    overflow-y: scroll;
                    scrollbar-width: none;
                }

                .result {
                    display: flex;
                    width: 100%;
                    height: 50px;
                    border: 1px solid rgb(128, 128, 128);
                    border-left: none;
                    border-right: none;
                    user-select: none;
                    align-items: center;
                    font-size: large;
                }

                .result img {
                    width: 32px;
                    height: 32px;
                    margin-left: 15px;
                    object-fit: contain;
                }

                .result p {
                    margin-left: 20px;
                }

                /* -- Partie barre de recherche -- */

                .searchContainer {
                    display: flex;
                    height: 50px;
                    border-top: 1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    position: relative;
                }

                .searchContainer > input {
                    flex: 1;
                    margin: 0.5%;
                    padding-left: 15px;
                    padding-right: 45px;
                    font-size: x-large;
                    background-color: rgba(0, 0, 0, 0);
                    border: 1px solid rgb(128, 128, 128);
                    box-sizing: border-box;
                    user-select: all;
                }

                .loader {
                    display: none;
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    top: 7px;
                    right: 7px;
                    border: 3px solid ${settingsThemes[0].theme === 'Clair' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'};
                    border-radius: 50%;
                    border-top-color: ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    animation: spin 1s linear infinite;
                    pointer-events: none;
                }

                .searchContainer.searching .loader {
                    display: block;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>

            <div class="appMenu">
                <div class="container">
                
                </div>

                <div class="searchContainer">
                    <input type="text" placeholder="Rechercher">
                    <div class="loader"></div></div>
                </div>
            <div>
        `

        const container = shadow.querySelector('.container')
        const inputSearch = shadow.querySelector('input')

        async function requests(com, chemin){
            /*
            Commande l'envoie de requêtes au serveur
            */

            if (com == 'get'){  // Récupère les fichiers présents sur le bureau
                const res = await fetch('http://localhost:3000/bureau')
                return await res.json()
            }
            else if (com == 'exec'){    // Exécute ou ouvre le fichier / dossier ciblé selon sa nature
                try {
                    await fetch(`http://localhost:3000/exec`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            path: chemin
                        })
                    })
                } catch(e) {
                    console.error('exec : ',e)
                }
            }
        }

        function resultGrid(res){
            /*
            Affiche le contenu de 'res' sous forme de liste de fichiers / dossiers avec leur icône correspondant 
            */

            container.innerHTML = ''    // Vide le conteneur

            res.forEach(item => {
                const nom = item.nom.split('.') // Sépare le nom du fichier de son extension
                const ligne = document.createElement('div')
                ligne.className = 'result'

                const srcIcon = `http://localhost:3000/icone?file=${encodeURIComponent(item.chemin)}`   // Récupère le chemin vers l'icône du fichier

                ligne.innerHTML = ` 
                    <img src="${srcIcon}">
                    <p>${nom[0]} | ${item.chemin}</p>
                    <p style="visibility: collapse;">${nom[1]}</p>
                `   // Crée la ligne du conteneur
                
                ligne.addEventListener('dblclick', () => {  // Exécute l'application lors d'un double clic
                    requests('exec', item.chemin)
                })

                container.appendChild(ligne) // Ajoute la ligne au conteneur
            })
        }

        const raccourcis = await requests('get')    // Récupère les fichiers / dossiers du bureau
        resultGrid(raccourcis)

        var searchTimer = null
        var network = null
        const searchContainer = inputSearch.parentNode

        inputSearch.addEventListener('input', (e) => {  // Gère la section recherche de fichier / dossier
            const val = e.target.value.trim()   // Récupère la saisie
            if (searchTimer) clearTimeout(searchTimer)  // Repousse le délais de saisie avant recherche
            if (network) network.abort()
            if (!val) { // Affiche le contenu du bureau s'il n'y a pas de recherche
                searchContainer.classList.remove('searching')
                requests('get').then(data => resultGrid(data))
                return
            }

            searchContainer.classList.add('searching')

            searchTimer = setTimeout(async () => {  // Effectue la recherche une fois le délais de saisie atteint
                network = new AbortController()
                const signal = network.signal

                try {
                    const url = `http://localhost:3000/bureau?search=${encodeURIComponent(val)}`    // Recherche tous les fichiers / dossiers qui contiennent le texte saisi
                    const res = await fetch(url, {signal})
                    const data = await res.json()

                    resultGrid(data)    // Affiche le résultat, vide s'il n'y a aucune correspondance
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error("Erreur : ", err)
                    }
                } finally {
                    searchContainer.classList.remove('searching')
                }
            }, 400)
        })

        var isDown = false
        var startY
        var scrollTop

        container.addEventListener('mousedown', (e) => {        //
            isDown = true                                       //
            container.style.cursor = 'grabbing'                 //
            startY = e.pageY - container.offsetTop              //
            scrollTop = container.scrollTop                     //
        })                                                      //
                                                                //
        container.addEventListener('mousemove', (e) => {        //
            if (!isDown) return;                                //
            e.preventDefault();                                 //
            const y = e.pageY - container.offsetTop;            // Permet le scrolling
            const walk = (y - startY) * 1.5;                    // manuel du conteneur
            container.scrollTop = scrollTop - walk;             //
        });                                                     //
                                                                //
        const stopDragging = () => {                            //
            isDown = false                                      //
            container.style.cursor = 'default'                  //
        }                                                       //
                                                                //
        container.addEventListener('mouseup', stopDragging);    //
        container.addEventListener('mouseleave', stopDragging); //
    }
}

customElements.define('appmenu-module', AppMenu)