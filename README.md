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

- **Player 1:** Left/right arrows move, up jumps/climbs, down crouches/climbs down; press down while moving to roll. Press Enter to duel or fire a pickup.
- **Player 2:** A/D move, W jumps/climbs, S crouches/climbs down; press S while moving to roll. Press Q to duel or fire a pickup.
- Jump direction is set at takeoff; you cannot steer during a jump or collision fall.
- On a rope, release up/down to hold position; press left/right to jump off.
- Pick up boots and press duel/fire while grounded to use their boosted jump; the boots stay equipped. A shield blocks attacks from the direction you're facing, and the gun has five shots.
- On touch devices, use the on-screen buttons.
- First player to knock the other player into the pit three times wins.

Choose **Play on this device** for local multiplayer. To play online, host a
game and share the code shown above the arena (or copy the invite link). The
host waits in the arena until a friend joins; opening an invite link connects
the guest automatically.

## Online play

The app uses PeerJS's public PeerServer for WebRTC signaling; match state and
gameplay are sent directly between the two browsers. The host simulates the
match, and the guest sends controls and receives state snapshots. Netlify
Functions are not used as a persistent game server.

The public signaling service is suitable for this MVP test, not a production
availability guarantee. Online play requires access to PeerJS's hosted
signaling service and networks that permit a WebRTC connection. If it is
unavailable, use local play.

## Power-up roster and rulesets

The classic roster below is taken from the pickup list in
[pwmckenna/mduel](https://github.com/pwmckenna/mduel/blob/master/app/scripts/mduel/pickups.js).
The DS roster is from the pickup enum and collection handling in
[pospi/mduel-ds](https://github.com/pospi/mduel-ds/blob/master/code/source/pickup.h)
and [`pickup.cpp`](https://github.com/pospi/mduel-ds/blob/master/code/source/pickup.cpp).
“DS addition” means it is present in the DS roster but not in that classic
JavaScript roster; it does not claim to establish when the power-up first
appeared in every version of Mduel.

| Power-up | Roster | What it does in the reference game | Browser remake |
| --- | --- | --- | --- |
| Skull | Classic and DS | Immediately kills the player who collects it. | Not implemented |
| Lightning / 1000V | Classic and DS | Electrifies its holder; player contact can kill the unprotected opponent. | Not implemented |
| Invisibility | Classic and DS | Temporarily makes its holder invisible. | Not implemented |
| Mine | Classic and DS | Lets its holder place a mine as a trap. | Not implemented |
| Gun | Classic and DS | Fires a limited-use attack; the DS version has five shots. | Implemented as a five-shot projectile with knockback; hit behavior is simplified from the reference. |
| Explode / TNT | Classic and DS | Explodes floor/platform tiles; TNT remains an active pickup that collides with tiles. | Not implemented |
| Boots | DS addition | Gives the holder a stronger jump when activated. | Implemented; persistent, activated with duel/fire while grounded. |
| Grenade | DS addition | Throws an explosive projectile. | Not implemented |
| Puck | DS addition | Throws a puck projectile. | Not implemented |
| Chute (parachute) | DS addition | Slows falling while activated in the air. | Not implemented |
| Hook | DS addition | Grabs a nearby rope or floor edge to recover/climb. | Not implemented |
| Warp | DS addition | Teleports its holder when activated. | Not implemented |
| Magnet | DS addition | Pulls pickups toward its holder and can pull the opponent's weapon away from the front. | Not implemented |
| Net | DS addition | Throws a net projectile. | Not implemented |
| Shield | DS addition | Protects against attacks from the shielded side. | Implemented as a persistent, directional block. |
| Dunce | DS addition | Adds a dunce-hat visual to the holder. | Not implemented |
| Weasel | DS addition | Fires a weasel projectile. | Not implemented |
| Boomerang | DS addition | Throws a boomerang projectile that returns to its holder. | Not implemented |

### Planned start-of-match ruleset selector

Add **Classic** and **DS** choices before local play or room creation. The
selected ruleset should define the legal pickup roster and any rules that differ
between versions. The host's choice is authoritative for online matches: include
the ruleset in the room handshake and initial game state, have the guest display
it as read-only, and validate received pickups against that ruleset. Local
matches use the selected choice directly.

Do not spawn a pickup just because its sprite or roster entry exists. Until its
mechanics are ported and tested, keep it out of that mode's active spawn pool;
show the mode as partial during development rather than silently substituting
another effect. The selector can default to the current DS-style MVP roster
(gun, boots, shield) until each mode's intended items are playable. Expand each
roster as its missing mechanics are implemented, then test both modes locally
and across host/guest connections.

## Build and deploy

Netlify publishes the static `public/` directory directly; there is no build
step or package installation. The project is linked to GitHub, with `main` as
the production branch. Work on a feature branch and verify its Deploy Preview
before merging.

## Current limitations

- The arena and combat loop are still simplified. Movement, player/platform
  collisions, crouching, rolling, player bump reactions, and pit sinking now
  have another tuning pass, but still need playtesting against the DS reference.
  Boots, shields, and a five-shot gun are implemented as a starter pickup set;
  the rest of the original power-ups, sound, and other modes are not implemented.
  Legacy character, platform, rope, power-up, pit, and pickup sprite sheets are included.
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
