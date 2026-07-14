async function init() {
    /*
    Permet l'usage de fonction asynchrones bloquantes
    */

    const body = document.querySelector('body')
    const img = document.querySelector('img')

    const modulesBtn = document.querySelector('#modules')
    const placesBtn = document.querySelector('#placements')
    const themesBtn = document.querySelector('#thèmes')
    const bgBtn = document.querySelector('#bg')

    const container = document.querySelector('.container')

    async function fetchBackground() {
        /*
        Renvoie les informations du fond d'écran, tout en laissant à l'ordinateur le temps de s'allumer
        */

        for (let i = 0; i < 30; i++) {
            try {
                const res = await fetch('http://localhost:3000/settings/background')    // Demande au serveur de renvoyer les informations liées au fond d'écran
                if (res.ok) return await res.json() // Parse la réponse en un tableau exploitable
            } catch (e) {
                await new Promise(r => setTimeout(r, 1000)) // Applique un délais avant de relancer une demande
            }
        }
        return []   // Si le serveur n'a pas réussi à s'allumer à temps
    }

    var background = await fetchBackground()
    if (background.length == 0) await fetch('http://localhost:3000/settings/background/insert', {method:'POST'})    // Enregistre le chemin du fond d'écran s'il n'existe pas

    async function rafraichirBG() {
        /*
        Vérifie le chemin du fond d'écran et l'importe, met à jour le chemin s'il est obsolète
        */

        try {
            const bg = await fetch('http://localhost:3000/background/image')    // Récupère le fond d'écran

            if (bg.ok) {    
                const blob = await bg.blob()    // Récupère le chemin est contournant les restrictions js
                img.src = URL.createObjectURL(blob)
            } else if (bg.status === 404) { // Si le chemin est obsolète
                await fetch('http://localhost:3000/settings/background/insert', {method:'POST'})    // Met à jour le chemin du fond d'écran
                rafraichirBG()
            }
        } catch (e) {
            console.error("Erreur lors de la récupération du fond d'écran :", e)
        }
    }

    await rafraichirBG()    // Initialise le fond d'écran

    if (bgBtn) {
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.accept = 'image/png, image/jpeg, image/jpg'
        fileInput.style.display = 'none'
        document.body.appendChild(fileInput)

        bgBtn.addEventListener('click', () => fileInput.click())    // Ouvre un explorateur de fichier pour charger le nouveau fond d'écran

        fileInput.addEventListener('change', () => {    // Récupère le nouveau fond d'écran et remplace l'ancien
            const file = fileInput.files[0]
            if (!file) return

            const fileExtension = file.name.substring(file.name.lastIndexOf('.'))
            const reader = new FileReader()

            reader.onload = async (e) => {
                const buffer = e.target.result
                try {
                    const response = await fetch('http://localhost:3000/settings/background/update', {  // Met à jour le fond d'écran
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/octet-stream',
                            'X-File-Extension': fileExtension
                        },
                        body: buffer
                    })
                    
                    const result = await response.json()
                    if (result.ok) {    // Recharge la page en cas de succès pour mettre à jour visuellement
                        window.location.reload()
                    } else {
                        alert("Erreur serveur : " + result.error)
                    }
                } catch (error) {
                    console.error("Erreur lors de l'envoi de l'image :", error)
                }
            }
            reader.readAsArrayBuffer(file)
        })
    }

    container.style.width = body.offsetWidth + "px"
    container.style.height = body.offsetHeight - 50 + "px"

    var modOpen = false
    var placOpen = false
    var themOpen = false

    var resized = false
    var selected = null
    var deltaX
    var deltaY
    var Top
    var Left

    const liste = document.createElement('div')
    liste.className = 'liste'
    liste.style.zIndex = 1

    const mods = [
        ['AppMenu', '../AppMenu/appMenu-module.js', 'appmenu-module'],
        ['Calendar', '../Calendar/calendar-module.js', 'calendar-module'],
        ['Notes', '../Notes/notes-module.js', 'notes-module']
    ]

    const themes = [
        'Clair',
        'Sombre'
    ]

    const settingsModules = await fetch('http://localhost:3000/settingsModules').then(r => r.json())    // Récupère les informations des modules
    const settingsThemes = await fetch('http://localhost:3000/settingsThemes').then(r => r.json())  // Récupère le thème global

    var present = []

    mods.forEach(mod => {   // Vérifie que tous les modules sont présents dans la base de données
        var check = true
        for(let i = 0; i < settingsModules.length; i++){
            if (mod[0] == settingsModules[i].module) {
                check = false
                break
            }
        }

        if (check) {    // Ajoute ceux qui ne le sont pas
            present.push(mod[0])
        }
    })

    if (present.length != 0){   // Enregistre tous les modules non enregistrés
        present.forEach(async mod => {
            await fetch(`http://localhost:3000/settingsModules/insert`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    module: mod,
                    actif: 'false',
                    top: '0px',
                    left: '0px',
                    width: mod == 'Notes' ? '100%' : 'max-content',
                    height: mod == 'Notes' ? '100%' : 'max-content'
                })
            })
        })
    }

    if (settingsThemes.length == 0){    // Ajoute un thème par défaut s'il n'y en a pas
        await fetch(`http://localhost:3000/settingsThemes/insert`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                theme: 'Clair'
            })
        })
    }

    function displayModule(i) {
        /*
        Importe le module et l'affiche
        */

        const modulePath = new URL(mods[i][1], window.location.href).href

        import(modulePath).then(() => {
            const balise = document.createElement(mods[i][2])
            balise.className = mods[i][0]
            balise.style.top = settingsModules[i].top
            balise.style.left = settingsModules[i].left
            balise.style.width = settingsModules[i].width
            balise.style.height = settingsModules[i].height
        
            container.appendChild(balise)
        })
    }

    function newDrag(e) {
        /*
        Initialise le déplacement du module ciblé
        */

        const bloc = e.currentTarget
        const rect = bloc.getBoundingClientRect();
        const borderSize = 20;

        const isClickingResizeX = (e.clientX >= rect.right - borderSize);
        const isClickingResizeY = (e.clientY >= rect.bottom - borderSize);

        if (isClickingResizeX && isClickingResizeY) {   // Si le coin inférieur droit est sélectionné
            resized = true;
            Top = bloc.offsetTop
            Left = bloc.offsetLeft
            try {
                bloc.parentNode.style.cursor = "se-resize"
            } catch (e) {bloc.style.cursor = "se-resize"}
        } else {    // Si le module est sélectionné
            try {
                bloc.parentNode.style.cursor = 'move'
            } catch (e) {bloc.style.cursor = "move"}
        }

        selected = bloc;
        deltaX = e.clientX - selected.offsetLeft;
        deltaY = e.clientY - selected.offsetTop;
    }

    for (let i = 0; i < mods.length; i++){  // Affiche tous les modules actifs
        if (settingsModules[i].actif === 'true' && (settingsModules[2].actif !== 'true' || settingsModules[i].module === 'Notes')) displayModule(i)
    }

    function closeModules(){
        /*
        Ferme la liste des modules
        */

        body.querySelector('.liste').remove()
        liste.innerHTML = ''
        modOpen = false
    }

    modulesBtn.addEventListener('click', (e) => {   // Ouvre la liste des modules
        if (!modOpen) {
            if (themOpen) closeThemes()
            if (placOpen) closePlacements()

            liste.style.width = modulesBtn.offsetWidth - 2 + "px"

            for (let i = 0; i < mods.length; i++){  // Crée chaque module avec une case à cocher
                const module = document.createElement('div')
                module.className = 'module'
                module.innerHTML = `
                    <h2>${mods[i][0]}</h2>
                    <input type="checkbox" switch ${settingsModules[i].actif === 'true' ? 'checked' : ''}></input>
                `

                const input = module.querySelector('input')
                input.addEventListener('change', async () => {  // Enregistre l'état de la case pour définir l'état du module
                    e.preventDefault()

                    if (input.checked && (settingsModules[2].actif !== 'true' || settingsModules[i].module === 'Notes')){   // État actif
                        displayModule(i)
                    } else {    // État inactif
                        const suppr = container.querySelectorAll(`.${mods[i][0]}`)
                        suppr.forEach(el => {
                            el.remove()
                        });
                    }
                    await saveToBDD('modules', module)
                    window.location.reload()    // Recharge la page pour récupérer les nouvelles données
                })

                liste.appendChild(module)
            }

            body.appendChild(liste)
            liste.style.left = modulesBtn.offsetLeft + 1 + "px"
            liste.style.bottom = modulesBtn.offsetTop + 52 + "px"
            modOpen = true
        } else {
            closeModules()  // Ferme la liste des modules
        }
    })

    var notes

    function closePlacements(){
        /*
        Désactive le mode d'édition
        */
        
        container.classList.remove('edition')
        try {
            notes.getModules().forEach(mod => {
                mod.classList.remove('edition')
            })
            notes.disableEdition()
        } catch (e) {}
        placOpen = false
    }

    placesBtn.addEventListener('click', (e) => {    // Active le mode d'édition
        if (!placOpen){
            if (modOpen) closeModules()
            if (themOpen) closeThemes()

            container.classList.add('edition')

            var modules = []
            if (settingsModules[2].actif !== 'true'){                   //
                mods.forEach(mod => {                                   //
                    const bloc = container.querySelector(mod[2])        //
                    if (bloc && mod[0] != 'Notes') modules.push(bloc)   //
                })                                                      //
            } else {                                                    //
                notes = body.querySelector(mods[2][2])                  //
                notes.enableEdition()                                   //
                modules = notes.getModules()                            // Rend les modules éditables
            }                                                           //
                                                                        //
                                                                        //
            modules.forEach(bloc => {                                   //
                bloc.classList.add('edition')                           //
                bloc.removeEventListener('mousedown', newDrag)          //
                bloc.addEventListener('mousedown', newDrag)             //
            })                                                          //

            placOpen = true
        } else {
            closePlacements()   // Désactive le mode d'édition
        }
    })

    function closeThemes(){
        /*
        Ferme la liste des thèmes
        */

        body.querySelector('.liste').remove()
        liste.innerHTML = ''
        themOpen = false
    }

    themesBtn.addEventListener('click', (e) => {    // Ouvre la liste des thèmes
        if (!themOpen) {
            if (modOpen) closeModules()
            if (placOpen) closePlacements()

            liste.style.width = modulesBtn.offsetWidth - 2 + "px"

            for (let i = 0; i < themes.length; i++){    // Crée chaque module avec un bouton à choix unique
                const theme = document.createElement('div')
                theme.className = 'module'
                theme.innerHTML = `
                    <h2>${themes[i]}</h2>
                    <input type="radio" name="theme" ${themes[i] === settingsThemes[0].theme ? "checked" : ""}></input>
                `

                const input = theme.querySelector('input')
                input.addEventListener('click', async (e) => {  // Sauvegarde le nouveau thème et l'applique
                    if (input.checked) {
                        await saveToBDD('themes', themes[i])
                        window.location.reload()
                    }
                })

                liste.appendChild(theme)
            }

            body.appendChild(liste)
            liste.style.left = themesBtn.offsetLeft + 1 + "px"
            liste.style.bottom = themesBtn.offsetTop + 52 + "px"
            themOpen = true
        } else {
            closeThemes()   // Ferme la liste des thèmes
        }
    })

    async function saveToBDD(setting, target){
        /*
        Commande l'envoie de requêtes au serveur
        */

        if (setting == 'modules') { // Met à jour l'état des modules
            const nom = target.querySelector('h2').textContent
            const input = target.querySelector('input')
            var mod

            settingsModules.forEach(item => {   // Cherche le module qui a été activé / désactivé
                if (item.module == nom) {
                    mod = item
                    item.actif = input.checked + ''
                }
            })

            await fetch(`http://localhost:3000/settingsModules/update/${nom}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    actif: input.checked + '',
                    top: mod.top,
                    left: mod.left,
                    width: mod.width,
                    height: mod.height
                })
            })

        } else if (setting == 'placements') {   // Met à jour la position et la taille du module sélectionné
            var mod

            settingsModules.forEach(item => {   // Cherche le module qui a été modifié
                if (target.classList.contains(item.module)) {
                    mod = item
                }
            })

            if (!mod) return

            return fetch(`http://localhost:3000/settingsModules/update/${target.classList[0]}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    actif: mod.actif,
                    top: target.offsetTop + "px",
                    left: target.offsetLeft + "px",
                    width: target.offsetWidth + "px",
                    height: target.offsetHeight + "px"
                })
            })
        } else if (setting == 'themes') {   // Met à jour le thème global
            return fetch(`http://localhost:3000/settingsThemes/update`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    theme: target
                })
            })
        }
    }

    document.addEventListener('mousemove', (e) => { // Déplace le module sélectionné ou modifie sa taille
        if (selected != null && !resized) { // Déplace le module
            let x = e.clientX - deltaX;
            let y = e.clientY - deltaY;

            const maxX = container.offsetWidth - selected.offsetWidth;
            const maxY = container.offsetHeight - selected.offsetHeight;

            const containerCenterX = container.offsetWidth / 2;
            const containerCenterY = container.offsetHeight / 2;
            const snapTargetX = containerCenterX - (selected.offsetWidth / 2);
            const snapTargetY = containerCenterY - (selected.offsetHeight / 2);
            const tolerance = 20;

            container.classList.remove('snap-x', 'snap-y');

            if (Math.abs(x - snapTargetX) < tolerance) {    // Ancre de centrage horizontale
                x = snapTargetX;
                container.classList.add('snap-x');
            }
            if (Math.abs(y - snapTargetY) < tolerance) {    // Ancre de centrage verticale
                y = snapTargetY;
                container.classList.add('snap-y');
            }

            var autresModules
            autresModules = container.querySelectorAll('appmenu-module, calendar-module');
            if (autresModules.length == 0) autresModules = container.querySelector(mods[2][2]).getModules()
            
            autresModules.forEach(mod => {  // Calcule l'ancrage par rapport aux autres modules
                if (mod === selected) return;

                const modLeft = mod.offsetLeft;
                const modTop = mod.offsetTop;
                const modRight = modLeft + mod.offsetWidth;
                const modBottom = modTop + mod.offsetHeight;

                const selWidth = selected.offsetWidth;
                const selHeight = selected.offsetHeight;

                if (Math.abs(x - modLeft) < tolerance) x = modLeft;
                else if (Math.abs(x - modRight) < tolerance) x = modRight;
                else if (Math.abs((x + selWidth) - modLeft) < tolerance) x = modLeft - selWidth;
                else if (Math.abs((x + selWidth) - modRight) < tolerance) x = modRight - selWidth;

                if (Math.abs(y - modTop) < tolerance) y = modTop;
                else if (Math.abs(y - modBottom) < tolerance) y = modBottom;
                else if (Math.abs((y + selHeight) - modTop) < tolerance) y = modTop - selHeight;
                else if (Math.abs((y + selHeight) - modBottom) < tolerance) y = modBottom - selHeight;
            });

            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));
            
            selected.style.top = y + "px";
            selected.style.left = x + "px";

        } else if (selected != null && resized) {   // Modifie la taille du module
            let targetWidth = Math.max(Math.abs(Left - e.clientX), 10);
            let targetHeight = Math.max(Math.abs(Top - e.clientY), 10);

            const currentRight = Left + targetWidth;
            const currentBottom = Top + targetHeight;
            const tolerance = 20;

            var autresModules
            autresModules = container.querySelectorAll('appmenu-module, calendar-module');
            if (autresModules.length == 0) autresModules = container.querySelector(mods[2][2]).getModules()

            autresModules.forEach(mod => {  // Calcule l'ancrage par rapport aux autres modules
                if (mod === selected) return;

                const modLeft = mod.offsetLeft;
                const modTop = mod.offsetTop;
                const modRight = modLeft + mod.offsetWidth;
                const modBottom = modTop + mod.offsetHeight;

                if (Math.abs(targetWidth - mod.offsetWidth) < tolerance) targetWidth = mod.offsetWidth;
                if (Math.abs(targetHeight - mod.offsetHeight) < tolerance) targetHeight = mod.offsetHeight;

                if (Math.abs(currentRight - modLeft) < tolerance) targetWidth = modLeft - Left;
                else if (Math.abs(currentRight - modRight) < tolerance) targetWidth = modRight - Left;

                if (Math.abs(currentBottom - modTop) < tolerance) targetHeight = modTop - Top;
                else if (Math.abs(currentBottom - modBottom) < tolerance) targetHeight = modBottom - Top;
            });

            const maxWidth = container.offsetWidth - Left;
            const maxHeight = container.offsetHeight - Top;

            targetWidth = Math.max(10, Math.min(targetWidth, maxWidth));
            targetHeight = Math.max(10, Math.min(targetHeight, maxHeight));

            selected.style.width = targetWidth + "px";
            selected.style.height = targetHeight + "px";
        }
    })

    document.addEventListener('mouseup', async () => {  // Sauvegarde la position et la taille du module sélectionné
        if (selected != null) {
            try {
                container.classList.remove('snap-x', 'snap-y')
            } catch (e) {}
            
            await saveToBDD('placements', selected)
            
            deltaX = 0
            deltaY = 0
            resized = false
            try {
                selected.parentNode.style.cursor = 'default'
            } catch (e) {selected.style.cursor = 'default'}
            selected = null

            window.location.reload()
        }
    })
}

init()