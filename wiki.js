// Wiki Content Management

const WIKI_CONTENT = {
    rules: `
        <h2>⚓ Game Rules</h2>
        
        <h3>Objective</h3>
        <p>Become the supreme pirate captain by being the last ship standing, collecting treasure map fragments, or amassing gold!</p>

        <h3>Win Conditions</h3>
        <ul>
            <li><strong>Last Ship Standing:</strong> Sink all enemy ships</li>
            <li><strong>Treasure Victory:</strong> Collect ${GAME_CONSTANTS.MAP_FRAGMENTS_TO_WIN} Treasure Map Fragments</li>
            <li><strong>Gold Victory:</strong> Accumulate ${GAME_CONSTANTS.GOLD_WIN_THRESHOLD} gold</li>
        </ul>

        <h3>Turn Structure</h3>
        <ol>
            <li><strong>Priority Roll:</strong> All players roll 2 dice. Highest total goes first.</li>
            <li><strong>Action Phase:</strong> Players take turns performing ONE action each.</li>
            <li><strong>Resolution Phase:</strong> Effects like burn damage are applied.</li>
            <li><strong>Next Round:</strong> Repeat from step 1.</li>
        </ol>

        <h3>Core Mechanics</h3>
        
        <h4>Damage Calculation</h4>
        <p>Damage = (Dice Roll + Attack Bonus + Bonuses) × (1 - Defense%) × (1 - Maneuver%)</p>
        
        <h4>Crew System</h4>
        <p>Each ship has a Crew Capacity. Active crew members can be used for rerolls during attacks. 
        If you gain more crew than your capacity, the extras become inactive but can be activated when active crew are lost.</p>

        <h4>Ammunition</h4>
        <p>You need 1 ammunition to Fire Cannons. Start with ${GAME_CONSTANTS.STARTING_AMMUNITION} ammo. 
        Reload to gain ${GAME_CONSTANTS.RELOAD_AMOUNT} more.</p>

        <h3>Action Consequences</h3>
        <ul>
            <li><strong>Fire Cannons:</strong> Costs 1 ammunition. Some cards add recoil damage.</li>
            <li><strong>Repair:</strong> Can only be used if you took damage since last turn. Reduces active crew by 1 until next turn. Cannot repair on consecutive turns.</li>
            <li><strong>Plunder:</strong> Draw a Loot card. Cannot attack or defend this turn.</li>
            <li><strong>Reload:</strong> Gain ammunition. Cannot Maneuver on your next turn.</li>
            <li><strong>Maneuver:</strong> Reduce next incoming damage. Your next attack loses its Attack Bonus.</li>
        </ul>
    `,

    ships: `
        <h2>⚓ Ships & Captains</h2>
        
        <table class="wiki-table">
            <thead>
                <tr>
                    <th>Ship Name</th>
                    <th>HP</th>
                    <th>Attack</th>
                    <th>Defense</th>
                    <th>Crew</th>
                    <th>Captain Buff</th>
                </tr>
            </thead>
            <tbody>
                ${Object.values(SHIPS).map(ship => `
                    <tr>
                        <td><strong>${ship.name}</strong></td>
                        <td>${ship.hp}</td>
                        <td>+${ship.attackBonus}</td>
                        <td>${ship.defense}%</td>
                        <td>${ship.crewCapacity}</td>
                        <td>
                            <strong>${ship.captainBuff.name}:</strong> 
                            ${ship.captainBuff.description}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h3>Ship Strategies</h3>
        
        <h4>🐍 Black Serpent</h4>
        <p><strong>Playstyle:</strong> Balanced Attacker<br>
        <strong>Strategy:</strong> Use Savvy Captain to get free rerolls. Good for consistent damage output. 
        Balance between attacking and maintaining resources.</p>

        <h4>⛈️ Stormrider</h4>
        <p><strong>Playstyle:</strong> Defensive Tank<br>
        <strong>Strategy:</strong> Use Maneuver frequently with Wave Master for 40% damage reduction. 
        High HP pool allows you to outlast opponents. Focus on survival and counterattacks.</p>

        <h4>🔱 Golden Harpoon</h4>
        <p><strong>Playstyle:</strong> Aggressive Glass Cannon<br>
        <strong>Strategy:</strong> High attack but low HP. Strike fast and hard. 
        Treasure Fiend helps you get powerful cards quickly. End fights before taking too much damage.</p>

        <h4>🦑 Crimson Kraken</h4>
        <p><strong>Playstyle:</strong> Retaliator<br>
        <strong>Strategy:</strong> Vengeful Wrath punishes attackers. Excellent defense makes you a tough target. 
        Force enemies to hurt themselves when attacking you.</p>

        <h4>🌊 Azure Wave</h4>
        <p><strong>Playstyle:</strong> Versatile Healer<br>
        <strong>Strategy:</strong> Master Surgeon gives enhanced healing. Good crew capacity for rerolls. 
        Mix offense and defense. Sustain through long battles.</p>

        <h4>🌑 Silent Corsair</h4>
        <p><strong>Playstyle:</strong> High-Risk High-Reward<br>
        <strong>Strategy:</strong> Lowest HP but highest attack. Shadow Veil can save you from one bad Event. 
        Play aggressively and use the buff wisely for critical moments.</p>
    `,

    actions: `
        <h2>⚓ Actions Guide</h2>

        <h3>🔥 Fire Cannons</h3>
        <p><strong>Cost:</strong> 1 Ammunition<br>
        <strong>Effect:</strong> Roll 2 dice, add Attack Bonus, deal damage to target<br>
        <strong>Tips:</strong> Use crew rerolls for better damage. Save powerful damage cards for critical hits.</p>

        <h3>🔧 Repair</h3>
        <p><strong>Cost:</strong> Reduces active crew by 1 until next turn<br>
        <strong>Effect:</strong> Restore ${GAME_CONSTANTS.BASE_REPAIR_AMOUNT} HP (8 HP for Azure Wave)<br>
        <strong>Restrictions:</strong> Must have taken damage since last turn. Cannot repair on consecutive turns.<br>
        <strong>Tips:</strong> Time your repairs carefully. Don't wait until you're about to sink!</p>

        <h3>💰 Plunder</h3>
        <p><strong>Effect:</strong> Draw 1 Loot card (2 cards for Golden Harpoon, keep 1)<br>
        <strong>Drawback:</strong> Cannot defend or attack while plundering<br>
        <strong>Tips:</strong> Plunder when you're safe or when you desperately need resources.</p>

        <h3>💣 Reload</h3>
        <p><strong>Effect:</strong> Gain ${GAME_CONSTANTS.RELOAD_AMOUNT} ammunition<br>
        <strong>Drawback:</strong> Cannot Maneuver on your next turn<br>
        <strong>Tips:</strong> Reload when you're at safe HP and expect attacks soon.</p>

        <h3>⛵ Maneuver</h3>
        <p><strong>Effect:</strong> Reduce next incoming damage by 20% (40% for Stormrider)<br>
        <strong>Drawback:</strong> Your next attack doesn't add Attack Bonus<br>
        <strong>Restrictions:</strong> Cannot Maneuver the turn after Reloading<br>
        <strong>Tips:</strong> Use when you expect heavy damage. Stack with Hull Plating cards for maximum protection.</p>

        <h3>Crew Rerolls</h3>
        <p>During an attack, you can spend active crew tokens to reroll dice. Each token allows one reroll per attack. 
        Black Serpent gets one free reroll per attack without spending crew!</p>
    `,

    cards: `
        <h2>⚓ Card Database</h2>

        <h3>Action/Item Cards</h3>
        <table class="wiki-table">
            <thead>
                <tr>
                    <th>Card Name</th>
                    <th>Type</th>
                    <th>Effect</th>
                </tr>
            </thead>
            <tbody>
                ${ACTION_CARDS.map(card => `
                    <tr>
                        <td><strong>${card.name}</strong></td>
                        <td>${card.type}</td>
                        <td>${card.description}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h3>Loot Cards</h3>
        <table class="wiki-table">
            <thead>
                <tr>
                    <th>Card Name</th>
                    <th>Type</th>
                    <th>Effect</th>
                </tr>
            </thead>
            <tbody>
                ${LOOT_CARDS.map(card => `
                    <tr>
                        <td><strong>${card.name}</strong></td>
                        <td>${card.type}</td>
                        <td>${card.description}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h3>Event Cards</h3>
        <table class="wiki-table">
            <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Effect</th>
                </tr>
            </thead>
            <tbody>
                ${EVENT_CARDS.map(card => `
                    <tr>
                        <td><strong>${card.name}</strong></td>
                        <td>${card.description}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h3>Starter Cards</h3>
        <p>At game start, each player draws 3 cards from the Starter Deck. 
        These provide small advantages or minor setbacks to keep early game interesting without being unbalanced.</p>
        
        <h4>Positive Starter Cards:</h4>
        <ul>
            ${STARTER_CARDS.filter(c => c.type !== 'Setback').map(card => 
                `<li><strong>${card.name}:</strong> ${card.description}</li>`
            ).join('')}
        </ul>

        <h4>Negative Starter Cards:</h4>
        <ul>
            ${STARTER_CARDS.filter(c => c.type === 'Setback').map(card => 
                `<li><strong>${card.name}:</strong> ${card.description}</li>`
            ).join('')}
        </ul>
    `,

    crew: `
        <h2>⚓ Crew Mechanics</h2>

        <h3>Active vs Inactive Crew</h3>
        <p>Each ship has a Crew Capacity that determines the maximum number of <strong>active</strong> crew members. 
        Active crew provide benefits like rerolls and card synergies.</p>

        <h3>Crew Capacity by Ship</h3>
        <ul>
            ${Object.values(SHIPS).map(ship => 
                `<li><strong>${ship.name}:</strong> ${ship.crewCapacity} crew capacity</li>`
            ).join('')}
        </ul>

        <h3>How Crew Works</h3>
        <ol>
            <li><strong>Rerolls:</strong> Each active crew token allows you to reroll one die during an attack</li>
            <li><strong>Multiple Rerolls:</strong> You can use multiple crew tokens in a single attack</li>
            <li><strong>Inactive Crew:</strong> If you gain more crew than your capacity (via cards), extras become inactive</li>
            <li><strong>Activation:</strong> Inactive crew automatically become active when active crew are lost</li>
        </ol>

        <h3>Crew Management Tips</h3>
        <ul>
            <li>Save crew rerolls for critical attacks or when you roll poorly</li>
            <li>Extra Crew cards are valuable even at max capacity - they provide backup crew</li>
            <li>Repair action temporarily reduces active crew by 1</li>
            <li>Some cards may force you to lose crew, so having inactive crew is insurance</li>
        </ul>

        <h3>Captain Buffs Related to Crew</h3>
        <p><strong>Black Serpent - Savvy Captain:</strong> Once per attack, reroll one die WITHOUT spending crew. 
        This is extremely valuable as it gives you an extra reroll while preserving your crew tokens.</p>

        <h3>Example Scenario</h3>
        <p>Your ship has 3 crew capacity and 3 active crew. You play "Extra Crew" card:</p>
        <ul>
            <li>You now have 3 active crew + 1 inactive crew</li>
            <li>If you lose 1 active crew (e.g., from Repair), the inactive crew becomes active</li>
            <li>You're back to 3 active crew</li>
        </ul>
    `,

    strategy: `
        <h2>⚓ Strategy Tips</h2>

        <h3>General Strategy</h3>
        <ul>
            <li><strong>Resource Management:</strong> Always keep some ammunition. Running out means wasted turns reloading.</li>
            <li><strong>Card Timing:</strong> Don't use powerful cards immediately. Save them for critical moments.</li>
            <li><strong>Target Selection:</strong> Focus fire on one opponent rather than spreading damage.</li>
            <li><strong>Defense Matters:</strong> A well-timed Maneuver or Hull Plating can swing a battle.</li>
            <li><strong>Read the Room:</strong> Pay attention to other players' resources and HP.</li>
        </ul>

        <h3>Early Game (Rounds 1-3)</h3>
        <ul>
            <li>Use starter cards wisely</li>
            <li>Build your hand with Plunder if you drew weak starters</li>
            <li>Don't overcommit to attacks - conserve resources</li>
            <li>Identify which opponents are threats based on their ships</li>
        </ul>

        <h3>Mid Game (Rounds 4-7)</h3>
        <ul>
            <li>Start applying pressure to weaker opponents</li>
            <li>Use powerful cards to secure kills</li>
            <li>Don't ignore your own HP - repair before it's too late</li>
            <li>Watch for players collecting map fragments or gold</li>
        </ul>

        <h3>Late Game (Round 8+)</h3>
        <ul>
            <li>Go for the kill on damaged ships</li>
            <li>Use all your resources - no point saving cards if you're about to sink</li>
            <li>If low on HP, consider a last-ditch Plunder for a healing card</li>
            <li>Block alternative win conditions (stop treasure/gold victories)</li>
        </ul>

        <h3>Card Combos</h3>
        <ul>
            <li><strong>Explosive Shell + Powder Keg:</strong> Massive damage burst (but watch the recoil!)</li>
            <li><strong>Fire Shot + Chain Shot:</strong> Damage + debuff combo</li>
            <li><strong>Hull Plating + Maneuver:</strong> Stacked damage reduction</li>
            <li><strong>Surgeon + Barrels of Rum:</strong> Huge healing turn</li>
        </ul>

        <h3>Ship-Specific Tips</h3>
        
        <h4>Playing Against Each Ship</h4>
        <ul>
            <li><strong>vs Black Serpent:</strong> Expect consistent damage. Use defense to mitigate.</li>
            <li><strong>vs Stormrider:</strong> Hard to damage. Use armor-piercing cards or wait for them to attack.</li>
            <li><strong>vs Golden Harpoon:</strong> Kill them fast before they get powerful cards.</li>
            <li><strong>vs Crimson Kraken:</strong> Each attack costs you HP. Use ranged debuffs like Chain Shot.</li>
            <li><strong>vs Azure Wave:</strong> Hard to keep down due to healing. Focus fire with allies.</li>
            <li><strong>vs Silent Corsair:</strong> Low HP - prioritize as target. Watch for Shadow Veil usage.</li>
        </ul>

        <h3>Common Mistakes to Avoid</h3>
        <ul>
            <li>❌ Running out of ammunition</li>
            <li>❌ Repairing at full HP or without taking damage</li>
            <li>❌ Plundering when you're about to be destroyed</li>
            <li>❌ Forgetting about action consequences (e.g., Maneuver reducing next attack)</li>
            <li>❌ Hoarding cards without playing them</li>
            <li>❌ Ignoring the turn order priority roll</li>
        </ul>

        <h3>Advanced Tactics</h3>
        <ul>
            <li><strong>Priority Manipulation:</strong> Going last can be advantageous to see what others do</li>
            <li><strong>Bluffing:</strong> Sometimes Maneuver when you expect no attack to gain offensive advantage</li>
            <li><strong>Resource Denial:</strong> Use Sabotage on players with big hands</li>
            <li><strong>Alliance & Betrayal:</strong> Team up temporarily, but watch your back!</li>
        </ul>
    `
};

function showWikiSection(section) {
    const wikiContent = document.getElementById('wikiContent');
    wikiContent.innerHTML = WIKI_CONTENT[section] || '<h2>Section not found</h2>';
    
    // Update nav active state
    document.querySelectorAll('.wiki-nav a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

function returnFromWiki() {
    if (window.gameEngine && window.gameEngine.currentPhase !== 'priority') {
        showScreen('gameScreen');
    } else {
        showScreen('mainMenu');
    }
}

// Initialize wiki with rules section
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        showWikiSection('rules');
    }, 100);
});
