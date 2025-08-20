// Phrases to ignore entirely (not teams)
const JUNK_PATTERNS = [
    /^(formerly|ex-)\s*/i,
    /^ally of\b/i,
    /^partner of\b/i,
    /^enemy of\b/i,
    /^rival of\b/i,
    /^student of\b/i,
    /^member of\b/i,
];

// Clean up helpers
function stripParens(s) {
    return s.replace(/\([^)]*$/g, '').replace(/\([^)]*\)/g, '').trim();
}
function isJunk(s) {
    return JUNK_PATTERNS.some(re => re.test(s));
}

// Canonical mapping
const TEAM_RULES = [
    // Marvel teams
    { re: /\bavengers?\b/i, canon: 'Avengers' },
    { re: /\bx-?men\b/i, canon: 'X-Men' },
    { re: /\bx-?force\b/i, canon: 'X-Force' },
    { re: /\bfantastic\s*four\b/i, canon: 'Fantastic Four' },
    { re: /\bguardians?\s+of\s+the\s+galaxy\b/i, canon: 'Guardians of the Galaxy' },
    { re: /\bs\.?h\.?i\.?e\.?l\.?d\.?\b/i, canon: 'S.H.I.E.L.D.' },
    { re: /\bhydra\b/i, canon: 'Hydra' },
    { re: /\bsinister\s+six\b/i, canon: 'Sinister Six' },
    { re: /\bbrotherhood\b/i, canon: 'Brotherhood of Mutants' },
    { re: /\bdefenders\b/i, canon: 'Defenders' },
    { re: /\bthunderbolts\b/i, canon: 'Thunderbolts' },
    { re: /\binhumans?\b/i, canon: 'Inhumans' },
    { re: /\basgardians?\b/i, canon: 'Asgardians' },
    { re: /\bhulk\s+family\b/i, canon: 'Hulk Family' },
    { re: /\bteen\s+brigade\b/i, canon: 'Teen Brigade' },
    { re: /\bexcelsior\b/i, canon: 'Excelsior' },
    { re: /\bdeadpool\b.*corps\b/i, canon: 'Deadpool Corps' },

    // DC teams
    { re: /\bjustice\s+league\b/i, canon: 'Justice League' },
    { re: /\bjustice\s+society\b/i, canon: 'Justice Society' },
    { re: /\bsuicide\s+squad\b/i, canon: 'Suicide Squad' },
    { re: /\blegion\s+of\s+super-?heroes\b/i, canon: 'Legion of Super-Heroes' },
    { re: /\bteen\s+titans?\b/i, canon: 'Teen Titans' },
    { re: /\boutsiders\b/i, canon: 'Outsiders' },
    { re: /\bbirds\s+of\s+prey\b/i, canon: 'Birds of Prey' },
    { re: /\bgreen\s+lantern\s+corps\b/i, canon: 'Green Lantern Corps' },
    { re: /\bbatman\s+family\b/i, canon: 'Batman Family' },
    { re: /\bsuperman\s+family\b/i, canon: 'Superman Family' },
    { re: /\bflash\s+family\b/i, canon: 'Flash Family' },
    { re: /\bdoom\s+patrol\b/i, canon: 'Doom Patrol' },
];

export function canonicalizeOrgs(rawOrgs) {
    if (!Array.isArray(rawOrgs)) return [];
    const out = new Set();

    for (let raw of rawOrgs) {
        if (typeof raw !== 'string') continue;

        const parts = raw.split(/[,;|/]/g).map(s => s.trim()).filter(Boolean);

        for (let part of parts) {
            let s = stripParens(part);
            if (!s) continue;
            if (isJunk(s)) continue;

            let matched = false;
            for (const { re, canon } of TEAM_RULES) {
                if (re.test(s)) {
                    out.add(canon);
                    matched = true;
                }
            }
            if (!matched) {
                if (s.length <= 40 && !/\b(of|the|and)\b.*\b(of|the|and)\b/i.test(s)) {
                    out.add(s);
                }
            }
        }
    }

    return Array.from(out);
}
