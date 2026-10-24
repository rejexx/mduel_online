# Mduel Online

A browser reboot of classic Mduel. The current MVP slice has a two-player
platform arena, local play, online rooms, and sprites from the legacy Mduel
project.

I used to play this with my brother and friends all the time. I wanted a way to
do so online. I found a few old repos online and used AI to bring it back to
life.

## Run locally

Python 3 is the only local requirement:

```powershell
python -m http.server 8080 --directory public
```

Open <http://localhost:8080>.

### Controls

- **Player 1:** Left/right arrows move, up jumps/climbs, down crouches/climbs down; press down while moving to roll. Enter duels.
- **Player 2:** A/D move, W jumps/climbs, S crouches/climbs down; press S while moving to roll. Q duels.
- On touch devices, use the on-screen buttons.
- First player to knock the other player into the pit three times wins.

Choose **Play on this device** for local multiplayer. To play online, create a
room and share its link or six-character code with a friend.

## Online play

The app uses PeerJS's public PeerServer for WebRTC signaling; match state and
gameplay are sent directly between the two browsers. The host simulates the
match, and the guest sends controls and receives state snapshots. Netlify
Functions are not used as a persistent game server.

The public signaling service is suitable for this MVP test, not a production
availability guarantee. Online play requires access to PeerJS's hosted
signaling service and networks that permit a WebRTC connection. If it is
unavailable, use local play.

## Build and deploy

Netlify publishes the static `public/` directory directly; there is no build
step or package installation. The project is linked to GitHub, with `main` as
the production branch. Work on a feature branch and verify its Deploy Preview
before merging.

## Current limitations

- The arena and combat loop are still simplified. Movement, player/platform
  collisions, crouching, rolling, player bump reactions, and pit sinking now
  have a second physics pass, but still need playtesting and tuning against the
  DS reference. Pickups, sound, and other modes are not implemented. Legacy
  character, platform, rope, power-up, pit, and pickup sprite sheets are included.
- Online match setup and synchronization are an initial prototype; there is no
  matchmaking, account system, room persistence, TURN fallback, or hosted
  signaling SLA.
- The legacy repository README declares GPL terms, but the repository has no
  GitHub-detected license file. The assets are credited and accompanied by the
  GPLv3 text; confirm the rights and provenance before a public release.
- No sound files were found in the legacy repo's asset directory; original
  sounds and the remaining game modes have not been restored.

See the ignored local planning document at
`docs/plans/netlify-online-mduel-plan.md` for the longer roadmap.

## Licensing and credits

This reboot is distributed under the GNU General Public License, version 3;
see [LICENSE](LICENSE). The original Mduel artwork under `public/assets/mduel/`
is redistributed from [pwmckenna/mduel](https://github.com/pwmckenna/mduel)
under the GNU GPL terms identified by that repository's README. See
[`public/assets/mduel/NOTICE.txt`](public/assets/mduel/NOTICE.txt) for
provenance and the included art files. The legacy repository itself has no
GitHub-detected license file, so confirm asset provenance and licensing before
making a public release.

The game uses [PeerJS](https://peerjs.com/) from its versioned CDN for online
signaling; PeerJS is separately licensed under the MIT License.
