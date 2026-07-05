// State variables
let currentUser = null;
let swimmersList = [];
let activeSessionId = null;

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('poolsense_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateNavbar();
    }
    
    // Set up slider values
    updateRangeVal('free-chlorine');
    updateRangeVal('ph-level');
    updateRangeVal('cyanuric-acid');
    
    // Render default swimmers if list is empty
    const savedSwimmers = localStorage.getItem('poolsense_swimmers');
    if (savedSwimmers) {
        swimmersList = JSON.parse(savedSwimmers);
    } else {
        // Sample default swimmer
        swimmersList = [
            {
                id: 'default-bobby',
                name: "Bobby",
                age_group: "child",
                swimming_ability: "average",
                allergies: "chlorine skin allergy",
                asthma_breathing_sensitivity: true,
                sensitive_skin_eczema: true,
                eye_sensitivity: true,
                open_cuts_wounds: false,
                recent_illness: false,
                weak_swimmer: false
            }
        ];
        localStorage.setItem('poolsense_swimmers', JSON.stringify(swimmersList));
    }
    renderSwimmers();
});

// UI Navigation Utilities
function showAuthPage(type) {
    document.getElementById('landing-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    
    if (type === 'login') {
        document.getElementById('login-card').classList.remove('hidden');
        document.getElementById('signup-card').classList.add('hidden');
    } else {
        document.getElementById('login-card').classList.add('hidden');
        document.getElementById('signup-card').classList.remove('hidden');
    }
}

function showDashboard() {
    document.getElementById('landing-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');
}

function getStarted() {
    if (currentUser) {
        showDashboard();
    } else {
        showAuthPage('login');
    }
}

function updateNavbar() {
    if (currentUser) {
        document.getElementById('nav-login-btn').classList.add('hidden');
        document.getElementById('nav-signup-btn').classList.add('hidden');
        document.getElementById('user-greeting').classList.remove('hidden');
        document.getElementById('user-greeting').innerText = `👋 Hello, ${currentUser.name}`;
        document.getElementById('nav-logout-btn').classList.remove('hidden');
    } else {
        document.getElementById('nav-login-btn').classList.remove('hidden');
        document.getElementById('nav-signup-btn').classList.remove('hidden');
        document.getElementById('user-greeting').classList.add('hidden');
        document.getElementById('nav-logout-btn').classList.add('hidden');
    }
}

// Help Guide Card toggle
function toggleHelpGuide() {
    const card = document.getElementById('help-guide');
    card.classList.toggle('hidden');
}

// Slider Handler
function updateRangeVal(id) {
    const val = document.getElementById(id).value;
    document.getElementById(`${id}-val`).innerText = val;
}

// Unknown field toggler
function toggleUnknownField(fieldId) {
    const isUnknown = document.getElementById(`${fieldId}-unknown`).checked;
    const wrap = document.getElementById(`${fieldId}-wrap`);
    const input = wrap.querySelector('input');
    
    if (isUnknown) {
        wrap.classList.add('disabled');
        input.disabled = true;
    } else {
        wrap.classList.remove('disabled');
        input.disabled = false;
    }
}

// Authentication Logic
function handleAuthSubmit(event, type) {
    event.preventDefault();
    if (type === 'login') {
        const email = document.getElementById('login-email').value;
        const name = email.split('@')[0]; // Simple mock name
        currentUser = { email, name: name.charAt(0).toUpperCase() + name.slice(1) };
    } else {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        currentUser = { email, name };
    }
    
    localStorage.setItem('poolsense_user', JSON.stringify(currentUser));
    updateNavbar();
    showDashboard();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('poolsense_user');
    updateNavbar();
    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('landing-screen').classList.remove('hidden');
}

// Swimmer Modal and Controller
function openSwimmerModal(editId = null) {
    document.getElementById('swimmer-modal').style.display = 'flex';
    
    if (editId) {
        document.getElementById('modal-title').innerText = "Edit Swimmer Profile";
        document.getElementById('modal-submit-btn').innerText = "Save Changes";
        document.getElementById('editing-swimmer-id').value = editId;
        
        const swimmer = swimmersList.find(s => s.id === editId);
        if (swimmer) {
            document.getElementById('swimmer-name').value = swimmer.name;
            document.getElementById('age-group').value = swimmer.age_group;
            document.getElementById('swim-ability').value = swimmer.swimming_ability;
            document.getElementById('allergies').value = swimmer.allergies || "";
            document.getElementById('asthma').checked = swimmer.asthma_breathing_sensitivity;
            document.getElementById('eczema').checked = swimmer.sensitive_skin_eczema;
            document.getElementById('eye-sens').checked = swimmer.eye_sensitivity;
            document.getElementById('cuts-wounds').checked = swimmer.open_cuts_wounds;
            document.getElementById('illness').checked = swimmer.recent_illness;
            document.getElementById('weak-swimmer-check').checked = swimmer.weak_swimmer || false;
        }
    } else {
        document.getElementById('modal-title').innerText = "Add Swimmer Profile";
        document.getElementById('modal-submit-btn').innerText = "Add Swimmer";
        document.getElementById('editing-swimmer-id').value = "";
    }
}

function closeSwimmerModal() {
    document.getElementById('swimmer-modal').style.display = 'none';
    document.getElementById('swimmer-form').reset();
    document.getElementById('editing-swimmer-id').value = "";
}

function saveSwimmerProfile(event) {
    event.preventDefault();
    const editId = document.getElementById('editing-swimmer-id').value;
    
    const swimmerData = {
        name: document.getElementById('swimmer-name').value,
        age_group: document.getElementById('age-group').value,
        swimming_ability: document.getElementById('swim-ability').value,
        allergies: document.getElementById('allergies').value || null,
        asthma_breathing_sensitivity: document.getElementById('asthma').checked,
        sensitive_skin_eczema: document.getElementById('eczema').checked,
        eye_sensitivity: document.getElementById('eye-sens').checked,
        open_cuts_wounds: document.getElementById('cuts-wounds').checked,
        recent_illness: document.getElementById('illness').checked,
        weak_swimmer: document.getElementById('weak-swimmer-check').checked
    };
    
    if (editId) {
        // Edit existing
        const idx = swimmersList.findIndex(s => s.id === editId);
        if (idx !== -1) {
            swimmerData.id = editId;
            swimmersList[idx] = swimmerData;
        }
    } else {
        // Add new
        swimmerData.id = 'swimmer-' + Date.now();
        swimmersList.push(swimmerData);
    }
    
    localStorage.setItem('poolsense_swimmers', JSON.stringify(swimmersList));
    renderSwimmers();
    closeSwimmerModal();
}

function deleteSwimmer(id) {
    swimmersList = swimmersList.filter(s => s.id !== id);
    localStorage.setItem('poolsense_swimmers', JSON.stringify(swimmersList));
    renderSwimmers();
}

function renderSwimmers() {
    const container = document.getElementById('swimmer-cards-container');
    container.innerHTML = '';
    
    if (swimmersList.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary); font-size:0.9rem; font-style:italic;">No swimmer profiles added. Add at least one swimmer.</p>';
        return;
    }
    
    swimmersList.forEach(s => {
        const card = document.createElement('div');
        card.className = 'swimmer-card glass';
        
        // Build health badges
        let badgesHTML = `<span class="swimmer-badge-item age">${s.age_group}</span>`;
        badgesHTML += `<span class="swimmer-badge-item ability">${s.swimming_ability}</span>`;
        
        if (s.allergies) {
            badgesHTML += `<span class="swimmer-badge-item allergy" title="${s.allergies}">Allergies</span>`;
        }
        if (s.asthma_breathing_sensitivity) {
            badgesHTML += `<span class="swimmer-badge-item asthma">Asthma</span>`;
        }
        if (s.sensitive_skin_eczema) {
            badgesHTML += `<span class="swimmer-badge-item skin">Eczema</span>`;
        }
        if (s.eye_sensitivity) {
            badgesHTML += `<span class="swimmer-badge-item skin">Eyes</span>`;
        }
        if (s.open_cuts_wounds) {
            badgesHTML += `<span class="swimmer-badge-item danger">Wounds</span>`;
        }
        if (s.recent_illness) {
            badgesHTML += `<span class="swimmer-badge-item danger">Illness</span>`;
        }
        if (s.weak_swimmer) {
            badgesHTML += `<span class="swimmer-badge-item danger">Weak Swim</span>`;
        }
        
        card.innerHTML = `
            <div class="swimmer-card-header">
                <span class="swimmer-card-name">${s.name}</span>
                <div class="swimmer-card-actions">
                    <button class="btn-edit" onclick="openSwimmerModal('${s.id}')">✏️</button>
                    <button class="btn-delete" onclick="deleteSwimmer('${s.id}')">🗑️</button>
                </div>
            </div>
            <div class="swimmer-badge-list">
                ${badgesHTML}
            </div>
        `;
        container.appendChild(card);
    });
}

