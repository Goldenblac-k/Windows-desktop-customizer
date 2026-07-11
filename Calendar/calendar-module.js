class Calendar extends HTMLElement {
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

        shadow.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    color: ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'};
                }

                :host {
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
                    padding: 0px 2px 0px 2px;
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

                .eventModel {
                    flex: 1;
                    padding: 0px 5px 0px 5px;
                    border-radius: 5px;
                    background-color: rgb(101, 191, 250);
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

        btnDay.addEventListener('click', () => switchMode('jour'))
        btnWeek.addEventListener('click', () => switchMode('semaine'))
        btnMonth.addEventListener('click', () => switchMode('mois'))

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

        var events = await fetch('http://localhost:3000/calendar').then(r => r.json())
        const view = await fetch('http://localhost:3000/view').then(r => r.json())

        var currentDate = new Date()
        var currentView = view.length > 0 ? view[0].currentView : 'month'

        window.isOpen = false
        var openedCase = null

        const entry = document.createElement('div')
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

        const evt = document.createElement('div')
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
            var convertHeure = ""
            const convertDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
            if (currentView != 'month') convertHeure = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
            events.forEach(event => {
                if (convertDate == event.date){
                    if ((convertHeure == event.deb && currentView != 'month') || (convertHeure == "" && currentView == 'month')){
                        const eventModel = document.createElement('div')
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
                        ps[0].textContent = event.titre
                        ps[1].textContent = event.date
                        ps[1].style.visibility = 'collapse'
                        ps[2].textContent = event.deb
                        ps[2].style.visibility = 'collapse'
                        ps[3].textContent = event.fin
                        ps[3].style.visibility = 'collapse'
                        ps[4].textContent = event.desc
                        ps[4].style.visibility = 'collapse'
                        ps[5].textContent = event.id
                        ps[5].style.visibility = 'collapse'

                        eventModel.addEventListener('click', () => {
                            openedEvt = eventModel
                            openEvent()
                        })

                        if (currentView == 'month') cell.children[1].appendChild(eventModel)
                        else cell.appendChild(eventModel)
                    }
                }
            })
        }

        function openEntry(date){
            if (openedCase && openedEvt == null){
                entry.querySelector('.dateInput').value = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
                
                if (currentView != 'month'){
                    entry.querySelector('.debInput').value = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
                    entry.querySelector('.finInput').value = `${String((date.getHours() + 1) % 24).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
                }
                shadow.host.parentNode.appendChild(entry)
                entry.querySelector('.descInput').style.minWidth = entry.querySelector('.titleInput').offsetWidth+"px"
                window.isOpen = true
            }    
        }

        function openEvent(){
            if (openedEvt && openedCase == null){
                const ps = openedEvt.querySelectorAll('p')
                evt.querySelector('.titleInput').value = ps[0].textContent
                evt.querySelector('.dateInput').value = ps[1].textContent
                evt.querySelector('.debInput').value = ps[2].textContent
                evt.querySelector('.finInput').value = ps[3].textContent
                evt.querySelector('.descInput').value = ps[4].textContent

                shadow.host.parentNode.appendChild(evt)
                evt.querySelector('.descInput').style.minWidth = evt.querySelector('.titleInput').offsetWidth+"px"
                window.isOpen = true
            }
        }

        function displayDay(){
            display.innerHTML = ''
            display.className = 'day'
            display.style.borderTop = "none"
            horaires.style.visibility = "visible"
            horaires.style.width = '50px'
            container.children[0].style.paddingLeft = "0"
            horaires.parentNode.style.marginBottom = "1px"
            horaires.parentNode.style.overflowY = "auto"

            for (let i = 0; i < daysTitle.children.length; i++){
                daysTitle.children[i].style.visibility = "collapse"
                daysTitle.children[i].style.backgroundColor = ""
            }

            const dayNames = ['LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.', 'DIM.']

            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()

            monthTitle.textContent = monthNames[month]
            yearTitle.textContent = year

            const targetDay = new Date(currentDate)

            const today = new Date()

            const day = daysTitle.children[(targetDay.getDay() + 6) % 7]
            day.style.visibility = "visible"
            day.textContent = dayNames[(targetDay.getDay() + 6) % 7] + ` ${targetDay.getDate()}`

            if (targetDay.toDateString() === today.toDateString()) day.style.backgroundColor = "rgba(136, 207, 255, 0.8)"

            for (let i = 1; i <= 24; i++){
                const timeCell = document.createElement('div')
                timeCell.className = 'horaire'
                timeCell.style.gridRow = i
                timeCell.addEventListener('dblclick', () => {
                    openedCase = timeCell
                    openEntry(new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), i - 1, 0))
                })
                chargeCalendar(new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), i - 1, 0), timeCell)
                display.appendChild(timeCell)
            }
        }

        function displayWeek(){
            display.innerHTML = ''
            display.className = 'week'
            display.style.borderTop = "none"
            horaires.style.visibility = "visible"
            horaires.style.width = '50px'
            container.children[0].style.paddingLeft = "50px"
            horaires.parentNode.style.marginBottom = "1px"
            horaires.parentNode.style.overflowY = "auto"

            for (let i = 0; i < daysTitle.children.length; i++){
                daysTitle.children[i].style.visibility = "visible"
                daysTitle.children[i].style.backgroundColor = ""
            }

            const dayNames = ['LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.', 'DIM.']

            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()

            monthTitle.textContent = monthNames[month]
            yearTitle.textContent = year

            const startOfWeek = new Date(currentDate);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);

            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();

            const today = new Date()
            for (let j = 1; j <= 7; j++){
                const date = new Date(startOfWeek)
                date.setDate(startOfWeek.getDate() + j - 1)

                const day = daysTitle.children[j-1]
                day.textContent = dayNames[j-1] + ` ${date.getDate()}`

                if (date.toDateString() === today.toDateString()) day.style.backgroundColor = "rgba(136, 207, 255, 0.8)"
                
                for (let i = 1; i <= 24; i++){
                    const timeCell = document.createElement('div')
                    timeCell.className = 'horaire'
                    timeCell.style.gridColumn = j
                    timeCell.style.gridRow = i
                    timeCell.addEventListener('dblclick', () => {
                        openedCase = timeCell
                        openEntry(new Date(date.getFullYear(), date.getMonth(), date.getDate(), i - 1, 0))
                    })
                    chargeCalendar(new Date(date.getFullYear(), date.getMonth(), date.getDate(), i - 1, 0), timeCell)
                    display.appendChild(timeCell)
                }
            }
        }

        var caseWidth

        function displayMonth(){
            display.innerHTML = ''
            display.className = 'month'
            display.style.borderTop = `1px solid ${settingsThemes[0].theme === 'Clair' ? 'black' : 'white'}`
            
            horaires.style.visibility = "collapse"
            container.children[0].style.paddingLeft = "0"
            horaires.parentNode.style.marginBottom = "0"
            horaires.parentNode.scrollTop = 0
            horaires.parentNode.style.overflowY = "hidden"

            const dayNames = ['LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.', 'DIM.']

            for (let i = 0; i < daysTitle.children.length; i++){
                daysTitle.children[i].textContent = dayNames[i]
                daysTitle.children[i].style.visibility = "visible"
                daysTitle.children[i].style.backgroundColor = ""
            }

            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()

            monthTitle.textContent = monthNames[month]
            yearTitle.textContent = year

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const prevLastDay = new Date(year, month, 0);

            const lastMonthDays = (firstDay.getDay() + 6) % 7;
            const daysInMonth = lastDay.getDate();
            const daysInPrevMonth = prevLastDay.getDate();

            const nextDays = 42 - lastMonthDays - daysInMonth

            for (let i = lastMonthDays - 1; i >= 0; i--){
                const day = daysInPrevMonth - i
                const dayCell = document.createElement('div')
                dayCell.className = 'case'
                dayCell.innerHTML = `<p>${day}</p><div></div>`
                if (caseWidth) dayCell.style.width = caseWidth
                dayCell.querySelector('p').style.opacity = "0.5"
                dayCell.addEventListener('dblclick', () => {
                    openedCase = dayCell
                    openEntry(new Date(year, month - 1, day))
                })
                chargeCalendar(new Date(year, month - 1, day), dayCell)
                display.appendChild(dayCell)
            }

            const today = new Date()
            for (let i = 1; i <= daysInMonth; i++){
                const dayCell = document.createElement('div')
                dayCell.className = 'case'
                dayCell.innerHTML = `<p>${i}</p><div></div>`
                if (caseWidth) dayCell.style.width = caseWidth
                dayCell.addEventListener('dblclick', () => {
                    openedCase = dayCell
                    openEntry(new Date(year, month, i))
                })
                if (i == today.getDate() && month == today.getMonth() && year == today.getFullYear()) dayCell.style.backgroundColor = "rgba(136, 207, 255, 0.8)"
                chargeCalendar(new Date(year, month, i), dayCell)
                display.appendChild(dayCell)
            }

            for (let i = 1; i <= nextDays; i++){
                const dayCell = document.createElement('div')
                dayCell.className = 'case'
                dayCell.innerHTML = `<p>${i}</p><div></div>`
                if (caseWidth) dayCell.style.width = caseWidth
                dayCell.querySelector('p').style.opacity = "0.5"
                dayCell.addEventListener('dblclick', () => {
                    openedCase = dayCell
                    openEntry(new Date(year, month + 1, i))
                })
                chargeCalendar(new Date(year, month + 1, i), dayCell)
                display.appendChild(dayCell)
            }

            caseWidth = subContainer.querySelectorAll('.case')[0].offsetWidth + "px"
        }

        function selectView(){
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

        selectView()

        btnToday.addEventListener('click', () => {
            currentDate = new Date()
            selectView()
        })

        toLeft.addEventListener('click', () => {
            if (currentView == 'month'){
                currentDate.setMonth(currentDate.getMonth()-1)
            } else if (currentView == 'week'){
                currentDate.setDate(currentDate.getDate() - 7)
            } else currentDate.setDate(currentDate.getDate() - 1)

            selectView()
        })

        toRight.addEventListener('click', () => {
            if (currentView == 'month'){
                currentDate.setMonth(currentDate.getMonth()+1)
            } else if (currentView == 'week'){
                currentDate.setDate(currentDate.getDate() + 7)
            } else currentDate.setDate(currentDate.getDate() + 1)

            selectView()
        })

        function switchMode(newMode){
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
            try {
                if (com == 'insert'){
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
                else if (com == 'update'){
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
                else if (com == 'delete'){
                    await fetch(`http://localhost:3000/calendar/${opened.querySelector(".idEvt").textContent}`, {
                        method: 'DELETE'
                    })
                }
                else if (com == 'view'){
                    await fetch('http://localhost:3000/view/update', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            view: currentView
                        })
                    })
                }

                events = await fetchCalendar()
            } catch(e) {
                console.error('saveToBDD : ',e)
            }
        }

        function deleteEvt(){
            saveToBDD('delete', openedEvt)
            openedEvt.remove()
            closeEntry()
        }

        function saveChangeEvt(){
            if (evt.querySelector('.titleInput').value != ""){
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
            if (entry.querySelector('.titleInput').value != ""){
                const eventModel = document.createElement('div')
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

                eventModel.addEventListener('click', () => {
                    openedEvt = eventModel
                    openEvent()
                })

                if (currentView == 'month') openedCase.children[1].appendChild(eventModel)
                else openedCase.appendChild(eventModel)

                if (window.isOpen) saveToBDD('insert', eventModel)
                closeEntry()
            }
        }

        function closeEntry() {
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

            shadow.host.parentNode.querySelector('.entry').remove()

            openedEvt = null
            openedCase = null
            window.isOpen = false
        }

        document.addEventListener('keydown', (e) => {
            if (e.key == 'Escape' && window.isOpen) {
                closeEntry()
            }

            if (e.key == 'Enter') {
                e.preventDefault()
                if (openedCase) {
                    saveEntry()
                }

                else if (openedEvt) {
                    saveChangeEvt()
                }
            }

            if (e.key == 'Delete' && openedEvt) {
                deleteEvt()
            }
        })

        subContainer.addEventListener('mousedown', (e) => {
            if (e.target.closest('.eventModel') || e.target.closest('input') || e.target.closest('button') || e.target.closest('textarea')) return
            if (currentView == 'month') return

            isDown = true
            subContainer.style.cursor = 'grabbing'
            startY = e.pageY - subContainer.offsetTop
            scrollTop = subContainer.scrollTop
        })

        subContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const y = e.pageY - subContainer.offsetTop;
            const walk = (y - startY) * 1.5;
            subContainer.scrollTop = scrollTop - walk;
        });

        const stopDragging = () => {
            isDown = false
            subContainer.style.cursor = 'default'
        }

        subContainer.addEventListener('mouseup', stopDragging);
        subContainer.addEventListener('mouseleave', stopDragging);
    }
}

customElements.define('calendar-module', Calendar)