async function init() {
    /*
    Permet l'usage de fonction asynchrones bloquantes
    */

    const body = document.querySelector('body')

    async function fetchTheme() {
        /*
        Renvoie le thème global du shader, tout en laissant à l'ordinateur le temps de s'allumer
        */

        for (let i = 0; i < 10; i++) {
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

    const style = document.createElement('style')
    style.innerHTML += `
        /* -- Entrée de saisie du calendrier -- */

        .entry {
            position: absolute;
            top: 0;
            z-index: 9999;
            display: flex;
            background-color: rgba(0, 0, 0, 0.5);
            width: 100%;
            height: 100vh;
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
    `

    const settingsModules = await fetch('http://localhost:3000/settingsModules').then(r => r.json())
    if (settingsModules[2].actif !== 'true') body.appendChild(style)    // Injecte les modules directement dans Notes s'il est actif

    const mods = [
        ['AppMenu', '../AppMenu/appMenu-module.js', 'appmenu-module'],
        ['Calendar', '../Calendar/calendar-module.js', 'calendar-module'],
        ['Notes', '../Notes/notes-module.js', 'notes-module']
    ]

    for(let i = 0; i < settingsModules.length; i++){    // Affiche tous les modules actifs
        if(settingsModules[i].actif === 'true' && (settingsModules[2].actif !== 'true' || settingsModules[i].module === 'Notes')) {
            const balise = document.createElement(mods[i][2])
            balise.className = mods[i][0]

            balise.style.position = 'absolute'
            balise.style.zIndex = 1
            balise.style.top = settingsModules[i].top
            balise.style.left = settingsModules[i].left
            balise.style.width = settingsModules[i].width
            balise.style.height = settingsModules[i].height

            body.appendChild(balise)
        }
    }
    
    const background = await fetch('http://localhost:3000/settings/background').then(r => r.json())
    if (background.length == 0) await fetch('http://localhost:3000/settings/background/insert', {method:'POST'})    // Vérifie le bon chemin du fond d'écran

    const img = document.querySelector('img')
    
    async function rafraichirBG() {
        /*
        Vérifie le chemin du fond d'écran et l'importe, met à jour le chemin s'il est obsolète
        */

        try {
            const bg = await fetch('http://localhost:3000/background/image')    // Récupère le fond d'écran

            if (bg.ok) {    // S'il n'y a eu aucun problème
                const blob = await bg.blob()    // Récupère le chemin est contournant les restrictions js
                img.src = URL.createObjectURL(blob)
            } else if (bg.status === 404) { // Si le chemin est obsolète
                await fetch('http://localhost:3000/settings/background/insert', { method: 'POST' }) // Met à jour le chemin du fond d'écran
                    
                const retryBg = await fetch('http://localhost:3000/background/image')   // Réessaye
                if (retryBg.ok) {
                    const blob = await retryBg.blob()
                    img.src = URL.createObjectURL(blob)
                }
            }
        } catch (e) {
            console.error("Erreur lors de la récupération du fond d'écran :", e)
        }
    }

    rafraichirBG()

    window.addEventListener('keydown', (e) => { // Gère les événements clavier
        if (e.ctrlKey && (e.key === 'R' || e.key === 'r')) {    // Recharge la page
            e.preventDefault()
            e.stopImmediatePropagation()
            window.location.reload(true)
        }
    })
}

init()