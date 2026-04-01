document.addEventListener('DOMContentLoaded', () => {
    // --- State & Config ---
    const state = {
        stack: 'supa',
        userCount: 1000
    };

    // --- Dynamic Pricing Engine ---
    // Assumptions:
    // 1 user = 2 sessions/mo, 50 DB ops/session, 2k AI tokens/session
    const metrics = {
        dbOpsPerUser: 100,
        aiTokensPerUser: 4000,
        computeHoursPerUser: 0.05 // Active aggregate time
    };

    const calculateCosts = (stackId, users) => {
        if (stackId === 'supa') {
            // Fixed Costs
            const renderFee = users <= 100 ? 0 : (users <= 1000 ? 7 : 19);
            const supabaseFee = users <= 100 ? 0 : 25; // Pro plan starts after 1k or manual
            
            // Variable Costs
            const geminiCost = (users * metrics.aiTokensPerUser / 1000000) * 0.5; // $0.50 per 1M tokens
            const bandwidthOverage = users > 5000 ? (users - 5000) * 0.01 : 0; // $0.01 per user over 5k

            return {
                fixed: renderFee + supabaseFee,
                variable: geminiCost + bandwidthOverage,
                total: renderFee + supabaseFee + geminiCost + bandwidthOverage,
                breakdown: `Fixed: $${renderFee} (Render) + $${supabaseFee} (Supabase Pro). Variable: $${geminiCost.toFixed(1)} (Gemini API) + $${bandwidthOverage.toFixed(1)} (Overage).`
            };
        } else {
            // Firebase / GCP (High Variable)
            // Firestores: $0.18 per 100k ops. 10k users = 1M ops = $1.80
            const firestoreCost = (users * metrics.dbOpsPerUser / 100000) * 0.18;
            // Cloud Run: Free tier is huge, then ~$0.00002 per request/second
            const cloudRunCost = users <= 500 ? 0 : (users * 0.005); 
            // Vertex AI: Slightly more expensive for enterprise features
            const vertexCost = (users * metrics.aiTokensPerUser / 1000000) * 1.5; 

            return {
                fixed: 0,
                variable: firestoreCost + cloudRunCost + vertexCost,
                total: firestoreCost + cloudRunCost + vertexCost,
                breakdown: `Fixed: $0. Variable: $${firestoreCost.toFixed(1)} (Firestore) + $${cloudRunCost.toFixed(1)} (Cloud Run) + $${vertexCost.toFixed(1)} (Vertex AI).`
            };
        }
    };

    const data = {
        supa: {
            theme: '#3ecf8e',
            arch: {
                backend: 'Express / Node.js API',
                backendLabel: 'Render / Railway Node Service',
                db: 'PostgreSQL (Supabase)',
                dbLabel: 'SQL / Relational / RLS',
                storage: 'Supabase Storage',
                ai: 'Google Gemini Pro API',
                aiLabel: 'SaaS Generative AI'
            },
            classification: [
                { domain: 'Frontend Hosting', type: 'PaaS', resp: 'Provider: CDN/Builds. Dev: App Code.' },
                { domain: 'Backend Compute', type: 'PaaS', resp: 'Provider: VM/Runtime. Dev: Express Logic.' },
                { domain: 'Database (SQL)', type: 'BaaS', resp: 'Provider: DB Ops/Backups. Dev: Schema/SQL.' },
                { domain: 'AI Service', type: 'SaaS', resp: 'Provider: Model Infra. Dev: Prompts/Keys.' },
                { domain: 'Auth / Storage', type: 'BaaS', resp: 'Provider: Security. Dev: Token/Bucket rules.' }
            ],
            lockin: {
                fin: 'Predicatable billing via flat monthly tiers. High scalability requires Pro plan.',
                proc: 'Low. Standard Express/Postgres skills are universally portable.',
                data: 'Minimal. Standard SQL backups are easy to migrate to any VPS.'
            }
        },
        fire: {
            theme: '#ffca28',
            arch: {
                backend: 'Cloud Run Service',
                backendLabel: 'GCP Containerized Node.js',
                db: 'Cloud Firestore',
                dbLabel: 'NoSQL / Documents / Real-time',
                storage: 'Firebase Storage',
                ai: 'Vertex AI Gemini Pro',
                aiLabel: 'GCP Unified AI Platform'
            },
            classification: [
                { domain: 'Frontend Hosting', type: 'PaaS', resp: 'Provider: GCP Network. Dev: React Build.' },
                { domain: 'Backend Compute', type: 'PaaS (CaaS)', resp: 'Provider: Auto-scaler. Dev: Docker/Image.' },
                { domain: 'Database (NoSQL)', type: 'BaaS/PaaS', resp: 'Provider: Global Dist. Dev: Denormalization.' },
                { domain: 'AI Service', type: 'PaaS', resp: 'Provider: Google Vertex. Dev: Vertex Pipelines.' },
                { domain: 'Auth / Storage', type: 'BaaS', resp: 'Provider: IAM Unified. Dev: Security Rules.' }
            ],
            lockin: {
                fin: 'Risk of "Spike Billing" on Blaze plan if functions or loops are mismanaged.',
                proc: 'High. Deep knowledge of IAM and Vertex SDK is specialized for GCP.',
                data: 'Moderate. Transitioning NoSQL Firestore to SQL is complex and costly.'
            }
        }
    };

    // --- DOM Elements ---
    const btnSupa = document.getElementById('btn-supa');
    const btnFire = document.getElementById('btn-fire');
    const segBtns = document.querySelectorAll('.seg-btn');
    const classBody = document.getElementById('class-body');
    const priceSupa = document.getElementById('price-supa');
    const priceFire = document.getElementById('price-fire');
    const barSupa = document.getElementById('bar-supa');
    const barFire = document.getElementById('bar-fire');
    const boxBackend = document.getElementById('box-backend');
    const labelBackend = document.getElementById('label-backend');
    const boxDatabase = document.getElementById('box-database');
    const boxStorage = document.getElementById('box-storage');
    const boxAi = document.getElementById('box-ai');
    const labelArch = document.getElementById('arch-type-label');
    const lockFin = document.getElementById('lock-fin');
    const lockProc = document.getElementById('lock-proc');
    const lockData = document.getElementById('lock-data');
    const totalTimeLabel = document.getElementById('total-time');
    const noteSupaEl = document.getElementById('note-supa').querySelector('.content');
    const noteFireEl = document.getElementById('note-fire').querySelector('.content');

    // --- Update UI ---
    const updateUI = () => {
        const isSupa = state.stack === 'supa';
        const stack = data[state.stack];

        // 1. Calculate Live Costs
        const sCost = calculateCosts('supa', state.userCount);
        const fCost = calculateCosts('fire', state.userCount);

        // 2. Update Header & Toggles
        btnSupa.classList.toggle('active', isSupa);
        btnFire.classList.toggle('active', !isSupa);

        // 3. Diagram
        boxBackend.textContent = stack.arch.backend;
        labelBackend.textContent = stack.arch.backendLabel;
        boxDatabase.textContent = stack.arch.db;
        boxDatabase.nextElementSibling.textContent = stack.arch.dbLabel;
        boxStorage.textContent = stack.arch.storage;
        boxAi.textContent = stack.arch.ai;
        boxAi.nextElementSibling.textContent = stack.arch.aiLabel;
        labelArch.textContent = isSupa ? "Current Stack: Modular BaaS" : "Alternative: Unified GCP Core";

        // 4. Classification Table
        classBody.innerHTML = stack.classification.map(item => `
            <tr>
                <td><strong>${item.domain}</strong></td>
                <td><span class="badge">${item.type}</span></td>
                <td>${item.resp}</td>
            </tr>
        `).join('');

        // 5. Cost Visualizer
        priceSupa.textContent = `$${Math.round(sCost.total)}`;
        priceFire.textContent = `$${Math.round(fCost.total)}`;

        const maxVal = Math.max(sCost.total, fCost.total, 40);
        barSupa.style.width = `${(sCost.total / maxVal) * 100}%`;
        barFire.style.width = `${(fCost.total / maxVal) * 100}%`;

        noteSupaEl.textContent = sCost.breakdown;
        noteFireEl.textContent = fCost.breakdown;

        document.getElementById('note-supa').style.opacity = isSupa ? "1" : "0.5";
        document.getElementById('note-fire').style.opacity = isSupa ? "0.5" : "1";

        // 6. Lock-in Analysis
        lockFin.textContent = stack.lockin.fin;
        lockProc.textContent = stack.lockin.proc;
        lockData.textContent = stack.lockin.data;

        // 7. Risks
        document.getElementById('risk-current').style.opacity = isSupa ? "1" : "0.4";
        document.getElementById('risk-alt').style.opacity = isSupa ? "0.4" : "1";
        totalTimeLabel.textContent = isSupa ? "Status: Operational" : "~12 Working Days";
    };

    // --- Events ---
    btnSupa.addEventListener('click', () => { state.stack = 'supa'; updateUI(); });
    btnFire.addEventListener('click', () => { state.stack = 'fire'; updateUI(); });

    segBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            segBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.userCount = parseInt(e.target.dataset.val);
            updateUI();
        });
    });

    updateUI();
});
