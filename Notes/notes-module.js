class Notes extends HTMLElement {
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

        if (settingsThemes.length != 0) shadow.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    color: ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                }

                :host { // Élément parent du shadow
                    width: 100%;
                    height: 100%;
                }

                .notes {
                    width: 100%;
                    height: 100%;
                }

                /* -- Entrée pour la saisie d'informations -- */

                .openNote {
                    display: flex;
                    position: absolute;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.5);
                    justify-content: center;
                    align-items: center;
                }

                .noteBloc {
                    display: flex;
                    flex-direction: column;
                    min-width: 100px;
                    min-height: 100px;
                    height: min-content;
                    padding: 20px;
                    background-color: ${settingsThemes[0].theme === 'Clair' ? 'white' : 'black'};
                    border-radius: 20px;
                }

                .noteTitle, .noteDesc {
                    background-color: ${settingsThemes[0].theme === 'Clair' ? 'rgb(212, 212, 212)' : 'rgb(43, 43, 43)'};
                    padding: 5px;
                }

                .noteDesc {
                    height: max-content;
                    margin: 15px 0px;
                }

                .btnContainer {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    justify-content: space-between;
                }

                .btnContainer > button {
                    width: 45%;
                    background-color: ${settingsThemes[0].theme === 'Clair' ? 'rgb(212, 212, 212)' : 'rgb(43, 43, 43)'}
                }

                .idContainer {
                    width: 0;
                    height: 0;
                    visibility: hidden;
                }

                /* -- Post-it -- */

                .modeleNote {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    min-width: 100px;
                    min-height: 50px;
                }

                .modeleNoteTitle {
                    padding: 15px;
                    user-select: none;
                }

                .modeleNoteDesc {
                    padding: 15px;
                    user-select: auto;
                }

                /* -- Autres modules -- */

                appmenu-module, calendar-module {
                    position: absolute;
                }

                appmenu-module.edition,
                calendar-module.edition {
                    pointer-events: auto;
                    outline: 2px dashed #cc2900;
                    outline-offset: -2px;
                }

                appmenu-module.edition::after,
                calendar-module.edition::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 4;
                }

                /* -- Entrée pour la saisie d'informations du calendrier -- */

                .entry {
                    position: absolute;
                    top: 0;
                    z-index: 1;
                    display: flex;
                    background-color: rgba(0, 0, 0, 0.5);
                    width: 100%;
                    height: 100%;
                    justify-content: center;
                    align-items: center;
                }

                .entryContainer {
                    display: flex;
                    flex-direction: column;
                    background-color: ${settingsThemes[0].theme === 'Clair' ? 'white' : 'black'};
                    border-radius: 20px;
                    min-height: 20px;
                    min-width: 20px;
                    padding: 20px;
                    gap: 10px;
                }

                .entryContainer input, .entryContainer label, .entryContainer textarea {
                    color: ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    background-color: ${settingsThemes[0].theme === 'Clair' ? 'white' : 'black'}
                }

                .entryContainer > div {
                    display: flex;
                    justify-content: space-between;
                }

                .entryContainer button {
                    width: 45%;
                    color: ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    background-color: ${settingsThemes[0].theme === 'Clair' ? 'white' : 'black'}
                }
            </style>
        
            <div class='notes'></div>
        `
        const settingsModules = await fetch('http://localhost:3000/settingsModules').then(r => r.json())

        const mods = [
            ['AppMenu', '../AppMenu/appMenu-module.js', 'appmenu-module'],
            ['Calendar', '../Calendar/calendar-module.js', 'calendar-module'],
            ['Notes', '../Notes/notes-module.js', 'notes-module']
        ]

        for(let i = 0; i < settingsModules.length; i++){    // Vérifie les modules actifs
            if(settingsModules[i].actif === 'true' && settingsModules[i].module !== 'Notes') {
                const modulePath = new URL(mods[i][1], window.location.href).href

                import(modulePath).then(() => { // Importe le module et insert la balise correspondante
                    const balise = document.createElement(mods[i][2])
                    balise.className = mods[i][0]
                    balise.style.top = settingsModules[i].top
                    balise.style.left = settingsModules[i].left
                    balise.style.width = settingsModules[i].width
                    balise.style.height = settingsModules[i].height
                
                    shadow.appendChild(balise)
                })
            }
        }

        this.getModules = () => {   // Renvoie les modules actifs dans Notes
            return shadow.querySelectorAll('calendar-module, appmenu-module')
        }

        this.enableEdition = () => {    // Rend les modules actifs modifiables depuis la page de settings
            const modules = shadow.querySelectorAll('calendar-module, appmenu-module')
            modules.forEach(mod => {
                const overlay = document.createElement('div')
                overlay.className = 'edition-overlay'
                overlay.style.cssText = `
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    z-index: 999;
                `
                mod.appendChild(overlay)
            })
        }

        this.disableEdition = () => {   // Désactive le mode d'édition des modules
            const modules = shadow.querySelectorAll('calendar-module, appmenu-module')
            modules.forEach(mod => {
                mod.querySelector('.edition-overlay')?.remove()
            })
        }

        const body = shadow.children[1]
        const calendar = shadow.children[2]

        const notes = await fetch('http://localhost:3000/notes').then(r => r.json())

        const newNote = document.createElement('div')   // Crée l'entrée de saisie pour une note
        newNote.className = 'openNote'
        newNote.innerHTML = `
            <div class="noteBloc">
                <input class="noteTitle" type="text" placeholder="Titre">
                </input>

                <textarea class="noteDesc" type="textarea" placeholder="Description">
                </textarea>

                <div class="btnContainer">
                    <button class="btnSave">Ajouter</button>
                    <button class="btnReturn">Retour</button>
                </div>
            </div>
        `
        newNote.querySelector('.btnSave').addEventListener('click', saveNewNote)
        newNote.querySelector('.btnReturn').addEventListener('click', closeNewNote)

        const titleBox = newNote.getElementsByClassName('noteTitle')[0]
        const descBox = newNote.getElementsByClassName('noteDesc')[0]
        descBox.textContent = ""

        const changeNote = document.createElement('div')    // Crée l'entrée de modification d'une note
        changeNote.className = 'openNote'
        changeNote.innerHTML = `
            <div class="noteBloc">
                <input class="noteTitle" type="text" placeholder="Titre">
                </input>

                <textarea class="noteDesc" type="textarea" placeholder="Description">
                </textarea>

                <div class="btnContainer">
                    <button class="save">Modifier</button>
                    <button class="delete">Supprimer</button>
                    <button class="return">Retour</button>
                </div>
            </div>
        `
        changeNote.querySelector('.save').addEventListener('click', saveChangeNote)
        changeNote.querySelector('.delete').addEventListener('click', deleteNote)
        changeNote.querySelector('.return').addEventListener('click', closeChangeNote)

        const changeNoteTitle = changeNote.getElementsByClassName('noteTitle')[0]
        const changeNoteDesc = changeNote.getElementsByClassName('noteDesc')[0]

        var newOpened = false

        var selectedNote = null
        var openedNote = null
        var dragged = false

        var z_index = 0
        var deltaX = 0
        var deltaY = 0

        chargeNote()    // Charge et affiche les notes enregistrées

        function newDrag(e) {
            /*
            Enregistre la note sélectionnée
            */

            selectedNote = this.parentNode
            z_index++
            selectedNote.style.zIndex = z_index
            deltaX = e.clientX - selectedNote.offsetLeft;
            deltaY = e.clientY - selectedNote.offsetTop;
        }

        function chargeNote(){
            /*
            Charge et affiche les notes enregistrées
            */

            var maxi = 0

            notes.forEach(note => {
                const modeleNote = document.createElement('div')    // Crée un post-it
                modeleNote.className = "modeleNote"
                modeleNote.innerHTML = `
                    <p class="idContainer"></p>
                    <h3 class="modeleNoteTitle"></h3>
                    <p class="modeleNoteDesc"></p>
                `

                modeleNote.style.zIndex = parseInt(note.zInd)
                modeleNote.style.backgroundColor = `rgba(${note.r}, ${note.g}, ${note.b}, 0.5)` // Redonne la couleur aléatoire associée
                modeleNote.style.top = note.top
                modeleNote.style.left = note.left

                maxi = Math.max(maxi, parseInt(note.zInd))

                const modeleTitle = modeleNote.getElementsByClassName('modeleNoteTitle')[0]
                const modeleDesc = modeleNote.getElementsByClassName('modeleNoteDesc')[0]
                const modeleID = modeleNote.querySelectorAll('p')[0]

                modeleTitle.textContent = note.title
                modeleDesc.textContent = note.desc
                modeleID.textContent = note.id

                modeleTitle.style.backgroundColor = `rgb(${note.r}, ${note.g}, ${note.b})`  // Redonne la couleur aléatoire associée

                body.appendChild(modeleNote)

                modeleTitle.addEventListener('mousedown', newDrag)  // Commence le drag lors d'un clic maintenu

                modeleNote.addEventListener('dblclick', () => { // Ouvre le détail de la note lors d'un double clic
                    selectedNote = null
                    openedNote = modeleNote
                    changeNoteTitle.value = openedNote.getElementsByClassName('modeleNoteTitle')[0].textContent
                    changeNoteDesc.value = openedNote.getElementsByClassName('modeleNoteDesc')[0].textContent
                    changeNote.style.zIndex = z_index + 1

                    body.appendChild(changeNote)
                })  
            });

            z_index = parseInt(maxi)
        }

        function saveNewNote(){
            /*
            Sauvegarde une nouvelle note
            */

            if (titleBox.value != ""){  // Oblige la saisie du titre au minimum
                const modeleNote = document.createElement('div')    // Crée le post-it
                modeleNote.className = "modeleNote"

                var r = Math.floor(Math.random() * 256)                             //
                var g = Math.floor(Math.random() * 256)                             // Génère une couleur
                var b = Math.floor(Math.random() * 256)                             // associée à la note
                modeleNote.style.backgroundColor = "rgba("+r+", "+g+", "+b+", 0.5)" //

                z_index++
                modeleNote.style.zIndex = z_index
                
                modeleNote.innerHTML = `
                    <p class="idContainer"></p>
                    <h3 class="modeleNoteTitle"></h3>
                    <p class="modeleNoteDesc"></p>
                `

                const modeleTitle = modeleNote.getElementsByClassName('modeleNoteTitle')[0]
                const modeleDesc = modeleNote.getElementsByClassName('modeleNoteDesc')[0]
                const modeleID = modeleNote.querySelectorAll('p')[0]
                modeleTitle.textContent = titleBox.value
                modeleDesc.textContent = descBox.value
                modeleID.textContent = z_index
            
                modeleTitle.style.backgroundColor = "rgb("+r+", "+g+", "+b+")"
                
                body.appendChild(modeleNote)
                
                modeleNote.style.top = body.offsetHeight/2 - modeleNote.offsetHeight/2 +"px"    // Place initialement le
                modeleNote.style.left = body.offsetWidth/2 - modeleNote.offsetWidth/2 +"px"     // post-it au centre

                saveToBDD('insert', modeleNote, r, g, b)    // Enregistre la note
                closeNewNote()

                modeleTitle.addEventListener('mousedown', newDrag)  // Commence le drag lors d'un clic maintenu

                modeleNote.addEventListener('dblclick', () => { // Ouvre le détail de la note lors d'un double clic
                    selectedNote = null
                    openedNote = modeleNote
                    changeNoteTitle.value = openedNote.getElementsByClassName('modeleNoteTitle')[0].textContent
                    changeNoteDesc.value = openedNote.getElementsByClassName('modeleNoteDesc')[0].textContent
                    changeNote.style.zIndex = z_index + 1

                    body.appendChild(changeNote)
                })
            }
        }

        async function saveToBDD(com = "", note, r = 0, g = 0, b = 0){
            /*
            Commande l'envoie de requêtes au serveur
            */
           
            if (com == 'insert'){   // Enregistre une nouvelle note
                const result = await fetch(`http://localhost:3000/notes`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        title: note.getElementsByClassName('modeleNoteTitle')[0].textContent,
                        desc: note.getElementsByClassName('modeleNoteDesc')[0].textContent,
                        top: note.offsetTop+"px",
                        left: note.offsetLeft+"px",
                        zInd: note.style.zIndex,
                        r: r,
                        g: g,
                        b: b
                    })
                })

                note.querySelectorAll('p')[0].textContent = result.id
            }
            else if (com == 'update'){  // Met à jour la note ciblée
                await fetch(`http://localhost:3000/notes/${note.querySelectorAll("p")[0].textContent}`, {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        title: note.getElementsByClassName('modeleNoteTitle')[0].textContent,
                        desc: note.getElementsByClassName('modeleNoteDesc')[0].textContent,
                        top: note.style.top,
                        left: note.style.left,
                        zInd: note.style.zIndex
                    })
                })
            }
            else if (com == 'delete'){  // Supprime la note ciblée
                await fetch(`http://localhost:3000/notes/${note.querySelectorAll("p")[0].textContent}`, {
                    method: 'DELETE'
                })
            }
        }

        function deleteNote(){
            /*
            Supprime la note ciblée lorsque l'entrée de modification est ouverte
            */

            saveToBDD('delete', openedNote)
            openedNote.remove()
            closeChangeNote()
        }

        function saveChangeNote(){
            /*
            Sauvegarde les modifications de la note ciblée
            */

            if (changeNoteTitle.value != ""){   // Oblige la saisie du titre au minimum
                openedNote.getElementsByClassName('modeleNoteTitle')[0].textContent = changeNoteTitle.value
                openedNote.getElementsByClassName('modeleNoteDesc')[0].textContent = changeNoteDesc.value
                saveToBDD('update', openedNote)
                closeChangeNote()
            }
        }

        function openNewNote(){
            /*
            Ouvre l'entrée de saisie pour une nouvelle note
            */
           
            shadow.host.style.zIndex = 9999
            newNote.style.zIndex = z_index+1
            body.appendChild(newNote)
            descBox.style.minWidth = titleBox.offsetWidth+"px"
            newOpened = true
        }

        function closeNewNote(){
            /*
            Ferme l'entrée de saisie pour une nouvelle note
            */
           
            shadow.host.style.zIndex = 0
            titleBox.value = ""
            descBox.value = ""
            body.querySelector('.openNote').remove()
            newOpened = false
        }

        function closeChangeNote(){
            /*
            Ferme l'entrée de modification de la note ciblée
            */

            shadow.host.style.zIndex = 0
            body.querySelector('.openNote').remove()
            openedNote = null
        }

        document.addEventListener('keydown', (e) => {   // Gère les événements clavier
            if (this._disabled) return  // Empêche l'interaction clavier depuis la page de settings

            if (!e.shiftKey && e.key === 'Enter'){  // Ouvre une nouvelle note ou sauvegarde / modifie une existante
                e.preventDefault()
                console.log('ok')
                if (newOpened){
                    saveNewNote()
                } else if (openedNote != null) {
                    saveChangeNote()
                } else if (!window.isOpen) {
                    openNewNote()
                }
            }

            if (e.key === 'Escape'){    // Ferme toute pop-up de saisie ouverte
                if (newOpened){
                    closeNewNote()
                } else if (openedNote) {
                    closeChangeNote()
                }

            }

            if (e.key === 'Delete' && openedNote && !window.isOpen){    // Supprime la note ciblée lorsque l'entrée de modification est ouverte
                deleteNote()
            }
        })

        document.addEventListener('mousemove', (e) => { // Gère le déplacement des post-it
            if (selectedNote != null) {
                dragged = true

                var x = e.clientX - deltaX;
                var y = e.clientY - deltaY;

                x = Math.max(0, Math.min(x, body.offsetWidth - selectedNote.offsetWidth))                       // Empêche le dépassement de l'écran
                y = Math.max(0, Math.min(y, body.offsetHeight - selectedNote.children[1].offsetHeight - 50))    // (et de la barre de tâche)
                
                selectedNote.style.top = y+"px"
                selectedNote.style.left = x+"px"
            }
        })

        document.addEventListener('mouseup', () => {    // Enregistre le déplacement de la note ciblée
            if (selectedNote != null && dragged) {
                saveToBDD('update', selectedNote)
                selectedNote = null
                deltaX = 0
                deltaY = 0
                dragged = false
            }
        })
    }
}

customElements.define('notes-module', Notes)