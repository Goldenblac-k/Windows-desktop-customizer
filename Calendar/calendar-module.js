class Calendar extends HTMLElement {
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
                    font-family: Arial, Helvetica, sans-serif;
                    color: ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                }

                :host { // Élément parent du shadow
                    display: block;
                    width: 100%;
                    height: 100%;
                    user-select: none;
                    box-sizing: border-box;
                }

                .subContainer::-webkit-scrollbar {
                    display: none;
                }

                .calendar {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    justify-content: center;
                    box-sizing: border-box;
                    overflow: hidden;
                }

                .mainContainer {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    background-color: ${settingsThemes[0].theme === 'Clair' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
                    box-sizing: border-box;
                }

                /* -- Barre supérieure de navigation -- */

                .upperThings {
                    display: flex;
                    flex-direction: column;
                    min-height: 35px;
                    border: 1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    border-bottom: none;
                }

                .btnContainer {
                    display: flex;
                    justify-content: center;
                    min-height: 0;
                    padding: 10px;
                }

                .goToday, .arrows, .displayMode {
                    display: flex;
                    flex: 1;
                    justify-content: center;
                    align-items: center;
                }

                .goToday > div {
                    border: 1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    border-radius: 5px;
                    cursor: pointer;
                }

                .arrows {
                    flex: 2;
                    justify-content: space-evenly;
                    align-items: center;
                }

                .left {
                    margin-left: 30px;
                    cursor: pointer;
                }

                .right {
                    margin-right: 30px;
                    cursor: pointer;
                }

                .monthAndYear{
                    display: flex;
                    flex: 1;
                    justify-content: center;
                    padding: 10px;
                }

                .goToday h1, .displayMode h1, .arrows h1 {
                    font-size: clamp(0.5rem, 1.5vw, 1rem);
                    padding: 5px;
                    font-weight: lighter;
                }

                .monthAndYear > h1 {
                    font-size: clamp(0.8rem, 2vw, 2rem);
                }

                .displayMode > div {
                    display: flex;
                    border: 1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    border-radius: 20px;
                }

                .displayMode h1 {
                    cursor: pointer;
                }

                .semaine {
                    border: 1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                    border-top: none;
                    border-bottom: none;
                }

                .selectedMode {
                    color: rgb(0, 110, 255);
                }

                .upperThings > h1 {
                    font-size: 200%;
                    text-align: center;
                    margin-bottom: 15px;
                }

                .monthTitle {
                    margin-right: 15px;
                }

                /* -- Conteneur du calendrier -- */

                .calendarContainer {
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    border: 1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                }

                .horaires {
                    display: grid;
                    grid-template-rows: repeat(23, 1fr);
                    margin-top: 26px;
                    margin-bottom: 26px;
                    gap: 3px;
                    overflow-x: hidden;
                    width: 0px;
                    height: max-content;
                }

                .horaires > h1 {
                    font-size: 100%;
                    min-height: 50px;
                    align-content: center;
                    text-align: right;
                    padding-right: 3px;
                }

                .subContainer {
                    display: flex;
                    box-sizing: border-box;
                }

                .daysTitle {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 3px;
                    margin: 2px 2px 1px 2px;
                }

                .daysTitle > h1 {
                    flex: 1;
                    font-size: 100%;
                    text-align: center;
                }

                .horaires + div {
                    display: grid;
                    flex: 1;
                }

                .horaires + div > .horaire {
                    min-height: 50px;
                }

                .horaire {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    overflow-y: auto;
                    padding: 0px 2px 0px 10px;
                    border: 1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                }

                .day {
                    padding: 1px;
                    grid-template-rows: repeat(24, 1fr);
                    gap: 1px;
                }

                .week {
                    padding: 1px;
                    grid-template-columns: repeat(7, 1fr);
                    grid-template-rows: repeat(24, 1fr);
                    gap: 1px;
                }

                .month {
                    padding: 1px;
                    grid-template-columns: repeat(7, 1fr);
                    grid-template-rows: repeat(6, 1fr);
                    gap: 1px;
                }

                .case {
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    min-width: 0;
                    border: 1px solid rgb(128, 128, 128);
                }

                .case > p {
                    padding: 5px;
                }

                .case > div {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-height: 0;
                    gap: 1px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 0px 2px 0px 2px;
                }

                .eventModel {
                    flex: 1;
                    padding: 0px 5px 0px 5px;
                    border-radius: 5px;
                    background-color: rgb(101, 191, 250);
                }

                /* -- Entrée pour la saisie d'informations -- */

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

            <div class="calendar">
                <div class="mainContainer">
                    <div class="upperThings">
                        <div class="btnContainer">
                            <div class="goToday">
                                <div>
                                    <h1>Aujourd'hui</h1>
                                </div>
                            </div>
                            
                            <div class="arrows">
                                <div class="left">
                                    <h1><</h1>
                                </div>
                                <div class="monthAndYear">
                                    <h1 class="monthTitle"></h1>
                                    <h1 class="yearTitle"></h1>
                                </div>
                                <div class="right">
                                    <h1>></h1>
                                </div>
                            </div>
                            
                            <div class="displayMode">
                                <div>
                                    <h1 class="jour">Jour</h1>
                                    <h1 class="semaine">Semaine</h1>
                                    <h1 class="mois selectedMode">Mois</h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="calendarContainer">
                        <div class="daysTitle">
                            <h1>LUN.</h1>
                            <h1>MAR.</h1>
                            <h1>MER.</h1>
                            <h1>JEU.</h1>
                            <h1>VEN.</h1>
                            <h1>SAM.</h1>
                            <h1>DIM.</h1>
                        </div>

                        <div class="subContainer">
                            <div class="horaires">
                                <h1>1:00</h1>
                                <h1>2:00</h1>
                                <h1>3:00</h1>
                                <h1>4:00</h1>
                                <h1>5:00</h1>
                                <h1>6:00</h1>
                                <h1>7:00</h1>
                                <h1>8:00</h1>
                                <h1>9:00</h1>
                                <h1>10:00</h1>
                                <h1>11:00</h1>
                                <h1>12:00</h1>
                                <h1>13:00</h1>
                                <h1>14:00</h1>
                                <h1>15:00</h1>
                                <h1>16:00</h1>
                                <h1>17:00</h1>
                                <h1>18:00</h1>
                                <h1>19:00</h1>
                                <h1>20:00</h1>
                                <h1>21:00</h1>
                                <h1>22:00</h1>
                                <h1>23:00</h1>
                            </div>
                            
                            <div class="month">
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `

        const body = shadow.children[1]

        const container = body.querySelector('.calendarContainer')

        const btnToday = body.querySelector('.goToday')

        const toLeft = body.querySelector('.left')
        const toRight = body.querySelector('.right')

        const btnDay = body.querySelector('.jour')
        const btnWeek = body.querySelector('.semaine')
        const btnMonth = body.querySelector('.mois')

        btnDay.addEventListener('click', () => switchMode('jour'))      //
        btnWeek.addEventListener('click', () => switchMode('semaine'))  // Modifie le mode d'affichage
        btnMonth.addEventListener('click', () => switchMode('mois'))    //

        const daysTitle = body.querySelector('.daysTitle')

        const display = body.querySelector('.month')
        const horaires = body.querySelector('.horaires')
        const monthTitle = body.querySelector('.monthTitle')
        const yearTitle = body.querySelector('.yearTitle')

        const subContainer = body.querySelector('.subContainer')

        var isDown = false
        var startY
        var scrollTop

        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        var events = await fetch('http://localhost:3000/calendar').then(r => r.json())  // Récupère tous les événements enregistrés
        const view = await fetch('http://localhost:3000/view').then(r => r.json())  // Récupère le dernier mode d'affichage (pour la visualisation sur navigateur)

        var currentDate = new Date()
        var currentView = view.length > 0 ? view[0].currentView : 'month'

        window.isOpen = false
        var openedCase = null

        const entry = document.createElement('div') // Crée le bloc de saisie d'un événement
        entry.className = "entry"
        entry.innerHTML = `
            <div class="entryContainer">
                <input class="titleInput" type="text" placeholder="Titre">

                <div>
                    <label>Date</label>
                    <input class='dateInput' type="date">
                </div>
                
                <div>
                    <label>Heure de début</label>
                    <input class="debInput" type="time">
                </div>
                
                <div>
                    <label>Heure de fin</label>
                    <input class="finInput" type="time">
                </div>
                
                <textarea class="descInput" placeholder="Description"></textarea>

                <div>
                    <button type="button" class='addBtn'>Ajouter</button>
                    <button type="button" class='returnBtn'>Retour</button>
                </div>
            </div>
        `

        entry.querySelector('.addBtn').addEventListener('click', saveEntry)
        entry.querySelector('.returnBtn').addEventListener('click', closeEntry)

        var openedEvt = null

        const evt = document.createElement('div')   // Crée le bloc de détail d'un événement
        evt.className = 'entry'
        evt.innerHTML = `
            <div class="entryContainer">
                <input class="titleInput" type="text" placeholder="Titre">

                <div>
                    <label>Date</label>
                    <input class='dateInput' type="date">
                </div>
                
                <div>
                    <label>Heure de début</label>
                    <input class="debInput" type="time">
                </div>
                
                <div>
                    <label>Heure de fin</label>
                    <input class="finInput" type="time">
                </div>
                
                <textarea class="descInput" placeholder="Description"></textarea>

                <div>
                    <button type="button" class='saveBtn'>Modifier</button>
                    <button type="button" class='deleteBtn'>Supprimer</button>
                    <button type="button" class='returnBtn'>Retour</button>
                </div>
            </div>
        `

        evt.querySelector('.saveBtn').addEventListener('click', saveChangeEvt)
        evt.querySelector('.deleteBtn').addEventListener('click', deleteEvt)
        evt.querySelector('.returnBtn').addEventListener('click', closeEntry)

        function chargeCalendar(date, cell){
            /*
            Charge les événements correspondants à la date donnée et les insère dans la case ciblée
            */

            var convertHeure = ""
            const convertDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`  // Convertie la date en format String approprié
            if (currentView != 'month') convertHeure = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}` // Convertie l'heure en format String approprié
            
            events.forEach(event => {
                if (convertDate == event.date){ // Si l'événement existe pour cette date
                    if ((convertHeure == event.deb && currentView != 'month') || (convertHeure == "" && currentView == 'month')){   // Vérifie si l'événement contient un horaire pour le faire correspondre au bon mode d'affichage
                        const eventModel = document.createElement('div')    // Crée le bloc d'événement
                        eventModel.className = "eventModel"
                        eventModel.innerHTML = `
                            <p class="titleEvt"></p>
                            <p class="dateEvt"></p>
                            <p class="debEvt"></p>
                            <p class="finEvt"></p>
                            <p class="descEvt"></p>
                            <p class="idEvt"></p>
                        `
                        const ps = eventModel.querySelectorAll('p') //
                        ps[0].textContent = event.titre             //
                        ps[1].textContent = event.date              //
                        ps[1].style.visibility = 'collapse'         //
                        ps[2].textContent = event.deb               //
                        ps[2].style.visibility = 'collapse'         // N'affiche que le titre de l'événement
                        ps[3].textContent = event.fin               // pour ne pas surcharger l'affichage
                        ps[3].style.visibility = 'collapse'         //
                        ps[4].textContent = event.desc              //
                        ps[4].style.visibility = 'collapse'         //
                        ps[5].textContent = event.id                //
                        ps[5].style.visibility = 'collapse'         //

                        eventModel.addEventListener('click', () => {    // Ouvre le détail de l'événement lors d'un clic
                            openedEvt = eventModel
                            openEvent()
                        })

                        if (currentView == 'month') cell.children[1].appendChild(eventModel)    // Ajoute l'événement au bon endroit
                        else cell.appendChild(eventModel)                                       // selon le mode d'affichage
                    }
                }
            })
        }

        function openEntry(date){
            /*
            Ouvre l'entrée pour la saisie d'un événement associé à la date (et heure) ciblée
            */

            if (openedCase && openedEvt == null){
                entry.querySelector('.dateInput').value = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`    //
                                                                                                                                                                            //
                if (currentView != 'month'){                                                                                                                                // Convertie la date et les horaires
                    entry.querySelector('.debInput').value = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`                      // en format String approprié
                    entry.querySelector('.finInput').value = `${String((date.getHours() + 1) % 24).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`           //
                }                                                                                                                                                           //

                shadow.host.parentNode.appendChild(entry)   // Ouvre l'entrée de saisie au-dessus de tous les modules
                entry.querySelector('.descInput').style.minWidth = entry.querySelector('.titleInput').offsetWidth+"px"
                window.isOpen = true
            }    
        }

        function openEvent(){
            /*
            Ouvre le détail de l'événement ciblé
            */

            if (openedEvt && openedCase == null){
                const ps = openedEvt.querySelectorAll('p')                  //
                evt.querySelector('.titleInput').value = ps[0].textContent  //
                evt.querySelector('.dateInput').value = ps[1].textContent   // Initialise les données selon
                evt.querySelector('.debInput').value = ps[2].textContent    // le détail de l'événement
                evt.querySelector('.finInput').value = ps[3].textContent    //
                evt.querySelector('.descInput').value = ps[4].textContent   //

                shadow.host.parentNode.appendChild(evt) // Ouvre l'entrée de saisie au-dessus de tous les modules
                evt.querySelector('.descInput').style.minWidth = evt.querySelector('.titleInput').offsetWidth+"px"
                window.isOpen = true
            }
        }

        function displayDay(){
            /*
            Affiche le calendrier au format par jour
            */

            display.innerHTML = ''                                  //
            display.className = 'day'                               //
            display.style.borderTop = "none"                        //
            horaires.style.visibility = "visible"                   //
            horaires.style.width = '50px'                           //
            container.children[0].style.paddingLeft = "0"           //
            horaires.parentNode.style.marginBottom = "1px"          // Organise le contenu du calendrier
            horaires.parentNode.style.overflowY = "auto"            //
                                                                    //
            for (let i = 0; i < daysTitle.children.length; i++){    //
                daysTitle.children[i].style.visibility = "collapse" //
                daysTitle.children[i].style.backgroundColor = ""    //
            }                                                       //

            const dayNames = ['LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.', 'DIM.']

            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()

            monthTitle.textContent = monthNames[month]
            yearTitle.textContent = year

            const targetDay = new Date(currentDate)

            const today = new Date()

            const day = daysTitle.children[(targetDay.getDay() + 6) % 7]                            //
            day.style.visibility = "visible"                                                        // Affiche le nom du jour correspondant à la date
            day.textContent = dayNames[(targetDay.getDay() + 6) % 7] + ` ${targetDay.getDate()}`    //

            if (targetDay.toDateString() === today.toDateString()) day.style.backgroundColor = "rgba(136, 207, 255, 0.8)"   // S'il s'agit d'aujourd'hui

            for (let i = 1; i <= 24; i++){  // Crée et insert les 24 horaires de la journée
                const timeCell = document.createElement('div')
                timeCell.className = 'horaire'
                timeCell.style.gridRow = i
                timeCell.addEventListener('dblclick', () => {   // Ouvre l'entrée de saisie d'événement
                    openedCase = timeCell
                    openEntry(new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), i - 1, 0))
                })
                chargeCalendar(new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), i - 1, 0), timeCell)    // Charge les événements existants
                display.appendChild(timeCell)
            }
        }

        function displayWeek(){
            /*
            Affiche le calendrier au format par semaine
            */

            display.innerHTML = ''                                  //
            display.className = 'week'                              //
            display.style.borderTop = "none"                        //
            horaires.style.visibility = "visible"                   //
            horaires.style.width = '50px'                           //
            container.children[0].style.paddingLeft = "50px"        //
            horaires.parentNode.style.marginBottom = "1px"          // Organise le contenu du calendrier
            horaires.parentNode.style.overflowY = "auto"            //
                                                                    //
            for (let i = 0; i < daysTitle.children.length; i++){    //
                daysTitle.children[i].style.visibility = "visible"  //
                daysTitle.children[i].style.backgroundColor = ""    //
            }                                                       //

            const dayNames = ['LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.', 'DIM.']

            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()

            monthTitle.textContent = monthNames[month]
            yearTitle.textContent = year

            const startOfWeek = new Date(currentDate);                          //
            const day = startOfWeek.getDay();                                   //
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);    //
            startOfWeek.setDate(diff);                                          // Initialise les informations de la semaine
                                                                                //
            const lastDay = new Date(year, month + 1, 0);                       //
            const daysInMonth = lastDay.getDate();                              //

            const today = new Date()
            for (let j = 1; j <= 7; j++){   // Crée les 7 jours de la semaine et défini de quel jour il s'agit
                const date = new Date(startOfWeek)
                date.setDate(startOfWeek.getDate() + j - 1)

                const day = daysTitle.children[j-1]
                day.textContent = dayNames[j-1] + ` ${date.getDate()}`

                if (date.toDateString() === today.toDateString()) day.style.backgroundColor = "rgba(136, 207, 255, 0.8)"    // S'il s'agit d'aujourd'hui
                
                for (let i = 1; i <= 24; i++){  // Crée et insert les 24 horaires de la journée
                    const timeCell = document.createElement('div')
                    timeCell.className = 'horaire'
                    timeCell.style.gridColumn = j
                    timeCell.style.gridRow = i
                    timeCell.addEventListener('dblclick', () => {   // Ouvre l'entrée de saisie d'événement
                        openedCase = timeCell
                        openEntry(new Date(date.getFullYear(), date.getMonth(), date.getDate(), i - 1, 0))
                    })
                    chargeCalendar(new Date(date.getFullYear(), date.getMonth(), date.getDate(), i - 1, 0), timeCell)   // Charge les événements existants
                    display.appendChild(timeCell)
                }
            }
        }

        var caseWidth

        function displayMonth(){
            /*
            Affiche le calendrier au format par mois
            */

            display.innerHTML = ''                                                                              //
            display.className = 'month'                                                                         //
            display.style.borderTop = `1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'}`    //
                                                                                                                //
            horaires.style.visibility = "collapse"                                                              //
            container.children[0].style.paddingLeft = "0"                                                       //
            horaires.parentNode.style.marginBottom = "0"                                                        //
            horaires.parentNode.scrollTop = 0                                                                   //
            horaires.parentNode.style.overflowY = "hidden"                                                      // Organise le contenu du calendrier
                                                                                                                //
            const dayNames = ['LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.', 'DIM.']                           //
                                                                                                                //
            for (let i = 0; i < daysTitle.children.length; i++){                                                //
                daysTitle.children[i].textContent = dayNames[i]                                                 //
                daysTitle.children[i].style.visibility = "visible"                                              //
                daysTitle.children[i].style.backgroundColor = ""                                                //
            }                                                                                                   //

            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()

            monthTitle.textContent = monthNames[month]
            yearTitle.textContent = year

            const firstDay = new Date(year, month, 1);          //
            const lastDay = new Date(year, month + 1, 0);       //
            const prevLastDay = new Date(year, month, 0);       //
                                                                //
            const lastMonthDays = (firstDay.getDay() + 6) % 7;  // Initialise les mois précédent, actuel et suivant
            const daysInMonth = lastDay.getDate();              //
            const daysInPrevMonth = prevLastDay.getDate();      //
                                                                //
            const nextDays = 42 - lastMonthDays - daysInMonth   //

            for (let i = lastMonthDays - 1; i >= 0; i--){   // Affiche les jours du mois précédent
                const day = daysInPrevMonth - i
                const dayCell = document.createElement('div')   // Crée la case du jour
                dayCell.className = 'case'
                dayCell.innerHTML = `<p>${day}</p><div></div>`
                dayCell.querySelector('p').style.opacity = "0.5"

                if (caseWidth) dayCell.style.width = caseWidth  // Impose la taille des cellules au grid 

                dayCell.addEventListener('dblclick', () => {    // Ouvre l'entrée de saisie d'événement
                    openedCase = dayCell
                    openEntry(new Date(year, month - 1, day))
                })

                chargeCalendar(new Date(year, month - 1, day), dayCell) // Charge les événements du mois précédent
                display.appendChild(dayCell)
            }

            const today = new Date()
            for (let i = 1; i <= daysInMonth; i++){ // Affiche les jours du mois actuel
                const dayCell = document.createElement('div')   // Crée la case du jour
                dayCell.className = 'case'
                dayCell.innerHTML = `<p>${i}</p><div></div>`
                if (caseWidth) dayCell.style.width = caseWidth

                dayCell.addEventListener('dblclick', () => {    // Ouvre l'entrée de saisie d'événement
                    openedCase = dayCell
                    openEntry(new Date(year, month, i))
                })

                if (i == today.getDate() && month == today.getMonth() && year == today.getFullYear()) dayCell.style.backgroundColor = "rgba(136, 207, 255, 0.8)"    // S'il s'agit d'aujourd'hui
                chargeCalendar(new Date(year, month, i), dayCell)   // Charge les événements du mois actuel
                display.appendChild(dayCell)
            }

            for (let i = 1; i <= nextDays; i++){    // Affiche les jours du mois suivant
                const dayCell = document.createElement('div')   // Crée la case du jour
                dayCell.className = 'case'
                dayCell.innerHTML = `<p>${i}</p><div></div>`
                dayCell.querySelector('p').style.opacity = "0.5"
                if (caseWidth) dayCell.style.width = caseWidth

                dayCell.addEventListener('dblclick', () => {    // Ouvre l'entrée de saisie d'événement
                    openedCase = dayCell
                    openEntry(new Date(year, month + 1, i))
                })

                chargeCalendar(new Date(year, month + 1, i), dayCell)   // Charge les événements du mois suivant
                display.appendChild(dayCell)
            }

            caseWidth = subContainer.querySelectorAll('.case')[0].offsetWidth + "px"    // Enregistre la taille universelle des cases du mode d'affichage par mois
        }

        function selectView(){
            /*
            Affiche le format de calendrier correspondant au mode d'affichage
            */

            btnDay.className = "jour"
            btnWeek.className = "semaine"
            btnMonth.className = "mois"

            if (currentView == "day") {
                btnDay.className = "jour selectedMode"
                displayDay()
            }
            else if (currentView == "week"){
                btnWeek.className = "semaine selectedMode"
                displayWeek()
            } 
            else {
                btnMonth.className = "mois selectedMode"
                displayMonth()
            }
        }

        selectView()    // Initialise l'affichage au format par mois

        btnToday.addEventListener('click', () => {  // Retourne à la date du jour
            currentDate = new Date()
            selectView()
        })

        toLeft.addEventListener('click', () => {    // Passe au jour / semaine / mois précédent
            if (currentView == 'month'){
                currentDate.setMonth(currentDate.getMonth()-1)
            } else if (currentView == 'week'){
                currentDate.setDate(currentDate.getDate() - 7)
            } else currentDate.setDate(currentDate.getDate() - 1)

            selectView()
        })

        toRight.addEventListener('click', () => {   // Passe au jour / semaine / mois suivant
            if (currentView == 'month'){
                currentDate.setMonth(currentDate.getMonth()+1)
            } else if (currentView == 'week'){
                currentDate.setDate(currentDate.getDate() + 7)
            } else currentDate.setDate(currentDate.getDate() + 1)

            selectView()
        })

        function switchMode(newMode){
            /*
            Modifie le mode d'affichage selon le bouton appuyé
            */

            if (newMode == "jour"){
                currentView = "day"
            } else if (newMode == "semaine"){
                currentView = "week"
            } else {
                currentView = "month"
            }

            saveToBDD('view')
            selectView()
        }

        async function saveToBDD(com, opened){
            /*
            Commande l'envoie de requêtes au serveur
            */
           
            try {
                if (com == 'insert'){   // Ajoute un événement
                    const result = await fetch(`http://localhost:3000/calendar`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            titre: opened.querySelector('.titleEvt').textContent,
                            date: opened.querySelector('.dateEvt').textContent,
                            deb: opened.querySelector('.debEvt').textContent,
                            fin: opened.querySelector('.finEvt').textContent,
                            desc: opened.querySelector('.descEvt').textContent
                        })
                    })

                    const data = await result.json()
                    opened.querySelector('.idEvt').textContent = data.id
                }
                else if (com == 'update'){  // Met à jour un événement
                    await fetch(`http://localhost:3000/calendar/${opened.querySelector(".idEvt").textContent}`, {
                        method: 'PATCH',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            titre: opened.querySelector('.titleEvt').textContent,
                            date: opened.querySelector('.dateEvt').textContent,
                            deb: opened.querySelector('.debEvt').textContent,
                            fin: opened.querySelector('.finEvt').textContent,
                            desc: opened.querySelector('.descEvt').textContent
                        })
                    })
                }
                else if (com == 'delete'){  // Supprime un événement
                    await fetch(`http://localhost:3000/calendar/${opened.querySelector(".idEvt").textContent}`, {
                        method: 'DELETE'
                    })
                }
                else if (com == 'view'){    // Met à jour le mode d'affichage enregistré
                    await fetch('http://localhost:3000/view/update', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            view: currentView
                        })
                    })
                }

                events = await fetchCalendar()  // Récupère la nouvelle version des événements
            } catch(e) {
                console.error('saveToBDD : ',e)
            }
        }

        function deleteEvt(){
            /*
            Supprime un événement
            */

            saveToBDD('delete', openedEvt)
            openedEvt.remove()
            closeEntry()
        }

        function saveChangeEvt(){
            /*
            Enregistre les modifications d'un événement
            */

            if (evt.querySelector('.titleInput').value != ""){  // Oblige la saisie du titre au minimum
                const ps = openedEvt.querySelectorAll('p')
                ps[0].textContent = evt.querySelector('.titleInput').value
                ps[1].textContent = evt.querySelector('.dateInput').value
                ps[2].textContent = evt.querySelector('.debInput').value
                ps[3].textContent = evt.querySelector('.finInput').value
                ps[4].textContent = evt.querySelector('.descInput').value

                saveToBDD('update', openedEvt)
                closeEntry()
            }
        }

        function saveEntry(id = null){
            /*
            Enregistre un nouvel événement
            */

            if (entry.querySelector('.titleInput').value != ""){    // Oblige la saisie du titre au minimum
                const eventModel = document.createElement('div')    // Crée le bloc de l'événement
                eventModel.className = "eventModel"
                eventModel.innerHTML = `
                    <p class="titleEvt"></p>
                    <p class="dateEvt"></p>
                    <p class="debEvt"></p>
                    <p class="finEvt"></p>
                    <p class="descEvt"></p>
                    <p class="idEvt"></p>
                `

                const ps = eventModel.querySelectorAll('p')
                ps[0].textContent = entry.querySelector('.titleInput').value
                ps[1].textContent = entry.querySelector('.dateInput').value
                ps[1].style.visibility = 'collapse'
                ps[2].textContent = entry.querySelector('.debInput').value
                ps[2].style.visibility = 'collapse'
                ps[3].textContent = entry.querySelector('.finInput').value
                ps[3].style.visibility = 'collapse'
                ps[4].textContent = entry.querySelector('.descInput').value
                ps[4].style.visibility = 'collapse'
                ps[5].style.visibility = 'collapse'

                eventModel.addEventListener('click', () => {    // Ouvre le détail de l'événement lors d'un clic
                    openedEvt = eventModel
                    openEvent()
                })

                if (currentView == 'month') openedCase.children[1].appendChild(eventModel)  // Insert le bloc de l'événement
                else openedCase.appendChild(eventModel)                                     // selon le mode d'affichage

                if (window.isOpen) saveToBDD('insert', eventModel)
                closeEntry()
            }
        }

        function closeEntry() { // Ferme l'entrée de saisie ou le détail d'un événement
            if (openedCase) {
                entry.querySelector('.titleInput').value = ""
                entry.querySelector('.dateInput').value = ""
                entry.querySelector('.debInput').value = ""
                entry.querySelector('.finInput').value = ""
                entry.querySelector('.descInput').value = ""
            }

            if (openedEvt) {
                evt.querySelector('.titleInput').value = ""
                evt.querySelector('.dateInput').value = ""
                evt.querySelector('.debInput').value = ""
                evt.querySelector('.finInput').value = ""
                evt.querySelector('.descInput').value = ""
            }

            shadow.host.parentNode.querySelector('.entry').remove() // Retire la pop-up

            openedEvt = null
            openedCase = null
            window.isOpen = false
        }

        document.addEventListener('keydown', (e) => {   // Gère les événements clavier
            if (e.key == 'Escape' && window.isOpen) {   // Ferme toute pop-up ouverte
                closeEntry()
            }

            if (e.key == 'Enter') { // Sauvegarde ou modifie un événement
                e.preventDefault()
                if (openedCase) {
                    saveEntry()
                }

                else if (openedEvt) {
                    saveChangeEvt()
                }
            }

            if (e.key == 'Delete' && openedEvt) {   // Supprime un événement ouvert en détail
                deleteEvt()
            }
        })

        subContainer.addEventListener('mousedown', (e) => {         //
            if (e.target.closest('.eventModel') ||                  //
                e.target.closest('input') ||                        //
                e.target.closest('button') ||                       //
                e.target.closest('textarea')) return                //
            if (currentView == 'month') return                      //
                                                                    //
            isDown = true                                           //
            subContainer.style.cursor = 'grabbing'                  //
            startY = e.pageY - subContainer.offsetTop               //
            scrollTop = subContainer.scrollTop                      //
        })                                                          //
                                                                    //
        subContainer.addEventListener('mousemove', (e) => {         // Permet le scrolling
            if (!isDown) return;                                    // manuel du calendrier
            e.preventDefault();                                     //
            const y = e.pageY - subContainer.offsetTop;             //
            const walk = (y - startY) * 1.5;                        //
            subContainer.scrollTop = scrollTop - walk;              //
        });                                                         //
                                                                    //
        const stopDragging = () => {                                //
            isDown = false                                          //
            subContainer.style.cursor = 'default'                   //
        }                                                           //
                                                                    //
        subContainer.addEventListener('mouseup', stopDragging);     //
        subContainer.addEventListener('mouseleave', stopDragging);  //
    }
}

customElements.define('calendar-module', Calendar)