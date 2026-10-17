# Land Buy Checker

A 1-minute risk check before buying land (Bangladesh). Bilingual: English / বাংলা.

## Run
Open `index.html` in any browser. No install, no server needed.

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.com | admin123 |
| User | 252-15-856@diu.edu.bd | land123 |

## Features
- Land check with 5 rules (owner name, namjari, khas land, ongoing case, acquisition): score, status, reasons, "Why this result?", print / PDF
- Land Survey & Plot Information, Road & Building Setback Guide (with "Verification Required" when data is missing)
- Register, login (show / hide password), forgot password (user), user and admin roles
- Report history; admin dashboard, land records, 20 demo plots, 20 demo setback rules

## Files
| File | Purpose |
|---|---|
| `index.html` | Page |
| `style.css` | Styles |
| `app.js` | All logic, demo data and the data-source layer (`SRC`) |
| `database/land_features_seed.sql` | SQLite tables and the 20 + 20 demo rows |

## Notes
- All records are **demo data**, not official land records. Setback numbers are illustrative, not legal advice or building approval.
- This version stores data in the browser (localStorage). Passwords are plain text in this demo only. A real deployment needs a server (Express + SQLite), bcrypt hashing, sessions, and server-side role checks.
- Real data: replace the functions in `SRC` (in `app.js`) with calls to a verified API, and set `data_status` to `verified`.
