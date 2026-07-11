class Notes extends HTMLElement {
    async connectedCallback() {
        const shadow = this.attachShadow({mode: 'open'})

        async function fetchTheme() {
            for (let i = 0; i < 10; i++) {
                try {
                    const res = await fetch('http://localhost:3000/settingsThemes')
                    if (res.ok) return await res.json()
                } catch (e) {
                    await new Promise(r => setTimeout(r, 1000))
                }
            }
            return []
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

                :host {
                    width: 100%;
                    height: 100%;
                }

                .notes {
                    width: 100%;
                    height: 100%;
                }

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

                /* -- MODULES -- */

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

        for(let i = 0; i < settingsModules.length; i++){
            if(settingsModules[i].actif === 'true' && settingsModules[i].module !== 'Notes') {
                const modulePath = new URL(mods[i][1], window.location.href).href

                import(modulePath).then(() => {
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

        this.getModules = () => {
            return shadow.querySelectorAll('calendar-module, appmenu-module')
        }

        this.enableEdition = () => {
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

        this.disableEdition = () => {
            const modules = shadow.querySelectorAll('calendar-module, appmenu-module')
            modules.forEach(mod => {
                mod.querySelector('.edition-overlay')?.remove()
            })
        }

        const body = shadow.children[1]
        const calendar = shadow.children[2]

        const notes = await fetch('http://localhost:3000/notes')

        const newNote = document.createElement('div')
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

        const changeNote = document.createElement('div')
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

        chargeNote()

        function newDrag(e) {
            selectedNote = this.parentNode
            z_index++
            selectedNote.style.zIndex = z_index
            deltaX = e.clientX - selectedNote.offsetLeft;
            deltaY = e.clientY - selectedNote.offsetTop;
        }

        function chargeNote(){
            var maxi = 0

            notes.forEach(note => {
                const modeleNote = document.createElement('div')
                modeleNote.className = "modeleNote"
                modeleNote.innerHTML = `
                    <p class="idContainer"></p>
                    <h3 class="modeleNoteTitle"></h3>
                    <p class="modeleNoteDesc"></p>
                `
                modeleNote.style.zIndex = parseInt(note.zInd)
                modeleNote.style.backgroundColor = `rgba(${note.r}, ${note.g}, ${note.b}, 0.5)`
                modeleNote.style.top = note.top
                modeleNote.style.left = note.left

                maxi = Math.max(maxi, parseInt(note.zInd))

                const modeleTitle = modeleNote.getElementsByClassName('modeleNoteTitle')[0]
                const modeleDesc = modeleNote.getElementsByClassName('modeleNoteDesc')[0]
                const modeleID = modeleNote.querySelectorAll('p')[0]

                modeleTitle.textContent = note.title
                modeleDesc.textContent = note.desc
                modeleID.textContent = note.id

                modeleTitle.style.backgroundColor = `rgb(${note.r}, ${note.g}, ${note.b})`

                body.appendChild(modeleNote)

                modeleTitle.addEventListener('mousedown', newDrag)

                modeleNote.addEventListener('dblclick', () => {
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
            if (titleBox.value != ""){
                const modeleNote = document.createElement('div')
                modeleNote.className = "modeleNote"
                var r = Math.floor(Math.random() * 256)
                var g = Math.floor(Math.random() * 256)
                var b = Math.floor(Math.random() * 256)

                modeleNote.style.backgroundColor = "rgba("+r+", "+g+", "+b+", 0.5)"
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
                
                modeleNote.style.top = body.offsetHeight/2 - modeleNote.offsetHeight/2 +"px"
                modeleNote.style.left = body.offsetWidth/2 - modeleNote.offsetWidth/2 +"px"
                saveToBDD('insert', modeleNote, r, g, b)
                closeNewNote()

                modeleTitle.addEventListener('mousedown', newDrag)

                modeleNote.addEventListener('dblclick', () => {
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
            if (com == 'insert'){
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
            else if (com == 'update'){
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
            else if (com == 'delete'){
                await fetch(`http://localhost:3000/notes/${note.querySelectorAll("p")[0].textContent}`, {
                    method: 'DELETE'
                })
            }
        }

        function deleteNote(){
            saveToBDD('delete', openedNote)
            openedNote.remove()
            closeChangeNote()
        }

        function saveChangeNote(){
            if (changeNoteTitle.value != ""){
                openedNote.getElementsByClassName('modeleNoteTitle')[0].textContent = changeNoteTitle.value
                openedNote.getElementsByClassName('modeleNoteDesc')[0].textContent = changeNoteDesc.value
                saveToBDD('update', openedNote)
                closeChangeNote()
            }
        }

        function openNewNote(){
            shadow.host.style.zIndex = 9999
            newNote.style.zIndex = z_index+1
            body.appendChild(newNote)
            descBox.style.minWidth = titleBox.offsetWidth+"px"
            newOpened = true
        }

        function closeNewNote(){
            shadow.host.style.zIndex = 0
            titleBox.value = ""
            descBox.value = ""
            body.querySelector('.openNote').remove()
            newOpened = false
        }

        function closeChangeNote(){
            shadow.host.style.zIndex = 0
            body.querySelector('.openNote').remove()
            openedNote = null
        }

        document.addEventListener('keydown', (e) => {
            if (this._disabled) return

            if (!e.shiftKey && e.key === 'Enter'){
                e.preventDefault()
                if (newOpened){
                    saveNewNote()
                } else if (openedNote != null) {
                    saveChangeNote()
                } else if (!window.isOpen) {
                    openNewNote()
                }
            }

            if (e.key === 'Escape'){
                if (newOpened){
                    closeNewNote()
                } else if (openedNote) {
                    closeChangeNote()
                }

            }

            if (e.key === 'Delete' && openedNote && !window.isOpen){
                deleteNote()
            }
        })

        document.addEventListener('mousemove', (e) => {
            if (selectedNote != null) {
                dragged = true

                var x = e.clientX - deltaX;
                var y = e.clientY - deltaY;

                x = Math.max(0, Math.min(x, body.offsetWidth - selectedNote.offsetWidth))
                y = Math.max(0, Math.min(y, body.offsetHeight - selectedNote.children[1].offsetHeight - 50))
                
                selectedNote.style.top = y+"px"
                selectedNote.style.left = x+"px"
            }
        })

        document.addEventListener('mouseup', () => {
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