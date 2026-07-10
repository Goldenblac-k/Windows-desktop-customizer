async function init() {
    const body = document.querySelector('body')

    const settingsThemes = await fetch('http://localhost:3000/settingsThemes').then(r => r.json())

    const style = document.createElement('style')
    style.innerHTML += `
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
    if (settingsModules[2].actif !== 'true') body.appendChild(style)

    const mods = [
        ['AppMenu', '../AppMenu/appMenu-module.js', 'appmenu-module'],
        ['Calendar', '../Calendar/calendar-module.js', 'calendar-module'],
        ['Notes', '../Notes/notes-module.js', 'notes-module']
    ]

    for(let i = 0; i < settingsModules.length; i++){
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
    if (background.length == 0) await fetch('http://localhost:3000/settings/background/insert', {method:'POST'})

    const img = document.querySelector('img')
    
    async function rafraichirBG() {
        try {
            const bg = await fetch('http://localhost:3000/background/image')

            if (bg.ok) {
                const blob = await bg.blob()
                img.src = URL.createObjectURL(blob)
            } else if (bg.status === 404) {
                await fetch('http://localhost:3000/settings/background/insert', { method: 'POST' })

                await fetch('http://localhost:3000/settings/background/insert', { method: 'POST' })
                    
                const retryBg = await fetch('http://localhost:3000/background/image')
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

    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key == 'R') {
            window.location.reload()
        }
    })
}

init()