// Request & API connection
async function submitPoolSenseRequest(confirmAnswer = null) {
    if (swimmersList.length === 0) {
        alert("Please add at least one swimmer profile before running the check.");
        return;
    }
    
    const placeholder = document.getElementById('results-placeholder');
    const loader = document.getElementById('results-loader');
    const content = document.getElementById('results-content');
    
    placeholder.classList.add('hidden');
    loader.classList.remove('hidden');
    content.classList.add('hidden');
    
    try {
        // 1. Create session if we don't have one
        if (!activeSessionId) {
            const sessionResponse = await fetch('/apps/app/users/user/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const sessionData = await sessionResponse.json();
            activeSessionId = sessionData.id;
        }
        
        // 2. Assemble input payload & identify unknown states
        let messageText = "";
        let hasUnknownFields = false;
        
        if (confirmAnswer) {
            messageText = confirmAnswer;
        } else {
            const isFcUnknown = document.getElementById('fc-unknown').checked;
            const isPhUnknown = document.getElementById('ph-unknown').checked;
            const isCyaUnknown = document.getElementById('cya-unknown').checked;
            
            if (isFcUnknown || isPhUnknown || isCyaUnknown) {
                hasUnknownFields = true;
            }
            
            const poolReadings = {
                free_chlorine: isFcUnknown ? null : parseFloat(document.getElementById('free-chlorine').value),
                ph: isPhUnknown ? null : parseFloat(document.getElementById('ph-level').value),
                cyanuric_acid: isCyaUnknown ? null : parseFloat(document.getElementById('cyanuric-acid').value),
                water_clarity: document.getElementById('water-clarity').value,
                strong_chemical_smell: document.getElementById('strong-smell').checked,
                indoor_outdoor: document.getElementById('indoor-outdoor').value,
                recent_rain_heavy_use: document.getElementById('rain-heavy-use').checked,
                contamination_incident: document.getElementById('contamination-incident').checked
            };
            
            // Clean swimmer objects (remove id parameter for validation)
            const cleanSwimmers = swimmersList.map(s => {
                const { id, ...rest } = s;
                return rest;
            });
            
            const fullPayload = {
                pool_readings: poolReadings,
                swimmers: cleanSwimmers
            };
            messageText = JSON.stringify(fullPayload);
        }
        
        // Store unknown state flag temporarily
        sessionStorage.setItem('poolsense_last_check_unknown', hasUnknownFields ? 'true' : 'false');
        
        // 3. Post run request to the agent
        const runResponse = await fetch('/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appName: 'app',
                userId: 'user',
                sessionId: activeSessionId,
                newMessage: {
                    role: 'user',
                    parts: [{ text: messageText }]
                }
            })
        });
        
        if (!runResponse.ok) {
            throw new Error(`HTTP error! status: ${runResponse.status}`);
        }
        
        const events = await runResponse.json();
        loader.classList.add('hidden');
        
        // 4. Inspect events for final results or interrupts
        let finalEvent = null;
        let interruptEvent = null;
        
        for (let i = events.length - 1; i >= 0; i--) {
            const ev = events[i];
            if (ev.interrupt_ids && ev.interrupt_ids.length > 0) {
                interruptEvent = ev;
                break;
            }
            if (ev.output && ev.output.overall_verdict) {
                finalEvent = ev;
                break;
            }
            if (ev.output && typeof ev.output === 'string') {
                finalEvent = ev;
                break;
            }
        }
        
        if (interruptEvent) {
            const confirmMsg = prompt(interruptEvent.content?.parts?.[0]?.text || "The pool chemistry is flagged as dangerously unbalanced! Do you wish to override this warning and show safety advice anyway? (Enter 'yes' to override and proceed, or 'no' to abort):");
            if (confirmMsg) {
                submitPoolSenseRequest(confirmMsg);
            } else {
                submitPoolSenseRequest("no");
            }
            return;
        }
        
        if (finalEvent) {
            const isUnknownResult = sessionStorage.getItem('poolsense_last_check_unknown') === 'true';
            renderResults(finalEvent.output, isUnknownResult);
        } else {
            throw new Error("No safety report returned from agent graph.");
        }
        
    } catch (err) {
        console.error("PoolSense Assessment Error:", err);
        loader.classList.add('hidden');
        placeholder.classList.remove('hidden');
        alert("Failed to connect to pool-sense backend: " + err.message);
    }
}

