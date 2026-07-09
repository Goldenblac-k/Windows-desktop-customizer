import Database from 'better-sqlite3'

const db = new Database('./widgets.db')

db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
        id      INTEGER PRIMARY KEY,
        title   TEXT    NOT NULL,
        desc    TEXT,
        top     TEXT,
        left    TEXT,
        zInd    INTEGER,
        r       INTEGER,
        g       INTEGER,
        b       INTEGER
    );

    CREATE TABLE IF NOT EXISTS calendar (
        id      INTEGER PRIMARY KEY,
        titre   TEXT    NOT NULL,
        date    TEXT    NOT NULL,
        deb     TEXT,
        fin     TEXT,
        desc    TEXT
    );

    CREATE TABLE IF NOT EXISTS view (
        currentView  TEXT    PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settingsModules (
        module  TEXT    PRIMARY KEY,
        actif   BOOLEAN NOT NULL,
        top     TEXT    NOT NULL,
        left    TEXT    NOT NULL,
        width   TEXT    NOT NULL,
        height  TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settingsThemes (
        theme   TEXT    PRIMARY KEY
    );
`)

export default db