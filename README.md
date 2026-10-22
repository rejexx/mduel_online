# Mduel Online

A reboot of classic Mduel, with two-player online matches as the primary goal.
The current scaffold is only a local canvas/input smoke test; it does not yet
implement the original game or online play.

## Run locally

Python 3 is the only local requirement for the scaffold:

```powershell
python -m http.server 8080 --directory public
```

Open <http://localhost:8080>. Click **Start input test**, then move the two
placeholder markers with **WASD** and the **arrow keys**. The markers are
temporary test shapes, not original Mduel sprites or physics.

## Deploy

Netlify is configured to publish the static `public/` directory; there is no
build step or dependency installation for this scaffold. GitHub `main` is the
production branch. Pull requests should be checked with a Netlify Deploy
Preview before merging.

## Project plan

See [the Netlify reboot plan](docs/plans/netlify-online-mduel-plan.md) for the
feature and asset inventory, rights checks, architecture, and milestones.