// Render Results cards
function renderResults(output, isUnknownResult) {
    const content = document.getElementById('results-content');
    content.classList.remove('hidden');
    
    // Warning banner trigger
    const banner = document.getElementById('confidence-warning');
    if (isUnknownResult) {
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
    
    // Check if security blocked
    if (typeof output === 'string') {
        const verdictCard = document.getElementById('card-verdict');
        verdictCard.className = 'result-card glass status-danger';
        document.getElementById('verdict-overall-badge').className = 'badge-status danger';
        document.getElementById('verdict-overall-badge').innerText = 'BLOCKED';
        document.getElementById('pool-assessment-metrics').innerHTML = `<p style="color:var(--color-danger);">${output}</p>`;
        
        document.getElementById('card-swimmers').classList.add('hidden');
        document.getElementById('card-precautions').classList.add('hidden');
        document.getElementById('card-alerts').classList.add('hidden');
        return;
    }
    
    document.getElementById('card-swimmers').classList.remove('hidden');
    document.getElementById('card-precautions').classList.remove('hidden');
    
    // Overall Verdict Badge
    const overallVerdict = output.overall_verdict.toLowerCase();
    const overallBadge = document.getElementById('verdict-overall-badge');
    const verdictCard = document.getElementById('card-verdict');
    
    overallBadge.innerText = overallVerdict === 'not recommended' ? 'Blocked' : overallVerdict;
    
    if (overallVerdict === 'safe') {
        overallBadge.className = 'badge-status safe';
        verdictCard.className = 'result-card glass status-safe';
    } else if (overallVerdict === 'caution') {
        overallBadge.className = 'badge-status caution';
        verdictCard.className = 'result-card glass status-caution';
    } else {
        overallBadge.className = 'badge-status danger';
        verdictCard.className = 'result-card glass status-danger';
    }
    
    // Pool Assessment Details
    const poolAnalysis = output.pool_analysis;
    const metricsContainer = document.getElementById('pool-assessment-metrics');
    
    let poolMetricsHTML = `
        <div class="detail-item"><span>Sanitation Status:</span><span>${poolAnalysis.clarity_sanitation_status}</span></div>
        <div class="detail-item"><span>Chlorine Status:</span><span>${poolAnalysis.chlorine_status}</span></div>
        <div class="detail-item"><span>pH Level Status:</span><span>${poolAnalysis.ph_status}</span></div>
        <div class="detail-item"><span>Cyanuric Acid (CYA):</span><span>${poolAnalysis.stabilizer_status}</span></div>
    `;
    
    if (poolAnalysis.key_warnings && poolAnalysis.key_warnings.length > 0) {
        poolMetricsHTML += `
            <div style="margin-top:1rem; border-top:1px solid var(--card-border); padding-top:0.75rem;">
                <h4 style="font-size:0.85rem; color:var(--color-danger); font-weight:600; margin-bottom:0.25rem;">⚠️ Key Warnings:</h4>
                <ul class="list-styled" style="color:var(--color-danger); font-size:0.8rem;">
                    ${poolAnalysis.key_warnings.map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    metricsContainer.innerHTML = poolMetricsHTML;
    
    // Swimmers Safety Guidance & Reasons
    const swimmerContainer = document.getElementById('swimmers-guidance-container');
    swimmerContainer.innerHTML = '';
    
    output.swimmer_verdicts.forEach(sv => {
        const item = document.createElement('div');
        item.className = 'swimmer-report-item';
        
        const swimmerVerdict = sv.verdict.toLowerCase();
        const statusBadgeClass = swimmerVerdict === 'safe' ? 'safe' : swimmerVerdict === 'caution' ? 'caution' : 'danger';
        
        // Find swimmer details to add context reasons
        const matchingSwimmerObj = swimmersList.find(s => s.name.toLowerCase() === sv.swimmer_name.toLowerCase());
        let reasonExplanation = "";
        
        if (swimmerVerdict === 'not recommended') {
            if (matchingSwimmerObj && matchingSwimmerObj.open_cuts_wounds) {
                reasonExplanation = "⚠️ Swimming is not recommended because this swimmer has active open wounds which pose high risk of infection in pool water.";
            } else if (matchingSwimmerObj && matchingSwimmerObj.recent_illness) {
                reasonExplanation = "⚠️ Swimming is not recommended because this swimmer has had a recent stomach illness and could contaminate the water.";
            } else {
                reasonExplanation = "🚨 Not recommended due to severe chemical deviations in the water.";
            }
        } else if (swimmerVerdict === 'caution') {
            if (matchingSwimmerObj && matchingSwimmerObj.asthma_breathing_sensitivity) {
                reasonExplanation = "💡 Use caution because this swimmer has asthma/respiratory sensitivity which reacts to chemical odors.";
            } else if (matchingSwimmerObj && matchingSwimmerObj.sensitive_skin_eczema) {
                reasonExplanation = "💡 Use caution because this swimmer has sensitive skin/eczema which is highly sensitive to pH variations.";
            } else if (matchingSwimmerObj && matchingSwimmerObj.allergies) {
                reasonExplanation = `💡 Use caution due to active allergies: ${matchingSwimmerObj.allergies}.`;
            } else {
                reasonExplanation = "💡 Caution advised due to moderate chemical fluctuations.";
            }
        } else {
            reasonExplanation = "✅ Swimmer meets all safety criteria with no health vulnerabilities matching current conditions.";
        }
        
        item.innerHTML = `
            <div class="swimmer-report-title">
                <span style="font-weight:600;">${sv.swimmer_name}</span>
                <span class="badge-status ${statusBadgeClass}">${sv.verdict}</span>
            </div>
            <p style="font-size:0.8rem; color:var(--accent-cyan); font-weight:700; margin: 0.25rem 0 0.5rem 0;">
                ${reasonExplanation}
            </p>
            ${sv.risks && sv.risks.length > 0 ? `
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.5rem;">
                    <strong>Hazards:</strong> ${sv.risks.join(', ')}
                </p>
            ` : ''}
            ${sv.guidance && sv.guidance.length > 0 ? `
                <div style="margin-top:0.25rem;">
                    <strong style="font-size:0.8rem; color:var(--text-primary);">Precautions:</strong>
                    <ul class="list-styled" style="margin-top:0.15rem;">
                        ${sv.guidance.map(g => `<li>${g}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
        swimmerContainer.appendChild(item);
    });
    
    // Maintenance Recommendations
    const recsContainer = document.getElementById('maintenance-recs-container');
    recsContainer.innerHTML = '';
    
    if (poolAnalysis.maintenance_recommendations && poolAnalysis.maintenance_recommendations.length > 0) {
        poolAnalysis.maintenance_recommendations.forEach(r => {
            const li = document.createElement('li');
            li.innerText = r;
            recsContainer.appendChild(li);
        });
    } else {
        recsContainer.innerHTML = '<li>Maintain current regular chemistry testing. No immediate balancing actions needed.</li>';
    }
    
    // Manager Alerts
    const alertCard = document.getElementById('card-alerts');
    if (output.manager_alert_required) {
        alertCard.classList.remove('hidden');
        document.getElementById('manager-alert-text').innerText = output.manager_alert_message || 'Unsafe chemical readings flagged. Alert your pool facility manager immediately.';
    } else {
        alertCard.classList.add('hidden');
    }
}
