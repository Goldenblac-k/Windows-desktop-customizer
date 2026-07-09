async function init() {
    const body = document.querySelector('body')

    const modulesBtn = document.querySelector('#modules')
    const placesBtn = document.querySelector('#placements')
    const themesBtn = document.querySelector('#thèmes')

    const container = document.querySelector('.container')

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
    liste.style.width = modulesBtn.offsetWidth - 2 + "px"
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

    const settingsModules = await fetch('http://localhost:3000/settingsModules').then(r => r.json())
    const settingsThemes = await fetch('http://localhost:3000/settingsThemes').then(r => r.json())

    var present = []

    mods.forEach(mod => {
        var check = true
        for(let i = 0; i < settingsModules.length; i++){
            if (mod[0] == settingsModules[i].module) {
                check = false
                break
            }
        }

        if (check) {
            present.push(mod[0])
        }
    })

    if (present.length != 0){
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

    if (settingsThemes.length == 0){
        await fetch(`http://localhost:3000/settingsThemes/insert`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                theme: 'Clair'
            })
        })
    }

    function closeModules(){
        body.querySelector('.liste').remove()
        liste.innerHTML = ''
        modOpen = false
    }

    function displayModule(i) {
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
        const bloc = e.currentTarget
        const rect = bloc.getBoundingClientRect();
        const borderSize = 20;

        const isClickingResizeX = (e.clientX >= rect.right - borderSize);
        const isClickingResizeY = (e.clientY >= rect.bottom - borderSize);

        if (isClickingResizeX && isClickingResizeY) {
            resized = true;
            Top = bloc.offsetTop
            Left = bloc.offsetLeft
            try {
                bloc.parentNode.style.cursor = "se-resize"
            } catch (e) {bloc.style.cursor = "se-resize"}
        } else {
            try {
                bloc.parentNode.style.cursor = 'move'
            } catch (e) {bloc.style.cursor = "move"}
        }

        selected = bloc;
        deltaX = e.clientX - selected.offsetLeft;
        deltaY = e.clientY - selected.offsetTop;
    }

    for (let i = 0; i < mods.length; i++){
        if (settingsModules[i].actif === 'true' && (settingsModules[2].actif !== 'true' || settingsModules[i].module === 'Notes')) displayModule(i)
    }

    modulesBtn.addEventListener('click', (e) => {
        if (!modOpen) {
            if (themOpen) closeThemes()
            if (placOpen) closePlacements()

            for (let i = 0; i < mods.length; i++){
                const module = document.createElement('div')
                module.className = 'module'
                module.innerHTML = `
                    <h2>${mods[i][0]}</h2>
                    <input type="checkbox" switch ${settingsModules[i].actif === 'true' ? 'checked' : ''}></input>
                `

                const input = module.querySelector('input')
                input.addEventListener('change', async () => {
                    e.preventDefault()

                    if (input.checked && (settingsModules[2].actif !== 'true' || settingsModules[i].module === 'Notes')){
                        displayModule(i)
                    } else {
                        const suppr = container.querySelectorAll(`.${mods[i][0]}`)
                        suppr.forEach(el => {
                            el.remove()
                        });
                    }
                    await saveToBDD('modules', module)
                    window.location.reload()
                })

                liste.appendChild(module)
            }

            body.appendChild(liste)
            liste.style.left = modulesBtn.offsetLeft + 1 + "px"
            liste.style.bottom = modulesBtn.offsetTop + 52 + "px"
            modOpen = true
        } else {
            closeModules()
        }
    })

    var notes

    function closePlacements(){
        container.classList.remove('edition')
        try {
            notes.getModules().forEach(mod => {
                mod.classList.remove('edition')
            })
            notes.disableEdition()
        } catch (e) {}
        placOpen = false
    }

    placesBtn.addEventListener('click', (e) => {
        
        if (!placOpen){
            if (modOpen) closeModules()
            if (themOpen) closeThemes()

            container.classList.add('edition')

            var modules = []
            if (settingsModules[2].actif !== 'true'){
                mods.forEach(mod => {
                    const bloc = container.querySelector(mod[2])
                    if (bloc && mod[0] != 'Notes') modules.push(bloc)
                })
            } else {
                notes = body.querySelector(mods[2][2])
                notes.enableEdition()
                modules = notes.getModules()
            }
            

            modules.forEach(bloc => {
                bloc.classList.add('edition')
                bloc.removeEventListener('mousedown', newDrag)
                bloc.addEventListener('mousedown', newDrag)
            })

            placOpen = true
        } else {
            closePlacements()
        }
    })

    function closeThemes(){
        body.querySelector('.liste').remove()
        liste.innerHTML = ''
        themOpen = false
    }

    themesBtn.addEventListener('click', (e) => {
        if (!themOpen) {
            if (modOpen) closeModules()
            if (placOpen) closePlacements()

            for (let i = 0; i < themes.length; i++){
                const theme = document.createElement('div')
                theme.className = 'module'
                theme.innerHTML = `
                    <h2>${themes[i]}</h2>
                    <input type="radio" name="theme" ${themes[i] === settingsThemes[0].theme ? "checked" : ""}></input>
                `

                const input = theme.querySelector('input')
                input.addEventListener('click', async (e) => {
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
            closeThemes()
        }
    })

    async function saveToBDD(setting, target){
        if (setting == 'modules') {
            const nom = target.querySelector('h2').textContent
            const input = target.querySelector('input')
            var mod

            settingsModules.forEach(item => {
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

        } else if (setting == 'placements') {
            var mod

            settingsModules.forEach(item => {
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
        } else if (setting == 'themes') {
            return fetch(`http://localhost:3000/settingsThemes/update`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    theme: target
                })
            })
        }
    }

    document.addEventListener('mousemove', (e) => {
        if (selected != null && !resized) {
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

            if (Math.abs(x - snapTargetX) < tolerance) {
                x = snapTargetX;
                container.classList.add('snap-x');
            }
            if (Math.abs(y - snapTargetY) < tolerance) {
                y = snapTargetY;
                container.classList.add('snap-y');
            }

            var autresModules
            autresModules = container.querySelectorAll('appmenu-module, calendar-module');
            if (autresModules.length == 0) autresModules = container.querySelector(mods[2][2]).getModules()
            
            autresModules.forEach(mod => {
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
        } else if (selected != null && resized) {
            let targetWidth = Math.max(Math.abs(Left - e.clientX), 10);
            let targetHeight = Math.max(Math.abs(Top - e.clientY), 10);

            const currentRight = Left + targetWidth;
            const currentBottom = Top + targetHeight;
            const tolerance = 20;

            var autresModules
            autresModules = container.querySelectorAll('appmenu-module, calendar-module');
            if (autresModules.length == 0) autresModules = container.querySelector(mods[2][2]).getModules()

            autresModules.forEach(mod => {
                if (mod === selected) return;

                const modLeft = mod.offsetLeft;
                const modTop = mod.offsetTop;
                const modRight = modLeft + mod.offsetWidth;
                const modBottom = modTop + mod.offsetHeight;

                if (Math.abs(targetWidth - mod.offsetWidth) < tolerance) {
                    targetWidth = mod.offsetWidth;
                }
                if (Math.abs(targetHeight - mod.offsetHeight) < tolerance) {
                    targetHeight = mod.offsetHeight;
                }

                if (Math.abs(currentRight - modLeft) < tolerance) {
                    targetWidth = modLeft - Left;
                }
                else if (Math.abs(currentRight - modRight) < tolerance) {
                    targetWidth = modRight - Left;
                }

                if (Math.abs(currentBottom - modTop) < tolerance) {
                    targetHeight = modTop - Top;
                }
                else if (Math.abs(currentBottom - modBottom) < tolerance) {
                    targetHeight = modBottom - Top;
                }
            });

            const maxWidth = container.offsetWidth - Left;
            const maxHeight = container.offsetHeight - Top;

            targetWidth = Math.max(10, Math.min(targetWidth, maxWidth));
            targetHeight = Math.max(10, Math.min(targetHeight, maxHeight));

            selected.style.width = targetWidth + "px";
            selected.style.height = targetHeight + "px";
        }
    })

    document.addEventListener('mouseup', async () => {
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